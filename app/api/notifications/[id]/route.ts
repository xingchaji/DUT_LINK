import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后操作" }, { status: 401 });
  const { id } = await context.params;
  const notification = store.notifications.find((n) => n.id === id && n.userId === user.id);
  if (!notification) return NextResponse.json({ message: "通知不存在" }, { status: 404 });
  notification.read = true;
  return NextResponse.json({ ok: true });
}
