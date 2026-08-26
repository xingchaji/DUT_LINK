import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/auth";
import { errorResponse } from "@/lib/domain-error";
import { isPasswordAcceptable } from "@/lib/password";

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string; password?: string };
  const token = body.token?.trim() ?? "";
  const password = body.password ?? "";
  if (!token) return NextResponse.json({ message: "缺少重置令牌" }, { status: 400 });
  if (!isPasswordAcceptable(password)) return NextResponse.json({ message: "密码需要 8–72 位，并同时包含字母和数字" }, { status: 400 });
  try {
    await resetPasswordWithToken(token, password);
    return NextResponse.json({ message: "密码已重置，请使用新密码登录" });
  } catch (error) {
    return errorResponse(error);
  }
}
