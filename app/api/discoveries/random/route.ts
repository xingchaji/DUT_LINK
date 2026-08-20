import { NextResponse } from "next/server";
import { discoveries } from "@/lib/mock-data";

export async function GET(request: Request) {
  const previous = new URL(request.url).searchParams.get("exclude");
  const candidates = discoveries.filter((item) => item.id !== previous);
  const discovery = candidates[Math.floor(Math.random() * candidates.length)] ?? discoveries[0];
  return NextResponse.json({ discovery });
}
