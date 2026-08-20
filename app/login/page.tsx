"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, LogIn, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("student@dlut.edu.cn");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    if (!response.ok) { setError(data.message ?? "登录失败"); setLoading(false); return; }
    const target = new URLSearchParams(window.location.search).get("next") || "/";
    window.location.href = target.startsWith("/") ? target : "/";
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft className="size-4" /> 返回首页</Link>
      <section className="card p-7 sm:p-9">
        <div className="grid size-12 place-items-center rounded-2xl bg-[var(--ink)] text-[var(--lime)]"><LogIn className="size-5" /></div>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold">登录 DUT Link</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">当前为功能验证账户。接入数据库后将替换为校园邮箱注册与验证。</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block"><span className="mb-2 block text-xs font-bold">校园邮箱</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>
          <label className="block"><span className="mb-2 block text-xs font-bold">密码</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-4 text-sm font-bold text-white disabled:opacity-60">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4 text-[var(--lime)]" />} {loading ? "登录中…" : "登录"}</button>
        </form>
        <div className="mt-5 rounded-2xl bg-[var(--lime)]/45 p-4 text-xs leading-6"><strong>Demo 账户</strong><br />student@dlut.edu.cn / demo1234</div>
      </section>
    </div>
  );
}
