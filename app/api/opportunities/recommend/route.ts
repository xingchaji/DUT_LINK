import { NextResponse } from "next/server";
import { rankOpportunities } from "@/lib/opportunity-ranking";
import { listOpportunities } from "@/lib/repositories/opportunity-repository";
import type { GeneratedProfile } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { profile?: GeneratedProfile };
  return NextResponse.json({ opportunities: rankOpportunities(body.profile, await listOpportunities()), rankedBy: "evidence-based-profile" });
}
