"use strict";

/**
 * Discord proxy header verifier for nginx auth_request.
 *
 * nginx forwards each incoming request's headers to this service.
 *   204 -> request is authentic, nginx serves it
 *   401 -> anything else, nginx rejects it
 *
 * Fails closed: any error, missing header, or malformed value results in 401.
 * No dependencies; uses only Node's built-in crypto and http modules.
 */

const http = require("http");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3001);
const PUBLIC_KEY_HEX = (process.env.DISCORD_PUBLIC_KEY || "").trim();

// Developer Portal -> your app -> General Information -> Public Key (64 hex chars)
if (!/^[0-9a-fA-F]{64}$/.test(PUBLIC_KEY_HEX)) {
  console.error("DISCORD_PUBLIC_KEY is missing or is not a 64-character hex string");
  process.exit(1);
}

// Wrap the raw 32-byte Ed25519 key in the standard SPKI DER header Node expects
const SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");
const publicKey = crypto.createPublicKey({
  key: Buffer.concat([SPKI_PREFIX, Buffer.from(PUBLIC_KEY_HEX, "hex")]),
  format: "der",
  type: "spki",
});

const MAX_HEADER_LEN = 8192;

// Discord's own docs show the signature decoded as hex in the Python example
// and as base64 in the JavaScript example. An Ed25519 signature is 64 bytes,
// so we accept either encoding and tell them apart by length and alphabet.
function decodeSignature(value) {
  let buf;
  if (/^[0-9a-fA-F]{128}$/.test(value)) {
    buf = Buffer.from(value, "hex");
  } else if (/^[A-Za-z0-9+/]{86}==$/.test(value) || /^[A-Za-z0-9_-]{86}(==)?$/.test(value)) {
    buf = Buffer.from(value, "base64");
  } else {
    return null;
  }
  return buf.length === 64 ? buf : null;
}

function verify(headers) {
  const signature = headers["x-signature-ed25519"];
  const timestamp = headers["x-signature-timestamp"];
  const payloadB64 = headers["x-discord-proxy-payload"];

  if (!signature || !timestamp || !payloadB64) return "missing proxy headers";
  if (payloadB64.length > MAX_HEADER_LEN || signature.length > 256 || timestamp.length > 32) {
    return "header too large";
  }

  const sigBytes = decodeSignature(signature);
  if (!sigBytes) return "malformed signature";

  const payloadBytes = Buffer.from(payloadB64, "base64");
  if (payloadBytes.length === 0) return "empty payload";

  // Signature is over the decoded payload bytes
  if (!crypto.verify(null, payloadBytes, publicKey, sigBytes)) return "invalid signature";

  // Only trust the payload contents after the signature has been verified
  const payload = JSON.parse(payloadBytes.toString("utf8"));

  if (String(payload.created_at) !== timestamp) return "timestamp mismatch";
  if (
    typeof payload.expires_at !== "number" ||
    payload.expires_at < Math.floor(Date.now() / 1000)
  ) {
    return "expired proxy token";
  }

  return null; // valid
}

const server = http.createServer((req, res) => {
  // Used by the Docker healthcheck only; nginx never routes outside traffic here
  if (req.url === "/healthz") {
    res.writeHead(200).end("ok");
    return;
  }

  let failure;
  try {
    failure = verify(req.headers);
  } catch (err) {
    failure = "verification error";
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
