"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/types";

export function AuthMenu() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    const load = () => { fetch("/api/auth/session").then((response) => response.json()).then((data) => setUser(data.user)).catch(() => setUser(null)); };
    load(); window.addEventListener("dut-link-account-updated", load);
    return () => window.removeEventListener("dut-link-account-updated", load);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (user === undefined) return <div className="h-10 animate-pulse rounded-xl bg-black/[0.04]" />;
  if (!user) return <Link href="/login" className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2.5 text-xs font-bold"><LogIn className="size-3.5" /> 登录</Link>;
  return <div className="flex items-center gap-2 rounded-xl border border-black/10 p-1.5"><Link href="/account" className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-black/[0.035]"><UserRound className="size-3.5 shrink-0" /><span className="min-w-0"><strong className="block truncate">{user.name}</strong><span className="block truncate text-[10px] text-[var(--muted)]">{user.major}</span></span></Link><button onClick={logout} aria-label="退出登录" className="rounded-lg p-2 text-[var(--muted)] hover:bg-black/[0.04] hover:text-[var(--ink)]"><LogOut className="size-3.5" /></button></div>;
}
