import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { RecruitmentPost } from "@/lib/types";
import { getAccountProfile } from "@/lib/repositories/account-repository";
import { listActiveRecruitments } from "@/lib/repositories/opportunity-repository";
import { createRecruitment, findCompetitionMembership } from "@/lib/repositories/team-repository";
import { errorResponse } from "@/lib/domain-error";

export async function GET() {
  return NextResponse.json({ recruitments: await listActiveRecruitments() });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后发布招募" }, { status: 401 });
  const body = (await request.json()) as Partial<RecruitmentPost> & { neededSkills?: string[] };
  if (!body.opportunityId || !body.opportunityTitle || !body.teamName || !body.contact || !body.requirements || !body.recruitmentDeadline) {
    return NextResponse.json({ message: "比赛、队伍名称、队长联系方式、招募要求和截止日期不能为空" }, { status: 400 });
  }
  if (!body.neededSkills?.map((item) => item.trim()).filter(Boolean).length) return NextResponse.json({ message: "请至少添加一个招募技能标签" }, { status: 400 });
  if (body.requirements.trim().length < 8) return NextResponse.json({ message: "请更具体地描述招募能力、职责或投入要求（至少 8 个字）" }, { status: 400 });
  const membership = await findCompetitionMembership(user.id, body.opportunityId);
  if (membership) return NextResponse.json({ message: membership.role === "captain" ? "同一场比赛只能发布一个招募队伍" : "你已加入本场比赛的其他队伍，不能再创建队伍" }, { status: 409 });
  const capacity = Math.max(2, Math.min(12, Number(body.capacity) || 4));
  if (new Date(`${body.recruitmentDeadline}T23:59:59`) < new Date()) {
    return NextResponse.json({ message: "招募截止日期不能早于今天" }, { status: 400 });
  }
  const account = await getAccountProfile(user);
  const post: RecruitmentPost = {
    id: crypto.randomUUID(),
    opportunityId: body.opportunityId,
    opportunityTitle: body.opportunityTitle,
    teamName: body.teamName.trim(),
    ownerName: account.nickname,
    ownerId: user.id,
    description: body.description?.trim() ?? "",
    projectDirection: body.projectDirection?.trim() ?? "",
    expectedAvailability: body.expectedAvailability?.trim() ?? "",
    requirements: body.requirements.trim(),
    neededSkills: (body.neededSkills ?? []).map((item) => item.trim()).filter(Boolean).slice(0, 8),
    currentSize: 1,
    capacity,
    contact: body.contact.trim(),
    members: [{ userId: user.id, name: account.nickname, major: account.major, grade: account.grade, skills: account.skills }],
    recruitmentDeadline: body.recruitmentDeadline,
    createdAt: new Date().toISOString(),
    applicants: 0,
  };
  try {
    return NextResponse.json({ recruitment: await createRecruitment(user, post) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
