import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findOpportunity, findOwnedRecruitment, listActiveRecruitments } from "@/lib/repositories/opportunity-repository";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const opportunity = await findOpportunity(id);
  if (!opportunity) return NextResponse.json({ message: "比赛不存在" }, { status: 404 });
  const user = await getCurrentUser();
  const [recruitments, ownedRecruitment] = await Promise.all([listActiveRecruitments(id), user ? findOwnedRecruitment(user.id, id) : Promise.resolve(undefined)]);
  return NextResponse.json({
    opportunity,
    recruitments,
    ownedRecruitment: ownedRecruitment ?? null,
  });
}
