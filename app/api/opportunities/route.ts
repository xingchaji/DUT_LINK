import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rankOpportunities, sortOpportunitiesByRegistration } from "@/lib/opportunity-ranking";
import type { Opportunity } from "@/lib/types";
import { createOpportunity, listActiveRecruitments, listOpportunities, listOpportunityInterests } from "@/lib/repositories/opportunity-repository";

export async function GET() {
  const user = await getCurrentUser();
  const [opportunities, activeRecruitments, intendedOpportunityIds] = await Promise.all([listOpportunities(), listActiveRecruitments(), user ? listOpportunityInterests(user.id) : Promise.resolve([])]);
  const counts = Object.fromEntries(opportunities.map((item) => [item.id, activeRecruitments.filter((post) => post.opportunityId === item.id).length]));
  return NextResponse.json({
    overview: sortOpportunitiesByRegistration(opportunities),
    recommended: rankOpportunities(undefined, opportunities),
    recruitmentCounts: counts,
    rankedBy: "evidence-based-profile",
    intendedOpportunityIds,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后发布校内比赛" }, { status: 401 });
  const body = (await request.json()) as Partial<Opportunity> & { tags?: string[] };
  if (!body.title?.trim() || !body.organizer?.trim() || !body.description?.trim() || !body.registrationStart) {
    return NextResponse.json({ message: "名称、组织方、报名开始时间和说明不能为空" }, { status: 400 });
  }
  const allowedTypes: Opportunity["type"][] = ["学术竞赛", "体育比赛", "文艺比赛", "创新创业", "项目", "社区"];
  const type = allowedTypes.includes(body.type as Opportunity["type"]) ? body.type as Opportunity["type"] : "学术竞赛";
  const opportunity: Opportunity = {
    id: crypto.randomUUID(),
    title: body.title.trim(),
    organizer: body.organizer.trim(),
    type,
    status: "校内用户发布 · 待核验",
    deadline: body.registrationEnd ? `${body.registrationEnd} 报名截止` : "报名截止时间待补充",
    fit: 0,
    description: body.description.trim(),
    tags: (body.tags ?? []).map((item) => item.trim()).filter(Boolean).slice(0, 8),
    sourceName: `${user.name} 发布`,
    sourceUrl: "#",
    verifiedAt: "待校内组织核验",
    bonusPolicy: "用户发布活动不默认关联综测加分",
    accent: "cyan",
    registrationStart: body.registrationStart,
    registrationEnd: body.registrationEnd ?? null,
    eventDate: body.eventDate ?? null,
    scope: "校内",
    verification: "pending",
    publisherId: user.id,
    publisherName: user.name,
  };
  return NextResponse.json({ opportunity: await createOpportunity(opportunity, user) }, { status: 201 });
}
