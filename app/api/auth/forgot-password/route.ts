import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth";
import { errorResponse } from "@/lib/domain-error";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim() ?? "";
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ message: "请填写有效的校园邮箱" }, { status: 400 });
  }
  try {
    const token = await requestPasswordReset(email);
    // 无论邮箱是否注册都返回相同提示，避免枚举已注册邮箱
    const payload: { message: string; resetToken?: string } = { message: "如果该邮箱已注册，重置链接已生成" };
    // 尚未接入邮件服务前，开发环境直接返回 token 便于验证；生产环境需通过邮件送达
    if (token && process.env.NODE_ENV !== "production") {
      payload.resetToken = token;
    }
    return NextResponse.json(payload);
  } catch (error) {
    return errorResponse(error);
  }
}
