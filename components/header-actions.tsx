"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Notification, SessionUser } from "@/lib/types";

const TYPE_LABELS: Record<Notification["type"], string> = {
  application_received: "新申请",
  application_accepted: "申请通过",
  application_rejected: "申请未通过",
  invitation_received: "组队邀请",
  invitation_accepted: "邀请已接受",
  invitation_rejected: "邀请未接受",
  opportunity_approved: "比赛已通过",
  opportunity_rejected: "比赛未通过",
  article_approved: "文章已通过",
  article_rejected: "文章未通过",
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
      .then((r) => (r.ok ? r.json() : null))
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

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        aria-label="搜索比赛与队伍"
        onClick={() => router.push("/opportunities")}
        className="icon-btn"
      >
        <Search className="size-[15px]" strokeWidth={1.9} />
      </button>

      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          aria-label="通知"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`icon-btn relative ${open ? "!text-ink" : ""}`}
        >
          <Bell className="size-[15px]" strokeWidth={1.9} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-[14px] place-items-center rounded-full bg-clay px-[3px] text-[9px] font-semibold leading-[14px] text-white shadow-[0_1px_2px_rgba(120,40,20,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="pop absolute right-0 top-10 z-50 w-[308px] overflow-hidden rounded-[14px] border border-white/70 bg-surface shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_18px_40px_-18px_rgba(60,48,30,0.4),0_40px_70px_-40px_rgba(60,48,30,0.4)]">
            <div className="flex items-center justify-between border-b border-line/80 bg-raise/60 px-3 py-2.5">
              <span className="text-[12.5px] font-semibold text-ink">通知</span>
              {unreadCount > 0 && (
                <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1 text-[11px] font-medium text-brand transition hover:opacity-70">
                  <Check className="size-3" /> 全部已读
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="px-4 py-9 text-center text-[12.5px] text-muted">暂无通知</p>
            ) : (
              <ul className="max-h-[320px] divide-y divide-line/70 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-raise"
                    >
                      <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${n.read ? "bg-line-strong" : "bg-clay"}`} />
                      <span className="min-w-0">
                        <span className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-faint">{TYPE_LABELS[n.type]}</span>
                        <span className={`mt-0.5 block text-[12.5px] leading-snug ${n.read ? "text-muted" : "text-ink"}`}>{n.body}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <span className="mx-1 hidden h-4 w-px bg-line shadow-[1px_0_0_rgba(255,255,255,0.8)] sm:block" />

      {user === undefined ? (
        <div className="size-7 animate-pulse rounded-full bg-raise" />
      ) : user ? (
        <Link
          href="/account"
          aria-label="打开个人主页"
          className="avatar-btn grid size-7 place-items-center rounded-full text-[11px] font-semibold text-canvas"
        >
          {initial}
        </Link>
      ) : (
        <Link href="/login" className="btn btn-secondary btn-sm">
          登录
        </Link>
      )}
    </div>
  );
}
