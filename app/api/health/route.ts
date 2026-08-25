import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/db";
import { getAIStatus } from "@/lib/ai";

export async function GET() {
  const database = await checkDatabaseConnection();
  return NextResponse.json({ ok: database.connected, database, ai: getAIStatus() }, { status: database.connected ? 200 : 503 });
}
