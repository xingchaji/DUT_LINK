"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Compass, Home, Inbox, ShieldCheck, Sparkles, Trophy, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-line bg-sidebar lg:flex">
        <div className="flex h-[54px] shrink-0 items-center px-3">
          <Link href="/" aria-label="返回首页" className="rounded-md px-1 py-1 transition hover:opacity-70">
            <Logo />
          </Link>
        </div>

        <button
          type="button"
          className="mx-2.5 flex items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-sink"
        >
          <span className="grid size-5 shrink-0 place-items-center rounded-[5px] bg-brand-soft font-mono text-[8.5px] font-semibold tracking-tight text-brand">DUT</span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-soft">大连理工大学</span>
          <ChevronDown className="size-3.5 shrink-0 text-faint" />
        </button>

        <div className="mt-6 px-4">
          <p className="section-label">你的工作台</p>
        </div>

        <nav className="mt-1.5 space-y-px px-2.5">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-2.5 rounded-md py-[7px] pl-2.5 pr-2 text-[13.5px] transition-colors ${
                  active ? "bg-sink font-semibold text-ink" : "font-medium text-muted hover:bg-sink/60 hover:text-ink"
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 h-3.5 w-[2.5px] -translate-y-1/2 rounded-full bg-ink" />}
                <Icon className={`size-[15px] shrink-0 ${active ? "text-ink" : "text-faint group-hover:text-muted"}`} strokeWidth={active ? 2 : 1.75} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 px-2.5 pb-3">
          <div className="rounded-[10px] border border-line bg-surface p-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-ochre" strokeWidth={2} />
              <span className="text-[11.5px] font-semibold text-ink-soft">能力画像</span>
              <span className="ml-auto font-mono text-[10px] text-faint">68%</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-[1.65] text-muted">再补充一段项目证据，AI 推荐会更稳。</p>
            <Link
              href="/onboarding"
              className="mt-2.5 flex items-center justify-between rounded-md bg-raise px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft transition hover:bg-sink"
            >
              更新能力画像 <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="mx-1 h-px bg-line" />
          <AuthMenu />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-[54px] items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur-md lg:hidden">
        <Link href="/" aria-label="返回首页">
          <Logo />
        </Link>
        <Link href="/onboarding" className="btn btn-secondary btn-sm">
          完善画像
        </Link>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex gap-1 rounded-[14px] border border-line bg-surface/95 p-1 shadow-[0_8px_28px_-8px_rgba(30,29,26,0.22)] backdrop-blur-md lg:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[10px] py-1.5 text-[10px] font-medium transition-colors ${
                active ? "bg-raise font-semibold text-ink" : "text-muted"
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
