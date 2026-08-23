import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import type { UserAccountProfile } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后查看个人主页" }, { status: 401 });
  const profile = store.accountProfiles.find((item) => item.userId === user.id);
  return NextResponse.json({ profile: profile ?? { userId: user.id, nickname: user.name, email: user.email, major: user.major, grade: "", contact: "", bio: "", skills: [], updatedAt: new Date().toISOString() } });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后更新个人资料" }, { status: 401 });
  const body = (await request.json()) as Partial<UserAccountProfile>;
  if (!body.nickname?.trim() || !body.major?.trim()) return NextResponse.json({ message: "昵称和专业不能为空" }, { status: 400 });
  const next: UserAccountProfile = {
    userId: user.id, email: user.email, nickname: body.nickname.trim().slice(0, 24), major: body.major.trim().slice(0, 40),
    grade: body.grade?.trim().slice(0, 20) ?? "", contact: body.contact?.trim().slice(0, 100) ?? "",
    bio: body.bio?.trim().slice(0, 500) ?? "", skills: (body.skills ?? []).map((item) => item.trim()).filter(Boolean).slice(0, 12), updatedAt: new Date().toISOString(),
  };
  const index = store.accountProfiles.findIndex((item) => item.userId === user.id);
  if (index >= 0) store.accountProfiles[index] = next; else store.accountProfiles.push(next);
  for (const post of store.recruitments.filter((item) => item.ownerId === user.id)) {
    post.ownerName = next.nickname;
    const owner = post.members.find((member) => member.userId === user.id);
    if (owner) Object.assign(owner, { name: next.nickname, major: next.major, grade: next.grade, skills: next.skills });
  }
  for (const post of store.recruitments) {
    const member = post.members.find((item) => item.userId === user.id);
    if (member) Object.assign(member, { name: next.nickname, major: next.major, grade: next.grade, skills: next.skills });
  }
  for (const application of store.applications.filter((item) => item.applicantId === user.id)) application.applicantName = next.nickname;
  for (const invitation of store.invitations) {
    if (invitation.senderId === user.id) invitation.senderName = next.nickname;
    if (invitation.recipientId === user.id) invitation.recipientName = next.nickname;
  }
  for (const opportunity of store.opportunities.filter((item) => item.publisherId === user.id)) opportunity.publisherName = next.nickname;
  return NextResponse.json({ profile: next });
}
