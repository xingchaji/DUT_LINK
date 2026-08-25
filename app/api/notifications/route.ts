import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后查看通知" }, { status: 401 });
  const notifications = store.notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 30);
  const unreadCount = notifications.filter((n) => !n.read).length;
  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后操作" }, { status: 401 });
  const body = (await request.json()) as { all?: boolean };
  if (body.all) {
    store.notifications
      .filter((n) => n.userId === user.id && !n.read)
      .forEach((n) => { n.read = true; });
  }
  return NextResponse.json({ ok: true });
}
