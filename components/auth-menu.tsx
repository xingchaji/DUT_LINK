"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { notify } from "@/components/feedback/toast";
import type { SessionUser } from "@/lib/types";

export function AuthMenu() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [loggingOut, setLoggingOut] = useState(false);

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
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        notify("退出登录失败，请稍后重试", "error");
        return;
      }
      setUser(null);
      notify("已退出当前账号");
      router.push("/");
      router.refresh();
    } catch {
      notify("网络异常，退出登录失败", "error");
    } finally {
      setLoggingOut(false);
    }
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
        <span className="grid size-6 shrink-0 place-items-center rounded-[8px] border border-[#121110] border-t-[#37332b] bg-[#1e1d1a] text-[11px] font-semibold text-canvas shadow-[0_1px_1px_rgba(24,20,12,0.18),0_2px_4px_-2px_rgba(24,20,12,0.28),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.4)] transition duration-300 group-hover:-translate-y-px">
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
        disabled={loggingOut}
        aria-label="退出登录"
        className="grid size-7 shrink-0 place-items-center rounded-[7px] text-faint opacity-0 transition hover:bg-white hover:text-clay hover:shadow-[0_1px_2px_rgba(60,48,30,0.1)] group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-60 [@media(hover:none)]:opacity-100"
      >
        {loggingOut ? <LoaderCircle className="size-[14px] animate-spin" /> : <LogOut className="size-[14px]" />}
      </button>
    </div>
  );
}
