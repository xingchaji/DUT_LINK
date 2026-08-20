import { NextResponse } from "next/server";
import { analyzeProfile, getAIStatus } from "@/lib/ai";
import type { ProfileInput } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getAIStatus());
}

export async function POST(request: Request) {
  const input = (await request.json()) as Partial<ProfileInput>;

  if (!input.major || !input.experiences) {
    return NextResponse.json({ message: "请填写专业和至少一段经历" }, { status: 400 });
  }

  return NextResponse.json(
    await analyzeProfile({
      name: input.name ?? "新同学",
      major: input.major,
      grade: input.grade ?? "",
      bio: input.bio ?? "",
      experiences: input.experiences,
      interests: input.interests ?? "",
      awards: input.awards ?? "",
      achievements: input.achievements ?? "",
      githubRepos: input.githubRepos ?? "",
    }),
  );
}
