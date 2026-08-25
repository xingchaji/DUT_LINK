import { NextResponse } from "next/server";
import { deleteSessionById, getCurrentUser } from "@/lib/auth";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请先登录" }, { status: 401 });
  const { id } = await context.params;
  await deleteSessionById(user.id, id);
  return NextResponse.json({ ok: true });
}
