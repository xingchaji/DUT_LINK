import { NextResponse } from "next/server";
import { rankPeople } from "@/lib/matching";
import type { GeneratedProfile } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { profile?: GeneratedProfile };
  return NextResponse.json({ matches: rankPeople(body.profile) });
}

export async function GET() {
  return NextResponse.json({ matches: rankPeople() });
}
