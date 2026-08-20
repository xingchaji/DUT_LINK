import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后报名" }, { status: 401 });
  const { id } = await context.params;
  const recruitment = store.recruitments.find((item) => item.id === id);
  if (!recruitment) return NextResponse.json({ message: "招募信息不存在" }, { status: 404 });
  if (recruitment.ownerId === user.id) return NextResponse.json({ message: "不能申请加入自己发布的队伍" }, { status: 400 });
  if (recruitment.currentSize >= recruitment.capacity) return NextResponse.json({ message: "队伍人数已满" }, { status: 409 });
  if (store.applications.some((item) => item.recruitmentId === id && item.applicantId === user.id)) {
    return NextResponse.json({ message: "你已经报名过该队伍" }, { status: 409 });
  }
  const body = (await request.json()) as { message?: string };
  const application = {
    id: crypto.randomUUID(),
    recruitmentId: id,
    applicantId: user.id,
    applicantName: user.name,
    applicantMajor: user.major,
    message: body.message?.trim() || "希望加入队伍，一起完成项目。",
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };
  store.applications.push(application);
  recruitment.applicants += 1;
  return NextResponse.json({ ok: true, applicants: recruitment.applicants, application });
}
