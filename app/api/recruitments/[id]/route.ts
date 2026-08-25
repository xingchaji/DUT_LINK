import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteRecruitment } from "@/lib/repositories/team-repository";
import { errorResponse } from "@/lib/domain-error";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后删除队伍" }, { status: 401 });
  const { id } = await context.params;
  try {
    await deleteRecruitment(user.id, id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
