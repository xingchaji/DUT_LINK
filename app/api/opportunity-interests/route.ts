import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findOpportunity, listOpportunityInterests, setOpportunityInterest } from "@/lib/repositories/opportunity-repository";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ opportunityIds: [] });
  return NextResponse.json({ opportunityIds: await listOpportunityInterests(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后标记参赛意向" }, { status: 401 });
  const body = (await request.json()) as { opportunityId?: string; intended?: boolean };
  const opportunity = body.opportunityId ? await findOpportunity(body.opportunityId) : undefined;
  if (!opportunity) return NextResponse.json({ message: "比赛不存在" }, { status: 404 });
  await setOpportunityInterest(user, opportunity.id, Boolean(body.intended));
  return NextResponse.json({ intended: Boolean(body.intended) });
}
