"use strict";

/**
 * Discord Activity session verifier for nginx auth_request.
 *
 *   204 -> the request belongs to a real, active instance of the Activity
 *   401 -> anything else
 *
 * A request is accepted when it carries either:
 *   1. an instance_id (in the original URL query, or in the Referer), or
 *   2. a signed session cookie this service issued earlier.
 * Either way the instance must currently exist according to Discord's Activity
 * Instance API (GET /applications/<app id>/activity-instances/<instance id>).
 *
 * The cookie exists for requests that cannot carry an instance_id, most
 * importantly WebSocket handshakes. It is bound to one instance and is useless
 * once Discord reports that instance as gone. It is re-issued (sliding window)
 * whenever it is older than COOKIE_REFRESH_AFTER_SECONDS.
 *
 * Fails closed: a missing id, a 404, a timeout, or any other error means 401.
 * No dependencies; uses Node's built-in http, crypto and fetch.
 */

const http = require("http");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3001);
const APP_ID = (process.env.DISCORD_APPLICATION_ID || "").trim();
const BOT_TOKEN = (process.env.DISCORD_BOT_TOKEN || "").trim();
const COOKIE_SECRET = process.env.COOKIE_SECRET || "";
const API_BASE = (process.env.DISCORD_API_BASE || "https://discord.com/api").replace(/\/+$/, "");
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_SECONDS || 60) * 1000;
const COOKIE_MAX_AGE = Number(process.env.COOKIE_MAX_AGE_SECONDS || 12 * 3600);
const COOKIE_REFRESH_AFTER = Number(process.env.COOKIE_REFRESH_AFTER_SECONDS || 3600);
const COOKIE_DOMAIN = (process.env.COOKIE_DOMAIN || `${APP_ID}.discordsays.com`).trim();
const LOG_ACCEPTS = process.env.LOG_ACCEPTS === "true";
const COOKIE_NAME = "activity_session";
const API_TIMEOUT_MS = 3000;
const MAX_CACHE_ENTRIES = 1000;

if (!/^\d{15,25}$/.test(APP_ID)) {
  console.error("DISCORD_APPLICATION_ID is missing or is not a numeric id");
  process.exit(1);
}
if (!BOT_TOKEN) {
  console.error("DISCORD_BOT_TOKEN is missing");
  process.exit(1);
}
if (COOKIE_SECRET.length < 32) {
  console.error(
    "COOKIE_SECRET is missing or shorter than 32 characters (try: openssl rand -hex 32)",
  );
  process.exit(1);
}

// Instance ids look like i-<launch>-gc-<guild>-<channel>. Only allow a safe
// character set (no dots, so it is also safe inside the cookie format).
const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

/* ---------- instance id extraction ---------- */

function instanceIdFrom(urlLike) {
  if (!urlLike) return null;
  try {
    const id = new URL(urlLike, "http://placeholder").searchParams.get("instance_id");
    return id && ID_RE.test(id) ? id : null;
  } catch {
    return null;
  }
}

// nginx passes the original URL in X-Original-URI. Requests for assets and
// matchmaking carry the Activity URL in the Referer instead.
function extractInstanceId(headers) {
  return instanceIdFrom(headers["x-original-uri"]) || instanceIdFrom(headers["referer"]);
}

/* ---------- Discord instance lookup (cached) ---------- */

