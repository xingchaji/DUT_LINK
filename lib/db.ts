import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalDatabase = globalThis as typeof globalThis & { __dutLinkPrisma?: PrismaClient };

export function databaseConfigured() {
  return process.env.DATA_BACKEND !== "memory" && Boolean(process.env.DATABASE_URL);
}

export function getPrisma() {
  if (!databaseConfigured()) return null;
  if (!globalDatabase.__dutLinkPrisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    globalDatabase.__dutLinkPrisma = new PrismaClient({ adapter });
  }
  return globalDatabase.__dutLinkPrisma;
}

export function getDataBackendStatus() {
  return { backend: databaseConfigured() ? "postgresql" : "memory", persistent: databaseConfigured() } as const;
}

export async function checkDatabaseConnection() {
  const prisma = getPrisma();
  if (!prisma) return { ...getDataBackendStatus(), connected: true, message: "使用内存演示仓库" };
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ...getDataBackendStatus(), connected: true, message: "PostgreSQL 连接正常" };
  } catch {
    return { ...getDataBackendStatus(), connected: false, message: "已配置 PostgreSQL，但当前无法连接" };
  }
}
