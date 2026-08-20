import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import type { RecruitmentPost } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ recruitments: store.recruitments });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后发布招募" }, { status: 401 });
  const body = (await request.json()) as Partial<RecruitmentPost> & { neededSkills?: string[] };
  if (!body.opportunityId || !body.opportunityTitle || !body.teamName || !body.description) {
    return NextResponse.json({ message: "比赛、队伍名称和招募说明不能为空" }, { status: 400 });
  }
  const capacity = Math.max(2, Math.min(12, Number(body.capacity) || 4));
  const post: RecruitmentPost = {
    id: crypto.randomUUID(),
    opportunityId: body.opportunityId,
    opportunityTitle: body.opportunityTitle,
    teamName: body.teamName.trim(),
    ownerName: user.name,
    ownerId: user.id,
    description: body.description.trim(),
    neededSkills: (body.neededSkills ?? []).map((item) => item.trim()).filter(Boolean).slice(0, 8),
    currentSize: 1,
    capacity,
    contact: "站内联系",
    createdAt: new Date().toISOString(),
    applicants: 0,
  };
  store.recruitments.unshift(post);
  return NextResponse.json({ recruitment: post }, { status: 201 });
}
