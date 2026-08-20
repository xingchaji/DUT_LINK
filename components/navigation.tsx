"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, Sparkles, UserRound, UsersRound } from "lucide-react";
import { Logo } from "@/components/logo";

const nav = [
  { href: "/", label: "首页", icon: Home },
  { href: "/profile", label: "能力画像", icon: UserRound },
  { href: "/teams", label: "智能组队", icon: UsersRound },
  { href: "/explore", label: "探索盲盒", icon: Compass },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-black/5 bg-white/80 px-5 py-7 backdrop-blur-xl lg:flex lg:flex-col">
        <Logo />
        <nav className="mt-12 space-y-1.5">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? "bg-[var(--ink)] text-white shadow-lg shadow-slate-900/10" : "text-[var(--muted)] hover:bg-black/[0.035] hover:text-[var(--ink)]"}`}>
                <Icon className="size-[18px]" strokeWidth={active ? 2 : 1.7} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-3xl bg-[var(--lime)] p-5">
          <Sparkles className="size-5" />
          <p className="mt-4 font-[family-name:var(--font-display)] text-lg font-bold leading-tight">让 AI 重新认识你</p>
          <p className="mt-2 text-xs leading-5 text-black/55">补充经历，获得更准确的能力画像与连接建议。</p>
          <Link href="/onboarding" className="mt-4 block rounded-xl bg-white px-3 py-2.5 text-center text-xs font-bold shadow-sm">更新资料</Link>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-[var(--paper)]/85 px-5 py-4 backdrop-blur-xl lg:hidden">
        <Logo />
        <Link href="/onboarding" className="rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-semibold text-white">完善画像</Link>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-[22px] border border-white/70 bg-white/90 p-1.5 shadow-[0_16px_50px_rgba(28,33,43,0.18)] backdrop-blur-xl lg:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-medium ${active ? "bg-[var(--ink)] text-white" : "text-[var(--muted)]"}`}>
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

