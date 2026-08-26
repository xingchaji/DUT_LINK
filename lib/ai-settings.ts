import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getPrisma } from "@/lib/db";
import { ensureUser } from "@/lib/repositories/account-repository";
import { store } from "@/lib/store";
import type { AISettingsView, SessionUser } from "@/lib/types";

export type AIRequestConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

type StoredAISetting = {
  enabled: boolean;
  apiKeyEncrypted: string | null;
  baseUrl: string;
  model: string;
};

const defaultBaseUrl = () => process.env.AI_BASE_URL?.trim().replace(/\/$/, "") ?? "";
const defaultModel = () => process.env.AI_MODEL?.trim() ?? "";

function getEncryptionKey() {
  const dedicatedSecret = process.env.AI_SETTINGS_ENCRYPTION_KEY?.trim();
  if (!dedicatedSecret && process.env.NODE_ENV === "production") {
    throw new Error("AI_SETTINGS_ENCRYPTION_KEY 未配置");
  }
  const secret = dedicatedSecret || process.env.SESSION_SECRET?.trim();
  return createHash("sha256").update(secret || "dut-link-local-development-only").digest();
}

function encryptApiKey(apiKey: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

function decryptApiKey(payload: string | null) {
  if (!payload) return null;
  try {
    const [version, iv, tag, ciphertext] = payload.split(".");
    if (version !== "v1" || !iv || !tag || !ciphertext) return null;
    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

async function findStoredAISetting(userId: string): Promise<StoredAISetting | null> {
  const prisma = getPrisma();
  if (!prisma) return store.aiSettings[userId] ?? null;
  return prisma.aISetting.findUnique({ where: { userId }, select: { enabled: true, apiKeyEncrypted: true, baseUrl: true, model: true } });
}

function toView(setting: StoredAISetting | null): AISettingsView {
  const apiKey = decryptApiKey(setting?.apiKeyEncrypted ?? null);
  return {
    enabled: setting?.enabled ?? false,
    hasApiKey: Boolean(apiKey),
    keyHint: apiKey ? `••••${apiKey.slice(-4)}` : null,
    baseUrl: setting?.baseUrl || defaultBaseUrl(),
    model: setting?.model || defaultModel(),
  };
}

export async function getAISettingsView(userId: string) {
  return toView(await findStoredAISetting(userId));
}

export async function saveAISettings(user: SessionUser, input: { enabled: boolean; apiKey?: string; clearApiKey?: boolean; baseUrl: string; model: string }) {
  const existing = await findStoredAISetting(user.id);
  const apiKeyEncrypted = input.clearApiKey
    ? null
    : input.apiKey
      ? encryptApiKey(input.apiKey)
      : existing?.apiKeyEncrypted ?? null;
  const next: StoredAISetting = {
    enabled: input.enabled,
    apiKeyEncrypted,
    baseUrl: input.baseUrl,
    model: input.model,
  };
  const prisma = getPrisma();
  if (!prisma) {
    const now = new Date().toISOString();
    store.aiSettings[user.id] = { ...next, createdAt: store.aiSettings[user.id]?.createdAt ?? now, updatedAt: now };
    return toView(next);
  }
  await ensureUser(user);
  const record = await prisma.aISetting.upsert({
    where: { userId: user.id },
    update: next,
    create: { userId: user.id, ...next },
    select: { enabled: true, apiKeyEncrypted: true, baseUrl: true, model: true },
  });
  return toView(record);
}

export function getEnvironmentAIConfig(): AIRequestConfig | null {
  const apiKey = process.env.AI_API_KEY?.trim();
  const baseUrl = defaultBaseUrl();
  const model = defaultModel();
  return apiKey && baseUrl && model ? { apiKey, baseUrl, model } : null;
}

export async function resolveAIConfig(userId?: string | null): Promise<AIRequestConfig | null> {
  if (!userId) return getEnvironmentAIConfig();
  const setting = await findStoredAISetting(userId);
  if (!setting?.enabled) return null;
  const apiKey = decryptApiKey(setting.apiKeyEncrypted);
  return apiKey && setting.baseUrl && setting.model ? { apiKey, baseUrl: setting.baseUrl, model: setting.model } : null;
}
