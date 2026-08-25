import { NextResponse } from "next/server";
import { createSessionToken, registerUser, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { errorResponse } from "@/lib/domain-error";
import { isPasswordAcceptable } from "@/lib/password";

function isCampusEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain === "dlut.edu.cn" || domain?.endsWith(".dlut.edu.cn");
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; email?: string; password?: string; major?: string; grade?: string };
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const major = body.major?.trim() ?? "";
  const grade = body.grade?.trim() ?? "";

  if (name.length < 2 || name.length > 30) return NextResponse.json({ message: "姓名或昵称需要 2–30 个字符" }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email) || !isCampusEmail(email)) return NextResponse.json({ message: "请使用大连理工大学校园邮箱注册" }, { status: 400 });
  if (major.length < 2 || major.length > 40) return NextResponse.json({ message: "请填写有效的专业名称" }, { status: 400 });
  if (grade.length > 20) return NextResponse.json({ message: "年级信息不能超过 20 个字符" }, { status: 400 });
  if (!isPasswordAcceptable(password)) {
    return NextResponse.json({ message: "密码需要 8–72 位，并同时包含字母和数字" }, { status: 400 });
  }

  try {
    const user = await registerUser({ name, email, password, major, grade });
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, await createSessionToken(user, request.headers.get("user-agent")), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
