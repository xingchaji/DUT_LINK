import { NextResponse } from "next/server";
import { generateDiscoveryBox } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";

export async function GET(request: Request) {
  const previous = new URL(request.url).searchParams.get("exclude");
  const user = await getCurrentUser();
  const profile = user ? store.accountProfiles.find((item) => item.userId === user.id) : undefined;
  return NextResponse.json(await generateDiscoveryBox(previous, profile));
}
