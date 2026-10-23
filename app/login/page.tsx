"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  LogIn,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";

type Mode = "login" | "register" | "forgot";

const MODE_COPY: Record<Mode, { label: string; title: string; lede: string }> = {
  login: {
    label: "Welcome back",
    title: "登录 DUT Link",
    lede: "继续维护能力画像、发现比赛并处理组队协作。",
  },
  register: {
    label: "New account",
    title: "创建校园账号",
    lede: "仅允许大连理工大学邮箱注册；邮箱验证码将在邮件服务接入后启用。",
  },
  forgot: {
    label: "Account recovery",
    title: "找回密码",
    lede: "输入注册邮箱生成重置令牌，生产环境将通过邮件发送重置链接。",
  },
};

const VALUE_POINTS = [
  { icon: BrainCircuit, text: "持续维护可解释的能力画像" },
  { icon: UsersRound, text: "创建队伍、申请加入并处理邀请" },
  { icon: BadgeCheck, text: "赛事事实保留可追溯来源" },
] as const;

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

  const copy = MODE_COPY[mode];
  const ModeIcon = mode === "login" ? LogIn : mode === "register" ? UserPlus : KeyRound;
  const resetsPassword = mode === "forgot" && Boolean(resetToken);

  return (
    <div className="page-shell flex min-h-[calc(100vh-9rem)] items-center justify-center lg:min-h-[calc(100vh-4.5rem)]">
      {/* 表单卡：纸张堆叠只留一层 + e3 浮起，光源仍在左上 */}
      <Reveal delay={80} className="stack w-full max-w-[880px] rounded-[16px] after:hidden">
        <section className="card e3 grid overflow-hidden md:grid-cols-[0.86fr_1fr]">
          <aside className="flex flex-col border-b border-line bg-raise p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_1px_0_0_rgba(255,255,255,0.7)] sm:p-8 md:border-b-0 md:border-r lg:p-9">
            <Logo />

            <p className="mt-7 max-w-[24rem] text-[13.5px] font-medium leading-6 text-ink-soft">让你的能力，被合适的人看见。</p>
            <p className="mt-2 max-w-[24rem] text-[12px] leading-6 text-muted">
              登录后，能力画像、比赛意向和组队记录会归属于同一个校园账号。
            </p>

            <ul className="mt-6 hidden divide-y divide-line border-t border-line md:block">
              {VALUE_POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <li key={point.text} className="flex items-center gap-2.5 py-2.5">
                    <span className="glyph size-6 shrink-0 rounded-[6px] text-muted">
                      <Icon className="size-3.5" strokeWidth={1.8} />
                    </span>
                    <span className="text-[12px] leading-5 text-ink-soft">{point.text}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 space-y-4 md:mt-auto md:pt-8">
              {mode === "login" && (
                <div className="panel rounded-[10px] px-3 py-2.5">
                  <p className="text-[10.5px] text-faint">Demo 账户</p>
                  <p className="num mt-1 text-[11.5px] leading-5 text-ink-soft">student@dlut.edu.cn · demo1234</p>
                </div>
              )}
              <Link
                href="/"
                className="flex h-8 w-fit items-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-ink"
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.9} />
                返回首页
              </Link>
            </div>
          </aside>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-2.5">
              <span className="glyph size-8 shrink-0 text-ink-soft">
                <ModeIcon className="size-4" strokeWidth={1.8} />
              </span>
              <span className="section-label">{copy.label}</span>
            </div>

            <h1 className="mt-4 text-[21px] font-semibold leading-tight tracking-[-0.022em] text-ink">{copy.title}</h1>
            <p className="mt-2 text-[12.5px] leading-6 text-muted">{copy.lede}</p>

            {mode !== "forgot" && (
              <div role="group" aria-label="切换登录或注册" className="seg mt-6 flex w-full">
                <button
                  type="button"
                  aria-pressed={mode === "login"}
                  onClick={() => switchMode("login")}
                  data-active={mode === "login"}
                  className="seg-item h-8 flex-1 justify-center text-[12.5px] active:scale-[0.99]"
                >
                  登录
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "register"}
                  onClick={() => switchMode("register")}
                  data-active={mode === "register"}
                  className="seg-item h-8 flex-1 justify-center text-[12.5px] active:scale-[0.99]"
                >
                  注册
                </button>
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "register" && (
                <>
                  <AuthField label="姓名或昵称">
                    <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={30} className="field" />
                  </AuthField>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AuthField label="专业">
                      <input value={major} onChange={(event) => setMajor(event.target.value)} required maxLength={40} className="field" />
                    </AuthField>
                    <AuthField label="年级（选填）">
                      <input value={grade} onChange={(event) => setGrade(event.target.value)} maxLength={20} placeholder="例如：大二" className="field" />
                    </AuthField>
                  </div>
                </>
              )}

              {resetsPassword && (
                <AuthField label="重置令牌">
                  <input value={resetToken} onChange={(event) => setResetToken(event.target.value)} required className="field" />
                </AuthField>
              )}

              <AuthField label={mode === "forgot" ? (resetToken ? "新密码" : "校园邮箱") : "校园邮箱"}>
                <input
                  type={resetsPassword ? "password" : "email"}
                  value={resetsPassword ? password : email}
                  onChange={(event) => (resetsPassword ? setPassword(event.target.value) : setEmail(event.target.value))}
                  required
                  autoComplete="email"
                  placeholder="name@dlut.edu.cn"
                  className="field"
                />
              </AuthField>

              {mode !== "forgot" && (
                <AuthField
                  label="密码"
                  hint={mode === "register" ? "至少 8 位，同时包含字母和数字" : undefined}
                >
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="field"
                  />
                </AuthField>
              )}

              {error && (
                <p role="alert" className="callout callout-clay items-start px-3.5 py-3 text-[12.5px] leading-6 text-clay">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
                  <span className="min-w-0">{error}</span>
                </p>
              )}
              {notice && (
                <p role="status" className="callout callout-moss items-start px-3.5 py-3 text-[12.5px] leading-6 text-moss">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
                  <span className="min-w-0">{notice}</span>
                </p>
              )}

              <Magnetic strength={4} className="w-full">
                <button disabled={loading} className="btn btn-primary btn-block">
                  {loading ? (
                    <LoaderCircle className="size-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-3.5" strokeWidth={1.9} />
                  )}
                  {loading
                    ? mode === "login"
                      ? "登录中…"
                      : mode === "register"
                        ? "创建中…"
                        : "处理中…"
                    : mode === "login"
                      ? "登录"
                      : mode === "register"
                        ? "注册并登录"
                        : resetToken
                          ? "重置密码"
                          : "生成重置令牌"}
                </button>
              </Magnetic>
            </form>

            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="mt-3 flex h-8 w-full items-center justify-center text-[12px] font-medium text-muted transition-colors hover:text-ink"
              >
                返回登录
              </button>
            )}
            {mode === "login" && (
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="mt-3 flex h-8 w-full items-center justify-center text-[12px] font-medium text-muted transition-colors hover:text-ink"
              >
                忘记密码
              </button>
            )}
          </div>
        </section>
      </Reveal>
    </div>
  );
}

function AuthField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
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
