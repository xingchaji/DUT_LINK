import { NextResponse } from "next/server";
import { isRecruitmentActive } from "@/lib/matching";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const opportunity = store.opportunities.find((item) => item.id === id);
  if (!opportunity) return NextResponse.json({ message: "比赛不存在" }, { status: 404 });
  const user = await getCurrentUser();
  return NextResponse.json({
    opportunity,
    recruitments: store.recruitments.filter((item) => item.opportunityId === id && isRecruitmentActive(item)),
    ownedRecruitment: user ? store.recruitments.find((item) => item.opportunityId === id && item.ownerId === user.id) ?? null : null,
  });
}
