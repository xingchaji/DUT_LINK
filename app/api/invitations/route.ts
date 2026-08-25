import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createInvitation, listInvitations } from "@/lib/repositories/team-repository";
import { errorResponse } from "@/lib/domain-error";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后查看邀请" }, { status: 401 });
  return NextResponse.json(await listInvitations(user.id));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后发送邀请" }, { status: 401 });
  const body = (await request.json()) as { recipientId?: string; opportunityId?: string; message?: string };
  if (!body.recipientId || !body.opportunityId) return NextResponse.json({ message: "推荐用户和比赛不能为空" }, { status: 400 });
  try {
    return NextResponse.json({ invitation: await createInvitation(user, body.recipientId, body.opportunityId, body.message) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
