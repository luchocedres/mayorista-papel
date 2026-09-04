import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "cambiar-este-secreto-en-produccion";
const COOKIE_NAME = "newpel_session";

export interface SessionPayload {
  userId: string;
  rol: "COMERCIANTE" | "ADMIN";
  nombreComercio: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export function getSessionFromCookies(): SessionPayload | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

/** Helper para usar en API routes: exige sesión, opcionalmente un rol específico */
export async function requireSession(rol?: "ADMIN" | "COMERCIANTE") {
  const session = getSessionFromCookies();
  if (!session) throw new Error("NO_AUTENTICADO");
  if (rol && session.rol !== rol) throw new Error("NO_AUTORIZADO");
  // Verificamos que el usuario siga existiendo/activo
  const user = await prisma.usuario.findUnique({ where: { id: session.userId } });
  if (!user || !user.activo) throw new Error("NO_AUTENTICADO");
  return { session, user };
}
