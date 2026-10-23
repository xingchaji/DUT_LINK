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

  if (user === undefined) return <div className="h-9 animate-pulse rounded-md bg-sink" />;

  if (!user)
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-md px-2 py-2 text-[12.5px] font-medium text-muted transition-colors hover:bg-sink hover:text-ink"
      >
        <LogIn className="size-[14px]" strokeWidth={1.9} /> 登录校园账号
      </Link>
    );

  return (
    <div className="group flex items-center gap-1 rounded-md p-1 transition-colors hover:bg-sink">
      <Link href="/account" className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1">
        <span className="grid size-6 shrink-0 place-items-center rounded-[7px] bg-ink text-[11px] font-semibold text-canvas">{user.name?.charAt(0) ?? "?"}</span>
        <span className="min-w-0">
          <strong className="block truncate text-[12.5px] font-medium text-ink">{user.name}</strong>
          <span className="block truncate text-[10.5px] text-faint">{user.major ?? "未填写专业"}</span>
        </span>
      </Link>
      <button
        type="button"
        onClick={logout}
        aria-label="退出登录"
        className="grid size-7 shrink-0 place-items-center rounded text-faint opacity-0 transition hover:bg-sink hover:text-clay group-hover:opacity-100 focus-visible:opacity-100"
      >
        <LogOut className="size-[14px]" />
      </button>
    </div>
  );
}
