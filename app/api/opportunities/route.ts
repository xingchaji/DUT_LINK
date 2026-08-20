import { NextResponse } from "next/server";
import { rankOpportunities } from "@/lib/opportunity-ranking";
import type { GeneratedProfile } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ opportunities: rankOpportunities(), rankedBy: "evidence-based-profile" });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { profile?: GeneratedProfile };
  return NextResponse.json({ opportunities: rankOpportunities(body.profile), rankedBy: "evidence-based-profile" });
}
