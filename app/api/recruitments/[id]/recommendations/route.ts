import { NextResponse } from "next/server";
import { recommendPeopleForRecruitment } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后查看队友推荐" }, { status: 401 });
  const { id } = await context.params;
  const recruitment = store.recruitments.find((item) => item.id === id);
  if (!recruitment) return NextResponse.json({ message: "队伍不存在" }, { status: 404 });
  if (recruitment.ownerId !== user.id) return NextResponse.json({ message: "只有队长可以查看本队推荐" }, { status: 403 });
  const opportunity = store.opportunities.find((item) => item.id === recruitment.opportunityId);
  if (!opportunity) return NextResponse.json({ message: "比赛不存在" }, { status: 404 });
  return NextResponse.json(await recommendPeopleForRecruitment(opportunity, recruitment));
}
