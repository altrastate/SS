import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const ALUMNI_COOKIE = "jico_alumni_session";
const SESSION_HOURS = 12;

export type AlumniSession = {
  sub: string;
  email: string;
  name: string;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAlumniToken(session: AlumniSession) {
  return new SignJWT({ ...session, role: "alumni", typ: "alumni" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
}

export async function getAlumniSession() {
  const jar = await cookies();
  const token = jar.get(ALUMNI_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.typ !== "alumni" || payload.role !== "alumni" || !payload.sub) return null;
    const account = await prisma.alumniAccount.findUnique({ where: { id: String(payload.sub) } });
    if (!account || account.status === "disabled" || account.status === "pending_verification") return null;
    return {
      sub: account.id,
      email: account.email,
      name: account.name,
      status: account.status,
    };
  } catch {
    return null;
  }
}

export function alumniCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  };
}
