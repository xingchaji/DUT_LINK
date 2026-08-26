import { NextResponse } from "next/server";
import { recommendPeopleForRecruitment } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { resolveAIConfig } from "@/lib/ai-settings";
import { findOpportunity, findRecruitment } from "@/lib/repositories/opportunity-repository";
import { listRecruitmentCandidates } from "@/lib/repositories/recommendation-repository";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后查看队友推荐" }, { status: 401 });
  const { id } = await context.params;
  const recruitment = await findRecruitment(id);
  if (!recruitment) return NextResponse.json({ message: "队伍不存在" }, { status: 404 });
  if (recruitment.ownerId !== user.id) return NextResponse.json({ message: "只有队长可以查看本队推荐" }, { status: 403 });
  const opportunity = await findOpportunity(recruitment.opportunityId);
  if (!opportunity) return NextResponse.json({ message: "比赛不存在" }, { status: 404 });
  const excludedUserIds = [...new Set([recruitment.ownerId, ...recruitment.members.map((member) => member.userId)])];
  const [candidates, aiConfig] = await Promise.all([
    listRecruitmentCandidates(opportunity.id, excludedUserIds),
    resolveAIConfig(user.id),
  ]);
  return NextResponse.json(await recommendPeopleForRecruitment(opportunity, recruitment, candidates, aiConfig));
}
