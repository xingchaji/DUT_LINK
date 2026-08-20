import { NextResponse } from "next/server";
import { rankPeopleForOpportunity } from "@/lib/matching";
import { store } from "@/lib/store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const opportunity = store.opportunities.find((item) => item.id === id);
  if (!opportunity) return NextResponse.json({ message: "比赛不存在" }, { status: 404 });
  return NextResponse.json({
    opportunity,
    recruitments: store.recruitments.filter((item) => item.opportunityId === id),
    recommendedPeople: rankPeopleForOpportunity(opportunity),
  });
}
