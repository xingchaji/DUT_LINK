import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, listSessions, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请先登录" }, { status: 401 });
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return NextResponse.json({ sessions: await listSessions(user.id, token) });
}
