"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, LoaderCircle, LogIn, ShieldCheck, UserPlus } from "lucide-react";

type Mode = "login" | "register" | "forgot";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("student@dlut.edu.cn");
  const [password, setPassword] = useState("demo1234");
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [grade, setGrade] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setNotice("");
    setResetToken("");
    if (nextMode === "login") {
      setEmail("student@dlut.edu.cn");
      setPassword("demo1234");
    } else {
      setEmail("");
      setPassword("");
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
    if (mode === "forgot") {
      if (!resetToken) {
        const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
        const data = await readResponse(response);
        setLoading(false);
        if (!response.ok) { setError(data.message ?? "提交失败"); return; }
        if (data.resetToken) { setResetToken(data.resetToken); setNotice("已生成重置令牌，请输入新密码完成重置。"); }
        else setNotice(data.message ?? "如果该邮箱已注册，重置链接已发送。");
        return;
      }
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: resetToken, password }) });
      const data = await readResponse(response);
      setLoading(false);
      if (!response.ok) { setError(data.message ?? "重置失败"); return; }
      setResetToken("");
      setEmail("");
      setPassword("");
      setMode("login");
      setNotice("密码已重置，请使用新密码登录。");
      return;
    }

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mode === "login" ? { email, password } : { email, password, name, major, grade }) });
    const data = await readResponse(response);
    if (!response.ok) { setError(data.message ?? (mode === "login" ? "登录失败" : "注册失败")); setLoading(false); return; }
    const requestedTarget = new URLSearchParams(window.location.search).get("next");
    const target = requestedTarget?.startsWith("/") && !requestedTarget.startsWith("//") ? requestedTarget : mode === "register" ? "/account" : "/";
    window.location.href = target;
    } catch {
      setError("无法连接登录服务，请确认开发服务已启动后重试");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft className="size-4" /> 返回首页</Link>
      <section className="card p-7 sm:p-9">
        <div className="grid size-12 place-items-center rounded-2xl bg-[var(--ink)] text-[var(--lime)]">{mode === "login" ? <LogIn className="size-5" /> : mode === "register" ? <UserPlus className="size-5" /> : <KeyRound className="size-5" />}</div>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold">{mode === "login" ? "登录 DUT Link" : mode === "register" ? "创建校园账号" : "找回密码"}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{mode === "login" ? "登录后可维护能力画像、发布队伍并处理申请和邀请。" : mode === "register" ? "当前仅允许大连理工大学邮箱注册。邮箱验证码将在邮件服务接入后启用。" : "输入注册邮箱生成重置令牌；生产环境将通过邮件发送重置链接。"}</p>
        {mode !== "forgot" && <div className="mt-6 grid grid-cols-2 rounded-2xl bg-[var(--paper)] p-1 text-xs font-bold">
          <button type="button" onClick={() => switchMode("login")} className={`rounded-xl px-4 py-2.5 ${mode === "login" ? "bg-white shadow-sm" : "text-[var(--muted)]"}`}>登录</button>
          <button type="button" onClick={() => switchMode("register")} className={`rounded-xl px-4 py-2.5 ${mode === "register" ? "bg-white shadow-sm" : "text-[var(--muted)]"}`}>注册</button>
        </div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && <>
            <label className="block"><span className="mb-2 block text-xs font-bold">姓名或昵称</span><input value={name} onChange={(event) => setName(event.target.value)} required maxLength={30} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-2 block text-xs font-bold">专业</span><input value={major} onChange={(event) => setMajor(event.target.value)} required maxLength={40} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>
              <label className="block"><span className="mb-2 block text-xs font-bold">年级（选填）</span><input value={grade} onChange={(event) => setGrade(event.target.value)} maxLength={20} placeholder="例如：大二" className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>
            </div>
          </>}
          {mode === "forgot" && resetToken && <label className="block"><span className="mb-2 block text-xs font-bold">重置令牌</span><input value={resetToken} onChange={(event) => setResetToken(event.target.value)} required className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>}
          <label className="block"><span className="mb-2 block text-xs font-bold">{mode === "forgot" ? (resetToken ? "新密码" : "校园邮箱") : "校园邮箱"}</span><input type={mode === "forgot" && resetToken ? "password" : "email"} value={mode === "forgot" && resetToken ? password : email} onChange={(event) => (mode === "forgot" && resetToken ? setPassword(event.target.value) : setEmail(event.target.value))} required autoComplete="email" placeholder="name@dlut.edu.cn" className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>
          {mode !== "forgot" && <label className="block"><span className="mb-2 block text-xs font-bold">密码</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={72} autoComplete={mode === "login" ? "current-password" : "new-password"} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" />{mode === "register" && <span className="mt-2 block text-[11px] text-[var(--muted)]">至少 8 位，同时包含字母和数字</span>}</label>}
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">{error}</p>}
          {notice && <p className="rounded-xl bg-[var(--lime)]/45 px-4 py-3 text-xs">{notice}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-4 text-sm font-bold text-white disabled:opacity-60">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4 text-[var(--lime)]" />} {loading ? (mode === "login" ? "登录中…" : mode === "register" ? "创建中…" : "处理中…") : (mode === "login" ? "登录" : mode === "register" ? "注册并登录" : resetToken ? "重置密码" : "生成重置令牌")}</button>
        </form>
        {mode === "forgot" && <button type="button" onClick={() => switchMode("login")} className="mt-5 w-full text-center text-xs font-semibold text-[var(--muted)]">返回登录</button>}
        {mode === "login" && <>
          <button type="button" onClick={() => switchMode("forgot")} className="mt-5 w-full text-center text-xs font-semibold text-[var(--muted)]">忘记密码？</button>
          <div className="mt-5 rounded-2xl bg-[var(--lime)]/45 p-4 text-xs leading-6"><strong>Demo 账户</strong><br />student@dlut.edu.cn / demo1234</div>
        </>}
      </section>
    </div>
  );
}

async function readResponse(response: Response): Promise<{ message?: string; resetToken?: string }> {
  const text = await response.text();
  if (!text) return { message: response.ok ? undefined : `登录服务暂时不可用（HTTP ${response.status}）` };
  try {
    return JSON.parse(text) as { message?: string; resetToken?: string };
  } catch {
    return { message: `服务器返回了无法解析的响应（HTTP ${response.status}）` };
  }
}
