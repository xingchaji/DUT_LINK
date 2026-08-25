import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { DomainError } from "@/lib/domain-error";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { SessionUser } from "@/lib/types";
import { SESSION_COOKIE } from "@/lib/auth-constants";

export { SESSION_COOKIE } from "@/lib/auth-constants";
const encoder = new TextEncoder();
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

type SessionPayload = SessionUser & { expiresAt: number };

const demoUsers = [
  { id: "demo-user", name: "陆同学", email: "student@dlut.edu.cn", password: "demo1234", major: "软件工程" },
];

function secret() {
  return process.env.SESSION_SECRET ?? "dut-link-development-secret-change-me";
}

function toBase64Url(value: Uint8Array | string) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  return Buffer.from(bytes).toString("base64url");
}

async function key() {
  return crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function createStatelessSessionToken(user: SessionUser) {
  const payload = toBase64Url(JSON.stringify({ ...user, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 } satisfies SessionPayload));
  const signature = await crypto.subtle.sign("HMAC", await key(), encoder.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

async function verifyStatelessSessionToken(token?: string): Promise<SessionUser | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  try {
    const valid = await crypto.subtle.verify("HMAC", await key(), Buffer.from(signature, "base64url"), encoder.encode(payload));
    if (!valid) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    if (session.expiresAt < Date.now()) return null;
    return { id: session.id, name: session.name, email: session.email, major: session.major };
  } catch {
    return null;
  }
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

function toSessionUser(user: { id: string; name: string; email: string; major: string | null }): SessionUser {
  return { id: user.id, name: user.name, email: user.email, major: user.major ?? "专业待补充" };
}

export async function createSessionToken(user: SessionUser) {
  const prisma = getPrisma();
  if (!prisma) return createStatelessSessionToken(user);
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: { userId: user.id, tokenHash: tokenHash(token), expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000) },
  });
  return token;
}

export async function verifySessionToken(token?: string): Promise<SessionUser | null> {
  if (!token) return null;
  const prisma = getPrisma();
  if (!prisma) return verifyStatelessSessionToken(token);
  try {
    const session = await prisma.session.findUnique({ where: { tokenHash: tokenHash(token) }, include: { user: true } });
    if (!session) return null;
    if (session.expiresAt <= new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }
    return toSessionUser(session.user);
  } catch {
    return null;
  }
}

export async function deleteSessionToken(token?: string) {
  if (!token) return;
  const prisma = getPrisma();
  if (prisma) await prisma.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
}

export async function getCurrentUser() {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

function authenticateDemoUser(email: string, password: string): SessionUser | null {
  const user = demoUsers.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
  return user ? { id: user.id, name: user.name, email: user.email, major: user.major } : null;
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  const prisma = getPrisma();
  if (!prisma) return authenticateDemoUser(email, password);
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) return null;
  return toSessionUser(user);
}

export async function registerUser(input: { name: string; email: string; password: string; major: string; grade?: string }): Promise<SessionUser> {
  const prisma = getPrisma();
  if (!prisma) throw new DomainError("注册功能需要 PostgreSQL 持久化模式", 503);
  const passwordHash = await hashPassword(input.password);
  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        major: input.major,
        grade: input.grade || null,
        skillTags: [],
      },
    });
    return toSessionUser(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new DomainError("该校园邮箱已经注册", 409);
    throw error;
  }
}
