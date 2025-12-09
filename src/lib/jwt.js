import crypto from "crypto";

// Encode an object to base64url
function base64urlEncode(obj) {
  const json = typeof obj === "string" ? obj : JSON.stringify(obj);
  return Buffer.from(json)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// Create an HMAC SHA256 signature
function createSignature(data, secret) {
  return base64urlEncode(
    crypto.createHmac("sha256", secret).update(data).digest()
  );
}

export function signJWT(payload, secret, expiresInSeconds = 60 * 60 * 24 * 7) {
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }

  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const encodedHeader = base64urlEncode(header);
  const encodedPayload = base64urlEncode(fullPayload);
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createSignature(data, secret);

  return `${data}.${signature}`;
}

export function verifyJWT(token, secret) {
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }

  if (!token || typeof token !== "string" || !token.includes(".")) {
    throw new Error("Invalid token");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = createSignature(data, secret);

  // Basic timing-safe comparison
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid signature");
  }

  const payloadJson = Buffer.from(
    encodedPayload.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf8");

  const payload = JSON.parse(payloadJson);
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp < now) {
    throw new Error("Token expired");
  }

  return payload;
}
