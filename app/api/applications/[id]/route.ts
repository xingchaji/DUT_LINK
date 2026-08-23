import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { findCompetitionMembership } from "@/lib/team-membership";
import { getTeamMemberSummary } from "@/lib/people";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后处理申请" }, { status: 401 });
  const { id } = await context.params;
  const application = store.applications.find((item) => item.id === id);
  if (!application) return NextResponse.json({ message: "申请不存在" }, { status: 404 });
  const recruitment = store.recruitments.find((item) => item.id === application.recruitmentId);
  if (!recruitment || recruitment.ownerId !== user.id) return NextResponse.json({ message: "无权处理该申请" }, { status: 403 });
  if (application.status !== "pending") return NextResponse.json({ message: "该申请已经处理" }, { status: 409 });
  const body = (await request.json()) as { status?: "accepted" | "rejected" };
  if (!body.status || !["accepted", "rejected"].includes(body.status)) return NextResponse.json({ message: "无效状态" }, { status: 400 });
  if (body.status === "accepted" && recruitment.currentSize >= recruitment.capacity) return NextResponse.json({ message: "队伍人数已满" }, { status: 409 });
  if (body.status === "accepted") {
    const membership = findCompetitionMembership(application.applicantId, recruitment.opportunityId);
    if (membership && membership.recruitment.id !== recruitment.id) return NextResponse.json({ message: "该申请人已经加入本场比赛的其他队伍" }, { status: 409 });
  }
  application.status = body.status;
  if (body.status === "accepted") {
    recruitment.currentSize += 1;
    if (!recruitment.members.some((member) => member.userId === application.applicantId)) {
      recruitment.members.push(getTeamMemberSummary(application.applicantId, { name: application.applicantName, major: application.applicantMajor }));
    }
  }
  return NextResponse.json({ application, teamSize: recruitment.currentSize });
}
