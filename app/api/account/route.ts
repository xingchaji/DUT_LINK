import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAbilityProfile, getAccountProfile, saveAccountProfile } from "@/lib/repositories/account-repository";
import type { UserAccountProfile } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后查看个人主页" }, { status: 401 });
  const [profile, abilityProfile] = await Promise.all([getAccountProfile(user), getAbilityProfile(user.id)]);
  return NextResponse.json({ profile, abilityProfile });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后更新个人资料" }, { status: 401 });
  const body = (await request.json()) as Partial<UserAccountProfile>;
  if (!body.nickname?.trim() || !body.major?.trim()) return NextResponse.json({ message: "昵称和专业不能为空" }, { status: 400 });
  const next: UserAccountProfile = {
    userId: user.id, email: user.email, nickname: body.nickname.trim().slice(0, 24), major: body.major.trim().slice(0, 40),
    grade: body.grade?.trim().slice(0, 20) ?? "", contact: body.contact?.trim().slice(0, 100) ?? "",
    bio: body.bio?.trim().slice(0, 500) ?? "", skills: (body.skills ?? []).map((item) => item.trim()).filter(Boolean).slice(0, 12), updatedAt: new Date().toISOString(),
  };
  return NextResponse.json({ profile: await saveAccountProfile(user, next) });
}
