import { NextResponse } from "next/server";
import { authenticateDemoUser, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const user = authenticateDemoUser(body.email?.trim() ?? "", body.password ?? "");
  if (!user) return NextResponse.json({ message: "邮箱或密码不正确" }, { status: 401 });

  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
