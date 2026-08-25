import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  await deleteSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
