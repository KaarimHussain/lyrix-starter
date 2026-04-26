import { createHmac, timingSafeEqual } from "crypto";

export const LX_ADMIN_SESSION_COOKIE = "lx_admin_session";

export const LX_ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

type LxAdminSessionPayload = {
  lxProjectId: string;
  projectId: string;
  iat: number;
  exp: number;
};

type CreateLxAdminSessionInput = {
  lxProjectId: string;
  projectId: string;
};

const MIN_SESSION_SECRET_LENGTH = 32;

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSessionSecret() {
  const secret = process.env.LX_ADMIN_SESSION_SECRET;

  if (!secret || secret.length < MIN_SESSION_SECRET_LENGTH) {
    throw new Error(
      "LX_ADMIN_SESSION_SECRET must be set to a random string of at least 32 characters."
    );
  }

  return secret;
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function signaturesMatch(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function isValidPayload(payload: unknown): payload is LxAdminSessionPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Partial<LxAdminSessionPayload>;

  return (
    typeof candidate.lxProjectId === "string" &&
    /^lx-prj-[a-z0-9]{7}$/.test(candidate.lxProjectId) &&
    typeof candidate.projectId === "string" &&
    candidate.projectId.length > 0 &&
    typeof candidate.iat === "number" &&
    typeof candidate.exp === "number"
  );
}

export function createLxAdminSessionToken({
  lxProjectId,
  projectId,
}: CreateLxAdminSessionInput) {
  const now = Math.floor(Date.now() / 1000);
  const payload: LxAdminSessionPayload = {
    lxProjectId,
    projectId,
    iat: now,
    exp: now + LX_ADMIN_SESSION_MAX_AGE,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyLxAdminSessionToken(token: string) {
  try {
    const [encodedPayload, signature, extra] = token.split(".");

    if (!encodedPayload || !signature || extra) {
      return null;
    }

    const expectedSignature = signPayload(encodedPayload);

    if (!signaturesMatch(signature, expectedSignature)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    if (!isValidPayload(payload)) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
