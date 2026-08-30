"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, CheckCircle2, KeyRound, LoaderCircle, LogIn, ShieldCheck, Sparkles, UserPlus, UsersRound } from "lucide-react";

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
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-5 py-8 sm:px-8 lg:min-h-screen lg:px-10">
      <section className="card grid w-full overflow-hidden lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="dot-grid relative overflow-hidden bg-[var(--ink)] p-7 text-white sm:p-9 lg:p-10">
          <div className="absolute -right-24 -top-20 size-64 rounded-full bg-[var(--violet)]/70 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 size-56 rounded-full bg-[var(--cyan)]/25 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <Link href="/" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white/70 transition hover:text-white"><ArrowLeft className="size-4" /> 返回首页</Link>
            <div className="mt-8 lg:mt-20">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60"><Sparkles className="size-3.5 text-[var(--lime)]" /> Campus collaboration</span>
              <h2 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-extrabold leading-tight tracking-[-0.045em] sm:text-4xl">让你的能力，<br />被合适的人看见。</h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/58">登录后，能力画像、比赛意向和组队记录会归属于同一个校园账号。</p>
              <div className="mt-8 hidden space-y-4 text-xs text-white/68 lg:block">
                <p className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-xl bg-white/10 text-[var(--lime)]"><BrainCircuit className="size-4" /></span>持续维护可解释的能力画像</p>
                <p className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-xl bg-white/10 text-[var(--lime)]"><UsersRound className="size-4" /></span>创建队伍、申请加入并处理邀请</p>
                <p className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-xl bg-white/10 text-[var(--lime)]"><CheckCircle2 className="size-4" /></span>所有赛事事实保留可追溯来源</p>
              </div>
            </div>
            {mode === "login" && <div className="mt-10 hidden rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-xs leading-6 text-white/60 lg:mt-auto lg:block"><strong className="text-white">Demo 账户</strong><br />student@dlut.edu.cn&nbsp;&nbsp;/&nbsp;&nbsp;demo1234</div>}
          </div>
        </aside>

        <div className="p-7 sm:p-9 lg:p-11">
          <div className="grid size-12 place-items-center rounded-2xl bg-[#eeebff] text-[var(--violet)]">{mode === "login" ? <LogIn className="size-5" /> : mode === "register" ? <UserPlus className="size-5" /> : <KeyRound className="size-5" />}</div>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--violet)]">{mode === "login" ? "Welcome back" : mode === "register" ? "New account" : "Account recovery"}</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.04em]">{mode === "login" ? "登录 DUT Link" : mode === "register" ? "创建校园账号" : "找回密码"}</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">{mode === "login" ? "继续维护能力画像、发现比赛并处理组队协作。" : mode === "register" ? "当前仅允许大连理工大学邮箱注册。邮箱验证码将在邮件服务接入后启用。" : "输入注册邮箱生成重置令牌；生产环境将通过邮件发送重置链接。"}</p>

          {mode !== "forgot" && <div className="mt-7 grid grid-cols-2 rounded-2xl bg-[var(--paper)] p-1.5 text-xs font-bold"><button type="button" onClick={() => switchMode("login")} className={`rounded-xl px-4 py-2.5 transition ${mode === "login" ? "bg-[var(--ink)] text-white shadow-md" : "text-[var(--muted)]"}`}>登录</button><button type="button" onClick={() => switchMode("register")} className={`rounded-xl px-4 py-2.5 transition ${mode === "register" ? "bg-[var(--ink)] text-white shadow-md" : "text-[var(--muted)]"}`}>注册</button></div>}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && <><AuthField label="姓名或昵称"><input value={name} onChange={(event) => setName(event.target.value)} required maxLength={30} className="auth-input" /></AuthField><div className="grid gap-4 sm:grid-cols-2"><AuthField label="专业"><input value={major} onChange={(event) => setMajor(event.target.value)} required maxLength={40} className="auth-input" /></AuthField><AuthField label="年级（选填）"><input value={grade} onChange={(event) => setGrade(event.target.value)} maxLength={20} placeholder="例如：大二" className="auth-input" /></AuthField></div></>}
            {mode === "forgot" && resetToken && <AuthField label="重置令牌"><input value={resetToken} onChange={(event) => setResetToken(event.target.value)} required className="auth-input" /></AuthField>}
            <AuthField label={mode === "forgot" ? (resetToken ? "新密码" : "校园邮箱") : "校园邮箱"}><input type={mode === "forgot" && resetToken ? "password" : "email"} value={mode === "forgot" && resetToken ? password : email} onChange={(event) => (mode === "forgot" && resetToken ? setPassword(event.target.value) : setEmail(event.target.value))} required autoComplete="email" placeholder="name@dlut.edu.cn" className="auth-input" /></AuthField>
            {mode !== "forgot" && <AuthField label="密码"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={72} autoComplete={mode === "login" ? "current-password" : "new-password"} className="auth-input" />{mode === "register" && <span className="mt-2 block text-[11px] text-[var(--muted)]">至少 8 位，同时包含字母和数字</span>}</AuthField>}
            {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">{error}</p>}
            {notice && <p role="status" className="rounded-xl border border-[var(--lime)] bg-[var(--lime)]/30 px-4 py-3 text-xs">{notice}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(23,32,51,0.14)] transition hover:-translate-y-0.5 disabled:opacity-60">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4 text-[var(--lime)]" />} {loading ? (mode === "login" ? "登录中…" : mode === "register" ? "创建中…" : "处理中…") : (mode === "login" ? "登录" : mode === "register" ? "注册并登录" : resetToken ? "重置密码" : "生成重置令牌")}</button>
          </form>
          {mode === "forgot" && <button type="button" onClick={() => switchMode("login")} className="mt-5 w-full text-center text-xs font-semibold text-[var(--muted)]">返回登录</button>}
          {mode === "login" && <><button type="button" onClick={() => switchMode("forgot")} className="mt-5 w-full text-center text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--violet)]">忘记密码？</button><div className="mt-5 rounded-2xl bg-[var(--lime)]/30 p-4 text-xs leading-6 lg:hidden"><strong>Demo 账户</strong><br />student@dlut.edu.cn / demo1234</div></>}
        </div>
      </section>
    </div>
  );
}

function AuthField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold">{label}</span>{children}</label>;
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
