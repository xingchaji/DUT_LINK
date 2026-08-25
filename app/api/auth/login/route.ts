import { NextResponse } from "next/server";
import { authenticateUser, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const user = await authenticateUser(body.email?.trim() ?? "", body.password ?? "");
  if (!user) return NextResponse.json({ message: "邮箱或密码不正确" }, { status: 401 });

  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
