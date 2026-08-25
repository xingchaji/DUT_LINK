import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listNotifications, markAllNotificationsRead } from "@/lib/repositories/social-repository";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后查看通知" }, { status: 401 });
  const notifications = await listNotifications(user.id);
  const unreadCount = notifications.filter((n) => !n.read).length;
  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后操作" }, { status: 401 });
  const body = (await request.json()) as { all?: boolean };
  if (body.all) {
    await markAllNotificationsRead(user.id);
  }
  return NextResponse.json({ ok: true });
}
