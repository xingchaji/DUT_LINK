import { NextResponse } from "next/server";
import { generateProfile } from "@/lib/profile-generator";
import type { ProfileInput } from "@/lib/types";

export async function POST(request: Request) {
  const input = (await request.json()) as Partial<ProfileInput>;

  if (!input.major || !input.experiences) {
    return NextResponse.json({ message: "请填写专业和至少一段经历" }, { status: 400 });
  }

  return NextResponse.json(
    generateProfile({
      name: input.name ?? "新同学",
      major: input.major,
      grade: input.grade ?? "",
      bio: input.bio ?? "",
      experiences: input.experiences,
      interests: input.interests ?? "",
    }),
  );
}

