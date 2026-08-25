import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAccountProfile } from "@/lib/repositories/account-repository";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  const profile = await getAccountProfile(user);
  return NextResponse.json({ user: { ...user, name: profile.nickname, major: profile.major } });
}
