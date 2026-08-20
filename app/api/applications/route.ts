import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后查看申请" }, { status: 401 });

  const decorate = (application: (typeof store.applications)[number]) => {
    const recruitment = store.recruitments.find((item) => item.id === application.recruitmentId);
    return { ...application, teamName: recruitment?.teamName ?? "未知队伍", opportunityTitle: recruitment?.opportunityTitle ?? "未知比赛" };
  };
  const sent = store.applications.filter((item) => item.applicantId === user.id).map(decorate);
  const ownedIds = new Set(store.recruitments.filter((item) => item.ownerId === user.id).map((item) => item.id));
  const received = store.applications.filter((item) => ownedIds.has(item.recruitmentId)).map(decorate);
  return NextResponse.json({ sent, received });
}
