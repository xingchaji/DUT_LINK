import { cookies } from "next/headers";
import type { SessionUser } from "@/lib/types";
import { SESSION_COOKIE } from "@/lib/auth-constants";

export { SESSION_COOKIE } from "@/lib/auth-constants";
const encoder = new TextEncoder();

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

export async function createSessionToken(user: SessionUser) {
  const payload = toBase64Url(JSON.stringify({ ...user, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 } satisfies SessionPayload));
  const signature = await crypto.subtle.sign("HMAC", await key(), encoder.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token?: string): Promise<SessionUser | null> {
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

export async function getCurrentUser() {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export function authenticateDemoUser(email: string, password: string): SessionUser | null {
  const user = demoUsers.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
  return user ? { id: user.id, name: user.name, email: user.email, major: user.major } : null;
}
