import { NextResponse } from "next/server";
import { findPersonProfile } from "@/lib/people";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const person = findPersonProfile(id);
  if (!person) return NextResponse.json({ message: "用户不存在" }, { status: 404 });
  return NextResponse.json({ person });
}
