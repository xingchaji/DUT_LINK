import { NextResponse } from "next/server";
import { generateDiscoveryBox } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { getAccountProfile } from "@/lib/repositories/account-repository";

export async function GET(request: Request) {
  const previous = new URL(request.url).searchParams.get("exclude");
  const user = await getCurrentUser();
  const profile = user ? await getAccountProfile(user) : undefined;
  return NextResponse.json(await generateDiscoveryBox(previous, profile));
}
