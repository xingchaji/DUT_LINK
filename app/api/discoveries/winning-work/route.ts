import { NextResponse } from "next/server";
import { generateWinningWorkInsight } from "@/lib/ai";
import { resolveAIConfig } from "@/lib/ai-settings";
import { getCurrentUser } from "@/lib/auth";
import { getAbilityProfile, getAccountProfile } from "@/lib/repositories/account-repository";

export async function GET(request: Request) {
  const previous = new URL(request.url).searchParams.get("exclude");
  const user = await getCurrentUser();
  const [profile, abilityProfile, aiConfig] = await Promise.all([
    user ? getAccountProfile(user) : undefined,
    user ? getAbilityProfile(user.id) : null,
    resolveAIConfig(user?.id),
  ]);
  return NextResponse.json(await generateWinningWorkInsight(previous, profile, aiConfig, abilityProfile));
}
