import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后报名" }, { status: 401 });
  const { id } = await context.params;
  const recruitment = store.recruitments.find((item) => item.id === id);
  if (!recruitment) return NextResponse.json({ message: "招募信息不存在" }, { status: 404 });
  if (store.applications.some((item) => item.recruitmentId === id && item.userId === user.id)) {
    return NextResponse.json({ message: "你已经报名过该队伍" }, { status: 409 });
  }
  const body = (await request.json()) as { message?: string };
  store.applications.push({
    id: crypto.randomUUID(),
    recruitmentId: id,
    userId: user.id,
    message: body.message?.trim() || "希望加入队伍，一起完成项目。",
    createdAt: new Date().toISOString(),
  });
  recruitment.applicants += 1;
  return NextResponse.json({ ok: true, applicants: recruitment.applicants });
}
