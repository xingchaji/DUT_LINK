"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/types";

export function AuthMenu() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/session").then((response) => response.json()).then((data) => setUser(data.user)).catch(() => setUser(null));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (user === undefined) return <div className="h-10 animate-pulse rounded-xl bg-black/[0.04]" />;
  if (!user) return <Link href="/login" className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2.5 text-xs font-bold"><LogIn className="size-3.5" /> 登录</Link>;
  return (
    <button onClick={logout} className="flex w-full items-center justify-between rounded-xl border border-black/10 px-3 py-2.5 text-left text-xs">
      <span><strong className="block">{user.name}</strong><span className="text-[10px] text-[var(--muted)]">{user.major}</span></span>
      <LogOut className="size-3.5 text-[var(--muted)]" />
    </button>
  );
}
