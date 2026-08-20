import { NextResponse } from "next/server";
import { rankOpportunities } from "@/lib/opportunity-ranking";
import { store } from "@/lib/store";
import type { GeneratedProfile } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { profile?: GeneratedProfile };
  return NextResponse.json({ opportunities: rankOpportunities(body.profile, store.opportunities), rankedBy: "evidence-based-profile" });
}
