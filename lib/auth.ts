import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { DomainError } from "@/lib/domain-error";
import { hashPassword, verifyPassword } from "@/lib/password";
import { store } from "@/lib/store";
import type { SessionUser } from "@/lib/types";
import { SESSION_COOKIE } from "@/lib/auth-constants";

export { SESSION_COOKIE } from "@/lib/auth-constants";
const encoder = new TextEncoder();
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

type SessionPayload = SessionUser & { expiresAt: number };

const demoUsers = [
  { id: "demo-user", name: "陆同学", email: "student@dlut.edu.cn", password: "demo1234", major: "软件工程", role: "student" as const },
  { id: "zhou-yu", name: "周宇", email: "zhouyu@dlut.edu.cn", password: "demo1234", major: "建筑学", role: "student" as const },
  { id: "admin-user", name: "平台管理员", email: "admin@dlut.edu.cn", password: "demo1234", major: "平台运营", role: "admin" as const },
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
    return { id: session.id, name: session.name, email: session.email, major: session.major, role: session.role === "admin" ? "admin" : "student" };
  } catch {
    return null;
  }
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

function toSessionUser(user: { id: string; name: string; email: string; major: string | null; role?: string | null }): SessionUser {
  return { id: user.id, name: user.name, email: user.email, major: user.major ?? "专业待补充", role: user.role === "admin" ? "admin" : "student" };
}

export async function createSessionToken(user: SessionUser, userAgent?: string | null) {
  const prisma = getPrisma();
  if (!prisma) return createStatelessSessionToken(user);
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: { userId: user.id, tokenHash: tokenHash(token), expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000), userAgent: userAgent?.slice(0, 200) ?? null },
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

async function authenticateMemoryUser(email: string, password: string): Promise<SessionUser | null> {
  const user = demoUsers.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
  if (user) return { id: user.id, name: user.name, email: user.email, major: user.major, role: user.role };
  const registeredUser = store.authUsers.find((item) => item.email === email.trim().toLowerCase());
  if (!registeredUser || !(await verifyPassword(password, registeredUser.passwordHash))) return null;
  return { id: registeredUser.id, name: registeredUser.name, email: registeredUser.email, major: registeredUser.major, role: registeredUser.role };
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  const prisma = getPrisma();
  if (!prisma) return authenticateMemoryUser(email, password);
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) return null;
  return toSessionUser(user);
}

export async function registerUser(input: { name: string; email: string; password: string; major: string; grade?: string }): Promise<SessionUser> {
  const prisma = getPrisma();
  const passwordHash = await hashPassword(input.password);
  if (!prisma) {
    const email = input.email.trim().toLowerCase();
    if (demoUsers.some((item) => item.email.toLowerCase() === email) || store.authUsers.some((item) => item.email === email)) {
      throw new DomainError("该校园邮箱已经注册", 409);
    }
    const user: SessionUser = { id: `memory-${crypto.randomUUID()}`, name: input.name, email, major: input.major, role: "student" };
    store.authUsers.push({ ...user, passwordHash, role: "student" });
    store.accountProfiles.push({
      userId: user.id,
      nickname: user.name,
      email: user.email,
      major: user.major,
      grade: input.grade ?? "",
      contact: "",
      bio: "",
      skills: [],
      updatedAt: new Date().toISOString(),
    });
    return user;
  }
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

export type SessionDevice = {
  id: string;
  createdAt: string;
  expiresAt: string;
  userAgent: string | null;
  isCurrent: boolean;
};

export async function listSessions(userId: string, currentToken?: string): Promise<SessionDevice[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  const currentHash = currentToken ? tokenHash(currentToken) : null;
  const sessions = await prisma.session.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return sessions.map((session) => ({
    id: session.id,
    createdAt: session.createdAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
    userAgent: session.userAgent,
    isCurrent: session.tokenHash === currentHash,
  }));
}

export async function deleteSessionById(userId: string, sessionId: string) {
  const prisma = getPrisma();
  if (!prisma) return;
  await prisma.session.deleteMany({ where: { id: sessionId, userId } });
}

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

export async function requestPasswordReset(email: string): Promise<string | null> {
  const prisma = getPrisma();
  if (!prisma) throw new DomainError("找回密码需要 PostgreSQL 持久化模式", 503);
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user?.passwordHash) return null;
  const token = randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: tokenHash(token), expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });
  return token;
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const prisma = getPrisma();
  if (!prisma) throw new DomainError("找回密码需要 PostgreSQL 持久化模式", 503);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: tokenHash(token) } });
  if (!record || record.used || record.expiresAt <= new Date()) throw new DomainError("重置链接无效或已过期", 400);
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ]);
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new DomainError("请先登录", 401);
  if (user.role !== "admin") throw new DomainError("需要管理员权限", 403);
  return user;
}
