import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { matches } from "@/lib/mock-data";
import { store } from "@/lib/store";
import type { TeamInvitation } from "@/lib/types";
import { isRecruitmentActive } from "@/lib/matching";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后查看邀请" }, { status: 401 });
  const decorate = (item: TeamInvitation) => {
    const recruitment = store.recruitments.find((post) => post.id === item.recruitmentId);
    return { ...item, teamName: recruitment?.teamName ?? "未知队伍", opportunityTitle: recruitment?.opportunityTitle ?? "未知比赛" };
  };
  return NextResponse.json({ sent: store.invitations.filter((item) => item.senderId === user.id).map(decorate), received: store.invitations.filter((item) => item.recipientId === user.id).map(decorate) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后发送邀请" }, { status: 401 });
  const body = (await request.json()) as { recipientId?: string; opportunityId?: string; message?: string };
  const person = matches.find((item) => item.id === body.recipientId);
  const recruitment = store.recruitments.find((item) => item.ownerId === user.id && item.opportunityId === body.opportunityId);
  if (!person) return NextResponse.json({ message: "推荐用户不存在" }, { status: 404 });
  if (!recruitment) return NextResponse.json({ message: "请先在本场比赛创建队伍，再发送邀请" }, { status: 400 });
  if (!person.interestedOpportunityIds?.includes(recruitment.opportunityId)) return NextResponse.json({ message: "该同学尚未表达本场比赛意向" }, { status: 409 });
  if (!isRecruitmentActive(recruitment)) return NextResponse.json({ message: "当前队伍已满员或超过招募截止日期" }, { status: 409 });
  const duplicate = store.invitations.find((item) => item.recruitmentId === recruitment.id && item.recipientId === person.id && item.status === "pending");
  if (duplicate) return NextResponse.json({ message: "已经向该同学发送过邀请" }, { status: 409 });
  const invitation: TeamInvitation = {
    id: crypto.randomUUID(), recruitmentId: recruitment.id, opportunityId: recruitment.opportunityId,
    senderId: user.id, senderName: user.name, recipientId: person.id, recipientName: person.name,
    message: body.message?.trim() || `邀请你加入「${recruitment.teamName}」共同参赛。`, status: "pending", createdAt: new Date().toISOString(),
  };
  store.invitations.unshift(invitation);

  // 通知被邀请人
  store.notifications.push({
    id: crypto.randomUUID(),
    userId: person.id,
    type: "invitation_received",
    title: "收到组队邀请",
    body: `${user.name} 邀请你加入「${recruitment.teamName}」`,
    relatedId: invitation.id,
    read: false,
    createdAt: invitation.createdAt,
  });

  return NextResponse.json({ invitation }, { status: 201 });
}
