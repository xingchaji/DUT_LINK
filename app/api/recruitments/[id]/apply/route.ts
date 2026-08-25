import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { isRecruitmentActive } from "@/lib/matching";
import { findCompetitionMembership } from "@/lib/team-membership";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后报名" }, { status: 401 });
  const { id } = await context.params;
  const recruitment = store.recruitments.find((item) => item.id === id);
  if (!recruitment) return NextResponse.json({ message: "招募信息不存在" }, { status: 404 });
  const membership = findCompetitionMembership(user.id, recruitment.opportunityId);
  if (membership) return NextResponse.json({ message: membership.role === "captain" ? "你已经是本场比赛另一支队伍的队长" : "你已经加入本场比赛的一支队伍" }, { status: 409 });
  if (recruitment.ownerId === user.id) return NextResponse.json({ message: "不能申请加入自己发布的队伍" }, { status: 400 });
  if (!isRecruitmentActive(recruitment)) return NextResponse.json({ message: recruitment.currentSize >= recruitment.capacity ? "队伍人数已满" : "该队伍招募已经截止" }, { status: 409 });
  if (store.applications.some((item) => item.recruitmentId === id && item.applicantId === user.id)) {
    return NextResponse.json({ message: "你已经报名过该队伍" }, { status: 409 });
  }
  const body = (await request.json()) as { message?: string };
  const account = store.accountProfiles.find((item) => item.userId === user.id);
  const application = {
    id: crypto.randomUUID(),
    recruitmentId: id,
    applicantId: user.id,
    applicantName: account?.nickname ?? user.name,
    applicantMajor: account?.major ?? user.major,
    message: body.message?.trim() || "希望加入队伍，一起完成项目。",
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };
  store.applications.push(application);
  recruitment.applicants += 1;

  // 通知队长：收到新申请
  store.notifications.push({
    id: crypto.randomUUID(),
    userId: recruitment.ownerId,
    type: "application_received",
    title: "收到新申请",
    body: `${application.applicantName} 申请加入「${recruitment.teamName}」`,
    relatedId: application.id,
    read: false,
    createdAt: application.createdAt,
  });

  return NextResponse.json({ ok: true, applicants: recruitment.applicants, application });
}
