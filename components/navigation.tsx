"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Compass, Home, Inbox, ShieldCheck, Sparkles, Trophy, UserRound } from "lucide-react";
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
    fetch("/api/auth/session").then((response) => response.json()).then((data) => setUser(data.user)).catch(() => setUser(null));
  }, []);

  const nav = useMemo(() => {
    if (user?.role === "admin") return [...baseNav, { href: "/admin", label: "内容审核", icon: ShieldCheck }];
    return baseNav;
  }, [user]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-black/[0.06] bg-white/75 px-5 py-6 backdrop-blur-2xl lg:flex lg:flex-col">
        <div className="px-2"><Link href="/" aria-label="返回首页"><Logo /></Link></div>
        <div className="mt-10 px-3 text-[9px] font-bold uppercase tracking-[0.26em] text-[var(--muted)]">你的工作台</div>
        <nav className="mt-3 space-y-1.5">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${active ? "bg-[var(--ink)] text-white shadow-[0_14px_32px_rgba(23,32,51,0.16)]" : "text-[var(--muted)] hover:bg-white hover:text-[var(--ink)] hover:shadow-sm"}`}>
                <span className={`grid size-8 place-items-center rounded-xl transition ${active ? "bg-white/10" : "bg-black/[0.035] group-hover:bg-[var(--violet)]/10 group-hover:text-[var(--violet)]"}`}>
                  <Icon className="size-[16px]" strokeWidth={active ? 2.1 : 1.8} />
                </span>
                <span>{item.label}</span>
                {active && <span className="ml-auto size-1.5 rounded-full bg-[var(--lime)]" />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <div className="soft-grid relative overflow-hidden rounded-[24px] border border-black/[0.04] bg-[var(--lime)] p-5">
            <div className="absolute -right-7 -top-7 size-24 rounded-full bg-white/45" />
            <div className="relative grid size-9 place-items-center rounded-xl bg-[var(--ink)] text-white shadow-lg"><Sparkles className="size-4" /></div>
            <p className="relative mt-4 font-[family-name:var(--font-display)] text-lg font-extrabold leading-tight tracking-[-0.03em]">让 AI 重新认识你</p>
            <p className="relative mt-2 text-xs leading-5 text-black/55">补充项目证据，让组队推荐更准确。</p>
            <Link href="/onboarding" className="relative mt-4 flex items-center justify-between rounded-xl bg-white/90 px-3.5 py-2.5 text-xs font-bold shadow-sm transition hover:bg-white">更新能力画像 <ArrowUpRight className="size-3.5" /></Link>
          </div>
          <AuthMenu />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/[0.06] bg-[var(--paper)]/88 px-5 py-3.5 backdrop-blur-2xl lg:hidden">
        <Link href="/" aria-label="返回首页"><Logo /></Link>
        <Link href="/onboarding" className="rounded-full bg-[var(--ink)] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-slate-900/10">完善画像</Link>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex rounded-[24px] border border-white/80 bg-white/92 p-1.5 shadow-[0_18px_55px_rgba(28,33,43,0.2)] backdrop-blur-2xl lg:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          return (
            <Link key={item.href} href={item.href} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[18px] py-2 text-[10px] font-semibold transition ${active ? "bg-[var(--ink)] text-white shadow-md" : "text-[var(--muted)]"}`}>
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
