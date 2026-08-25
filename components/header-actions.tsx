"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Notification, SessionUser } from "@/lib/types";

const TYPE_LABELS: Record<Notification["type"], string> = {
  application_received: "新申请",
  application_accepted: "申请通过",
  application_rejected: "申请未通过",
  invitation_received: "组队邀请",
};

export function HeaderActions() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSession = () => {
      fetch("/api/auth/session")
        .then((r) => r.json())
        .then((d) => setUser(d.user))
        .catch(() => setUser(null));
    };
    loadSession();
    window.addEventListener("dut-link-account-updated", loadSession);
    return () => window.removeEventListener("dut-link-account-updated", loadSession);
  }, []);

  const loadNotifications = () => {
    fetch("/api/notifications")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        setNotifications(d.notifications ?? []);
        setUnreadCount(d.unreadCount ?? 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleBellClick() {
    setOpen((v) => !v);
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  function handleNotificationClick(n: Notification) {
    if (!n.read) markRead(n.id);
    setOpen(false);
    router.push("/applications");
  }

  const initial = user?.name?.charAt(0) ?? "?";

  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="搜索"
        onClick={() => router.push("/opportunities")}
        className="grid size-10 place-items-center rounded-full border border-black/5 bg-white text-[var(--muted)] shadow-sm hover:text-[var(--ink)] transition"
      >
        <Search className="size-4" />
      </button>

      {/* 铃铛 + 通知 Popover */}
      <div className="relative" ref={popoverRef}>
        <button
          aria-label="通知"
          onClick={handleBellClick}
          className="relative grid size-10 place-items-center rounded-full border border-black/5 bg-white text-[var(--muted)] shadow-sm hover:text-[var(--ink)] transition"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-[var(--coral)] text-[9px] font-bold text-white leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-black/5 bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.055]">
              <span className="text-sm font-bold">通知</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-[var(--violet)] font-semibold hover:opacity-70 transition"
                >
                  <Check className="size-3" /> 全部已读
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">暂无通知</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto divide-y divide-black/[0.04]">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left px-4 py-3 hover:bg-black/[0.025] transition ${n.read ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--coral)]" />}
                        <div className={!n.read ? "" : "pl-3.5"}>
                          <p className="text-xs font-semibold text-[var(--muted)]">{TYPE_LABELS[n.type]}</p>
                          <p className="mt-0.5 text-sm font-medium leading-snug">{n.body}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {user === undefined ? (
        <div className="ml-1 size-10 animate-pulse rounded-full bg-black/[0.06]" />
      ) : user ? (
        <Link
          href="/account"
          aria-label="打开个人主页"
          className="ml-1 grid size-10 place-items-center rounded-full bg-gradient-to-br from-[#ff8a67] to-[#ffc15b] text-sm font-bold text-white shadow-sm"
        >
          {initial}
        </Link>
      ) : (
        <Link
          href="/login"
          aria-label="登录"
          className="ml-1 grid size-10 place-items-center rounded-full border border-black/10 bg-white text-[var(--muted)] shadow-sm hover:text-[var(--ink)] transition text-xs font-bold"
        >
          登录
        </Link>
      )}
    </div>
  );
}
