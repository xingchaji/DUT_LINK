import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { decideApplication } from "@/lib/repositories/team-repository";
import { errorResponse } from "@/lib/domain-error";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后处理申请" }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json()) as { status?: "accepted" | "rejected" };
  if (!body.status || !["accepted", "rejected"].includes(body.status)) return NextResponse.json({ message: "无效状态" }, { status: 400 });
  try {
    return NextResponse.json(await decideApplication(user.id, id, body.status));
  } catch (error) {
    return errorResponse(error);
  }
}
