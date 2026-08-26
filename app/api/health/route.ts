import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/db";
import { getAIStatus } from "@/lib/ai";
import { getEnvironmentAIConfig } from "@/lib/ai-settings";

export async function GET() {
  const database = await checkDatabaseConnection();
  return NextResponse.json({ ok: database.connected, database, ai: getAIStatus(getEnvironmentAIConfig()) }, { status: database.connected ? 200 : 503 });
}
