import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rankOpportunities, sortOpportunitiesByRegistration } from "@/lib/opportunity-ranking";
import { store } from "@/lib/store";
import { isRecruitmentActive } from "@/lib/matching";
import type { Opportunity } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  const activeRecruitments = store.recruitments.filter((post) => isRecruitmentActive(post));
  const counts = Object.fromEntries(store.opportunities.map((item) => [item.id, activeRecruitments.filter((post) => post.opportunityId === item.id).length]));
  return NextResponse.json({
    overview: sortOpportunitiesByRegistration(store.opportunities),
    recommended: rankOpportunities(undefined, store.opportunities),
    recruitmentCounts: counts,
    rankedBy: "evidence-based-profile",
    intendedOpportunityIds: user ? store.opportunityInterests.filter((item) => item.userId === user.id).map((item) => item.opportunityId) : [],
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
  store.opportunities.push(opportunity);
  return NextResponse.json({ opportunity }, { status: 201 });
}
