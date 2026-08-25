import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/domain-error";
import { decideInvitation } from "@/lib/repositories/team-repository";

export async function PATCH(request: Request, context: RouteContext<"/api/invitations/[id]">) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后处理邀请" }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json()) as { status?: "accepted" | "rejected" };
  if (body.status !== "accepted" && body.status !== "rejected") return NextResponse.json({ message: "处理状态无效" }, { status: 400 });
  try {
    return NextResponse.json(await decideInvitation(user.id, id, body.status));
  } catch (error) {
    return errorResponse(error);
  }
}
