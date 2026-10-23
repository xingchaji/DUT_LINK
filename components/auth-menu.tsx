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
    const load = () => {
      fetch("/api/auth/session")
        .then((response) => response.json())
        .then((data) => setUser(data.user))
        .catch(() => setUser(null));
    };
    load();
    window.addEventListener("dut-link-account-updated", load);
    return () => window.removeEventListener("dut-link-account-updated", load);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (user === undefined) return <div className="h-9 animate-pulse rounded-lg bg-sink" />;

  if (!user)
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-[10px] px-2 py-2 text-[12.5px] font-medium text-muted transition duration-300 hover:-translate-y-px hover:bg-white/70 hover:text-ink hover:shadow-[0_1px_3px_rgba(60,48,30,0.1)]"
      >
        <LogIn className="size-[14px]" strokeWidth={1.9} /> 登录校园账号
      </Link>
    );

  return (
    <div className="group flex items-center gap-1 rounded-[11px] border border-transparent p-1 transition duration-300 hover:border-white/80 hover:bg-white/70 hover:shadow-[0_1px_2px_rgba(60,48,30,0.08)]">
      <Link href="/account" className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1">
        <span className="grid size-6 shrink-0 place-items-center rounded-[8px] border border-ink/70 bg-gradient-to-b from-[#33312a] to-[#16150f] text-[11px] font-semibold text-canvas shadow-[0_1px_1px_rgba(20,16,8,0.2),inset_0_1px_0_rgba(255,255,255,0.16)] transition duration-300 group-hover:-translate-y-px">
          {user.name?.charAt(0) ?? "?"}
        </span>
        <span className="min-w-0">
          <strong className="block truncate text-[12.5px] font-medium text-ink">{user.name}</strong>
          <span className="block truncate text-[10.5px] text-faint">{user.major ?? "未填写专业"}</span>
        </span>
      </Link>
      <button
        type="button"
        onClick={logout}
        aria-label="退出登录"
        className="grid size-7 shrink-0 place-items-center rounded-[7px] text-faint opacity-0 transition hover:bg-white hover:text-clay hover:shadow-[0_1px_2px_rgba(60,48,30,0.1)] group-hover:opacity-100 focus-visible:opacity-100"
      >
        <LogOut className="size-[14px]" />
      </button>
    </div>
  );
}
