import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后删除队伍" }, { status: 401 });
  const { id } = await context.params;
  const index = store.recruitments.findIndex((item) => item.id === id);
  if (index < 0) return NextResponse.json({ message: "队伍不存在" }, { status: 404 });
  if (store.recruitments[index].ownerId !== user.id) return NextResponse.json({ message: "只有队长可以删除队伍" }, { status: 403 });
  store.recruitments.splice(index, 1);
  for (let i = store.applications.length - 1; i >= 0; i -= 1) if (store.applications[i].recruitmentId === id) store.applications.splice(i, 1);
  for (let i = store.invitations.length - 1; i >= 0; i -= 1) if (store.invitations[i].recruitmentId === id) store.invitations.splice(i, 1);
  return NextResponse.json({ deleted: true });
}
