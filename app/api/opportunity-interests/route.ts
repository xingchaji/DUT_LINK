import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ opportunityIds: [] });
  return NextResponse.json({ opportunityIds: store.opportunityInterests.filter((item) => item.userId === user.id).map((item) => item.opportunityId) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后标记参赛意向" }, { status: 401 });
  const body = (await request.json()) as { opportunityId?: string; intended?: boolean };
  const opportunity = store.opportunities.find((item) => item.id === body.opportunityId);
  if (!opportunity) return NextResponse.json({ message: "比赛不存在" }, { status: 404 });
  const index = store.opportunityInterests.findIndex((item) => item.userId === user.id && item.opportunityId === opportunity.id);
  if (body.intended && index < 0) store.opportunityInterests.push({ userId: user.id, opportunityId: opportunity.id, createdAt: new Date().toISOString() });
  if (!body.intended && index >= 0) store.opportunityInterests.splice(index, 1);
  return NextResponse.json({ intended: Boolean(body.intended) });
}
