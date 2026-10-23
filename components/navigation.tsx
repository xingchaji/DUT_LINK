"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Check, ChevronDown, Compass, Home, Inbox, ShieldCheck, Sparkles, Trophy, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { AuthMenu } from "@/components/auth-menu";
import type { SessionUser } from "@/lib/types";

const baseNav = [
  { href: "/", label: "首页", icon: Home },
  { href: "/opportunities", label: "组队中心", icon: Trophy },
  { href: "/applications", label: "申请管理", icon: Inbox },
  { href: "/explore", label: "探索盲盒", icon: Compass },
  { href: "/account", label: "个人主页", icon: UserRound },
];

export function Navigation() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!workspaceOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) setWorkspaceOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setWorkspaceOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [workspaceOpen]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const nav = useMemo(() => {
    if (user?.role === "admin") return [...baseNav, { href: "/admin", label: "内容审核", icon: ShieldCheck }];
    return baseNav;
  }, [user]);

  return (
    <>
      <aside className="fixed inset-y-3 left-3 z-30 hidden w-[252px] flex-col overflow-hidden rounded-[20px] border border-white/70 bg-sidebar lg:flex" style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 6px rgba(60,48,30,0.05), 0 24px 60px -28px rgba(60,48,30,0.35)" }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent" />
        <div className="relative flex h-[56px] shrink-0 items-center px-3">
          <Link href="/" aria-label="返回首页" className="rounded-lg px-1 py-1 transition hover:-translate-y-px hover:opacity-80">
            <Logo />
          </Link>
        </div>

        <div className="relative mx-2.5" ref={workspaceRef}>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={workspaceOpen}
            aria-controls="workspace-panel"
            aria-label="查看学校空间"
            onClick={() => setWorkspaceOpen((open) => !open)}
            className={`flex w-full items-center gap-2 rounded-[9px] border px-2 py-1.5 text-left transition duration-300 [transition-timing-function:var(--spring)] ${
              workspaceOpen
                ? "border-[rgba(60,48,30,0.18)] bg-[#fffefc] shadow-[0_1px_0_rgba(60,48,30,0.05),0_2px_5px_-3px_rgba(60,48,30,0.14),inset_0_1px_0_#fff]"
                : "border-[rgba(60,48,30,0.09)] bg-[#f5f2ea] shadow-[inset_0_1px_2px_rgba(60,48,30,0.07),inset_0_-1px_0_rgba(255,255,255,0.75)] hover:border-[rgba(60,48,30,0.14)] hover:bg-[#f7f4ed]"
            }`}
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-[6px] bg-brand-soft font-mono text-[8.5px] font-semibold tracking-tight text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">DUT</span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-soft">大连理工大学</span>
            <ChevronDown className={`size-3.5 shrink-0 text-faint transition-transform duration-300 ${workspaceOpen ? "rotate-180" : ""}`} />
          </button>

          {workspaceOpen && (
            <div
              id="workspace-panel"
              role="dialog"
              aria-label="学校空间"
              className="pop absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-[11px] border border-[rgba(60,48,30,0.12)] bg-[#fffefc] shadow-[0_1px_0_#fff_inset,0_10px_24px_-12px_rgba(60,48,30,0.28),0_28px_48px_-28px_rgba(60,48,30,0.3)]"
            >
              <button
                type="button"
                onClick={() => setWorkspaceOpen(false)}
                className="flex w-full items-center gap-2 px-2.5 py-2.5 text-left transition hover:bg-raise/70 focus-visible:bg-raise/70"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-[7px] bg-brand-soft font-mono text-[9px] font-semibold text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">DUT</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-ink">大连理工大学</span>
                  <span className="block text-[10px] text-faint">当前空间 · 校园邮箱验证</span>
                </span>
                <Check className="size-3.5 shrink-0 text-moss" strokeWidth={2.4} />
              </button>
              <div aria-disabled="true" className="flex items-start gap-1.5 border-t border-line/70 px-2.5 py-2 text-[10.5px] leading-5 text-faint">
                <span className="mt-px rounded-[4px] border border-line px-1 text-[9px] leading-4">即将开放</span>
                <span className="min-w-0">更多学校空间还在接入，开放后会同步你的画像与组队记录。</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 px-4">
          <p className="section-label">你的工作台</p>
        </div>

        <nav className="mt-1.5 space-y-1 px-2.5">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-2.5 rounded-[10px] py-[7px] pl-2.5 pr-2 text-[13.5px] transition duration-300 [transition-timing-function:var(--spring)] ${
                  active
                    ? "border border-[rgba(60,48,30,0.1)] bg-[#fffefc] font-semibold text-ink shadow-[0_1px_0_rgba(60,48,30,0.05),0_2px_5px_-3px_rgba(60,48,30,0.12),inset_0_1px_0_#fff]"
                    : "border border-transparent font-medium text-muted hover:-translate-y-px hover:bg-white/60 hover:text-ink"
                }`}
              >
                <Icon className={`size-[15px] shrink-0 transition-transform duration-300 ${active ? "text-ink" : "text-faint group-hover:text-muted"}`} strokeWidth={active ? 2 : 1.75} />
                <span className="truncate">{item.label}</span>
                {active && <span className="ml-auto size-1.5 shrink-0 rounded-full bg-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 px-2.5 pb-3">
          <div className="card relative overflow-hidden p-2.5">
            <div className="pointer-events-none absolute -right-6 -top-8 size-16 rounded-full bg-marker/60 blur-xl" />
            <div className="relative flex items-center gap-1.5">
              <span className="grid size-5 place-items-center rounded-[6px] bg-ochre-soft text-ochre shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <Sparkles className="size-3" strokeWidth={2.2} />
              </span>
              <span className="text-[11.5px] font-semibold text-ink-soft">能力画像</span>
              <span className="num ml-auto text-[10px] text-faint">68%</span>
            </div>
            <p className="relative mt-1.5 text-[11px] leading-[1.65] text-muted">再补充一段项目证据，AI 推荐会更稳。</p>
            <Link
              href="/onboarding"
              className="relative mt-2.5 flex items-center justify-between rounded-lg border border-[rgba(60,48,30,0.11)] bg-[#fffefc] px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft shadow-[0_1px_1px_rgba(60,48,30,0.04),0_2px_4px_-2px_rgba(60,48,30,0.1),inset_0_1px_0_#fff] transition duration-300 [transition-timing-function:var(--spring)] hover:-translate-y-px hover:border-[rgba(60,48,30,0.18)] hover:shadow-[0_4px_9px_-4px_rgba(60,48,30,0.16),inset_0_1px_0_#fff]"
            >
              更新能力画像 <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="mx-1 h-px bg-line shadow-[0_1px_0_rgba(255,255,255,0.8)]" />
          <AuthMenu />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between border-b border-line/80 bg-canvas/85 px-4 shadow-[0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md lg:hidden">
        <Link href="/" aria-label="返回首页">
          <Logo />
        </Link>
        <Link href="/onboarding" className="btn btn-secondary btn-sm">
          完善画像
        </Link>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex gap-1 rounded-[16px] border border-white/80 bg-surface/95 p-1.5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_24px_-10px_rgba(60,48,30,0.28),0_30px_60px_-30px_rgba(60,48,30,0.35)] backdrop-blur-md lg:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[11px] py-1.5 text-[10px] transition duration-300 [transition-timing-function:var(--spring)] ${
                active
                  ? "border border-[rgba(60,48,30,0.08)] bg-[#fffefc] font-semibold text-ink shadow-[0_1px_1px_rgba(60,48,30,0.05),0_3px_7px_-3px_rgba(60,48,30,0.14),inset_0_1px_0_#fff]"
                  : "font-medium text-muted active:scale-95"
              }`}
            >
              <Icon className="size-[17px]" strokeWidth={active ? 2 : 1.75} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