async function instanceIsActive(id) {
  const res = await fetch(
    `${API_BASE}/applications/${APP_ID}/activity-instances/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    },
  );
  if (res.status === 404) return false;
  if (res.status !== 200) throw new Error(`discord api returned ${res.status}`);

  const body = await res.json();
  return body.instance_id === id && body.application_id === APP_ID;
}

const validUntil = new Map(); // instance id -> expiry (ms)
const inFlight = new Map(); // instance id -> Promise<boolean>

async function isValid(id) {
  const expiry = validUntil.get(id);
  if (expiry && expiry > Date.now()) return true;
  validUntil.delete(id);

  if (inFlight.has(id)) return inFlight.get(id);

  const lookup = instanceIsActive(id)
    .then((ok) => {
      if (ok) {
        if (validUntil.size >= MAX_CACHE_ENTRIES) {
          const now = Date.now();
          for (const [k, v] of validUntil) if (v <= now) validUntil.delete(k);
          if (validUntil.size >= MAX_CACHE_ENTRIES) validUntil.clear();
        }
        validUntil.set(id, Date.now() + CACHE_TTL_MS);
      }
      return ok;
    })
    .finally(() => inFlight.delete(id));

  inFlight.set(id, lookup);
  return lookup;
}

/* ---------- session cookie ---------- */

const nowSec = () => Math.floor(Date.now() / 1000);

function sign(id, iat) {
  return crypto.createHmac("sha256", COOKIE_SECRET).update(`v1.${id}.${iat}`).digest("base64url");
}

function makeCookie(id) {
  const iat = nowSec();
  const value = `v1.${id}.${iat}.${sign(id, iat)}`;
  return [
    `${COOKIE_NAME}=${value}`,
    "Path=/",
    `Domain=${COOKIE_DOMAIN}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    "Secure",
    "HttpOnly",
    "SameSite=None",
    "Partitioned",
  ].join("; ");
}

// Returns { id, age } for a correctly signed, unexpired cookie, else null.
function readSession(cookieHeader) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0 || part.slice(0, eq).trim() !== COOKIE_NAME) continue;

    const [version, id, iatStr, mac] = part
      .slice(eq + 1)
      .trim()
      .split(".");
    if (version !== "v1" || !ID_RE.test(id || "") || !/^\d{1,12}$/.test(iatStr || "") || !mac)
      return null;

    const expected = Buffer.from(sign(id, iatStr));
    const given = Buffer.from(mac);
    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;

    const age = nowSec() - Number(iatStr);
    if (age < -60 || age > COOKIE_MAX_AGE) return null;
    return { id, age };
  }
  return null;
}

/* ---------- request handling ---------- */

const pathOnly = (h) =>
  String(h["x-original-uri"] || "")
    .split("?")[0]
    .slice(0, 120);

const server = http.createServer(async (req, res) => {
  // Used by the Docker healthcheck only; nginx never routes outside traffic here
  if (req.url === "/healthz") {
    res.writeHead(200).end("ok");
    return;
  }

  const h = req.headers;
  let failure = null;
  let via = null;
  let setCookie = null;

  try {
    const session = readSession(h.cookie);
    const requestId = extractInstanceId(h);
    const id = requestId || (session && session.id);

    if (!id) {
      failure = "no instance_id and no valid session cookie";
    } else if (!(await isValid(id))) {
      failure = `instance not found: ${id}`;
    } else {
      via = requestId ? "instance_id" : "cookie";
      // Issue a cookie if there is none for this instance, or it is getting old
      if (!session || session.id !== id || session.age > COOKIE_REFRESH_AFTER) {
        setCookie = makeCookie(id);
      }
    }
  } catch (err) {
    failure = `lookup failed: ${err.message}`;
  }

  const ws = h["sec-websocket-key"] ? "ws" : "http";

  if (failure) {
    const cookiePresent = h.cookie && h.cookie.includes(`${COOKIE_NAME}=`) ? "present" : "absent";
    console.warn(`rejected: ${failure} [${ws}, cookie ${cookiePresent}] ${pathOnly(h)}`);
    res.writeHead(401).end();
    return;
  }

  if (setCookie) console.log(`issued session cookie [${ws}, via ${via}] ${pathOnly(h)}`);
  else if (LOG_ACCEPTS) console.log(`accepted [${ws}, via ${via}] ${pathOnly(h)}`);

  res.writeHead(204, setCookie ? { "Set-Cookie": setCookie } : {}).end();
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`discord verifier listening on :${PORT}`);
});
