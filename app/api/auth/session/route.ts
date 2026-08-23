import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  const profile = store.accountProfiles.find((item) => item.userId === user.id);
  return NextResponse.json({ user: { ...user, name: profile?.nickname ?? user.name, major: profile?.major ?? user.major } });
}
