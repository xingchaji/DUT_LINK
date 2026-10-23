import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rankPeople } from "@/lib/matching";
import { getAbilityProfile } from "@/lib/repositories/account-repository";
import type { GeneratedProfile } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { profile?: GeneratedProfile };
  return NextResponse.json({ matches: rankPeople(body.profile) });
}

export async function GET() {
  const user = await getCurrentUser();
  const abilityProfile = user ? await getAbilityProfile(user.id) : null;
  return NextResponse.json({
    matches: rankPeople(abilityProfile ?? undefined),
    rankedBy: abilityProfile ? "user-profile" : "demo-profile",
  });
}
