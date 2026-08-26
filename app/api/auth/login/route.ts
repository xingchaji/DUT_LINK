import { NextResponse } from "next/server";
import { authenticateUser, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { clearFailures, isLocked, recordFailure, remainingLockMs } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    if (email && isLocked(email)) {
      return NextResponse.json({ message: `登录失败次数过多，请在 ${Math.ceil(remainingLockMs(email) / 60000)} 分钟后重试` }, { status: 429 });
    }
    const user = await authenticateUser(email, body.password ?? "");
    if (!user) {
      if (email) recordFailure(email);
      return NextResponse.json({ message: "邮箱或密码不正确" }, { status: 401 });
    }
    if (email) clearFailures(email);

    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE, await createSessionToken(user, request.headers.get("user-agent")), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error("Login route failed", error);
    return NextResponse.json({ message: "登录服务暂时不可用，请确认数据库迁移完成并重启开发服务" }, { status: 500 });
  }
}
