import { NextResponse } from "next/server";
import { generateDiscoveryBox } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { resolveAIConfig } from "@/lib/ai-settings";
import { getAccountProfile } from "@/lib/repositories/account-repository";

export async function GET(request: Request) {
  const previous = new URL(request.url).searchParams.get("exclude");
  const user = await getCurrentUser();
  const profile = user ? await getAccountProfile(user) : undefined;
  const aiConfig = await resolveAIConfig(user?.id);
  return NextResponse.json(await generateDiscoveryBox(previous, profile, aiConfig));
}
