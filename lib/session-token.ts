import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const SESSION_COOKIE = "adm_session";

export type SessionPayload = {
  apiToken: string;
  email: string;
  name: string;
  userId: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET não configurado");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.apiToken !== "string"
    ) {
      return null;
    }
    return {
      apiToken: payload.apiToken,
      email: payload.email,
      name: payload.name,
      userId: payload.userId,
    };
  } catch {
    return null;
  }
}
