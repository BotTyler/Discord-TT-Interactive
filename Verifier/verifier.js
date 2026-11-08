"use strict";

/**
 * Discord Activity session verifier for nginx auth_request.
 *
 * nginx asks this service about every request before it reaches the backend.
 *   204 -> the request belongs to a real, active instance of the Activity
 *   401 -> anything else
 *
 * How it decides: it reads the Activity's instance_id from the request, then
 * asks Discord's Activity Instance API whether that instance exists
 * (GET /applications/<app id>/activity-instances/<instance id>, bot token).
 *
 * Fails closed: a missing id, a 404, a timeout, or any other error means 401.
 * No dependencies; uses Node's built-in http and fetch.
 */

const http = require("http");

const PORT = Number(process.env.PORT || 3001);
const APP_ID = (process.env.DISCORD_APPLICATION_ID || "").trim();
const BOT_TOKEN = (process.env.DISCORD_BOT_TOKEN || "").trim();
const API_BASE = (process.env.DISCORD_API_BASE || "https://discord.com/api").replace(/\/+$/, "");
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_SECONDS || 60) * 1000;
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

// Instance ids look like i-<launch>-gc-<guild>-<channel>. Only allow a safe
// character set so the value can never alter the API path we call.
const INSTANCE_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

function instanceIdFrom(urlLike) {
  if (!urlLike) return null;
  try {
    const id = new URL(urlLike, "http://placeholder").searchParams.get("instance_id");
    return id && INSTANCE_ID_RE.test(id) ? id : null;
  } catch {
    return null;
  }
}

// nginx passes the original request URL in X-Original-URI (page loads carry
// instance_id in their query string). Requests for assets and API calls may not,
// so the Referer, which is also forwarded to this service, is checked as a fallback.
function extractInstanceId(headers) {
  return instanceIdFrom(headers["x-original-uri"]) || instanceIdFrom(headers["referer"]);
}

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

// Short-lived cache of validated instances so each asset request does not
// trigger a call to Discord. In-flight lookups are shared between requests.
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

const server = http.createServer(async (req, res) => {
  // Used by the Docker healthcheck only; nginx never routes outside traffic here
  console.info("Received request for verification");
  if (req.url === "/healthz") {
    res.writeHead(200).end("ok");
    return;
  }

  let failure = null;
  try {
    const id = extractInstanceId(req.headers);
    if (!id) {
      failure = "no instance_id in request";
    } else if (!(await isValid(id))) {
      failure = `instance not found: ${id}`;
    }
  } catch (err) {
    failure = `lookup failed: ${err.message}`;
  }

  if (failure) {
    console.warn(`rejected: ${failure}`);
    res.writeHead(401).end();
    return;
  }

  res.writeHead(204).end();
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`discord verifier listening on :${PORT}`);
});
