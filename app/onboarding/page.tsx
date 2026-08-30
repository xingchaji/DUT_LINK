"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, ChevronLeft, ClipboardCheck, LoaderCircle, Sparkles, Target } from "lucide-react";
import { SkillBars } from "@/components/skill-bars";
import { profileInterestOptions, profileQuestions } from "@/lib/questionnaire";
import type { GeneratedProfile, UserAccountProfile } from "@/lib/types";

const QUESTIONS_PER_STEP = 4;
const STEP_LABELS = ["问题解决", "调研表达", "竞赛经验", "项目交付"];

export default function OnboardingPage() {
  const [accountProfile, setAccountProfile] = useState<UserAccountProfile | null>(null);
  const [identityLoading, setIdentityLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [interests, setInterests] = useState<string[]>(["人工智能", "软件开发"]);
  const [evidence, setEvidence] = useState("");
  const [result, setResult] = useState<GeneratedProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  const answered = Object.keys(answers).length;
  const progress = useMemo(() => Math.round(answered / profileQuestions.length * 100), [answered]);
  const totalSteps = Math.ceil(profileQuestions.length / QUESTIONS_PER_STEP);
  const currentQuestions = profileQuestions.slice(step * QUESTIONS_PER_STEP, (step + 1) * QUESTIONS_PER_STEP);
  const currentComplete = currentQuestions.every((question) => answers[question.id]);
  const isLastStep = step === totalSteps - 1;

  useEffect(() => {
    fetch("/api/account", { cache: "no-store" })
      .then(async (response) => ({ response, data: await response.json() }))
      .then(({ response, data }) => {
        if (response.ok) setAccountProfile(data.profile);
        else setError(data.message ?? "无法读取个人主页资料");
      })
      .catch(() => setError("无法读取个人主页资料"))
      .finally(() => setIdentityLoading(false));
  }, []);

  function toggleInterest(value: string) {
    setInterests((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value].slice(0, 6));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "questionnaire", answers, interests, evidence }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setError(data.message); return; }
    localStorage.setItem("dut-link-profile", JSON.stringify(data));
    window.dispatchEvent(new Event("storage"));
    setResult(data);
  }

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9 xl:px-12">
      <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/70 px-3.5 py-2 text-xs font-semibold text-[var(--muted)] shadow-sm transition hover:text-[var(--ink)]"><ArrowLeft className="size-4" /> 返回首页</Link>

      <section className="dot-grid relative mt-5 overflow-hidden rounded-[30px] bg-[var(--ink)] px-6 py-8 text-white shadow-[0_28px_70px_rgba(23,32,51,0.16)] sm:px-9 sm:py-10">
        <div className="absolute -right-20 -top-24 size-64 rounded-full bg-[var(--violet)]/70 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60"><BrainCircuit className="size-3.5 text-[var(--lime)]" /> Competition capability survey</span><h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-extrabold leading-tight tracking-[-0.045em] sm:text-5xl">用竞赛事实构建能力画像</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">16 道统一问题衡量问题解决、调研表达、竞赛经验和项目交付。分数由规则计算，AI 只负责结合证据进行解释。</p></div>
          <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/8 bg-white/[0.065] px-5 py-4"><p className="text-3xl font-extrabold">{answered}</p><p className="mt-1 text-[10px] text-white/45">已回答 / {profileQuestions.length}</p></div><div className="rounded-2xl border border-[var(--lime)]/20 bg-[var(--lime)]/10 px-5 py-4"><p className="text-3xl font-extrabold text-[var(--lime)]">{progress}%</p><p className="mt-1 text-[10px] text-white/45">画像进度</p></div></div>
        </div>
      </section>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_0.68fr]">
        <form onSubmit={submit} className="space-y-5">
          <section className="card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#eeebff] text-[var(--violet)]"><CheckCircle2 className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--violet)]">身份信息已同步</p><p className="mt-1 text-sm font-semibold">{identityLoading ? "正在读取…" : accountProfile ? `${accountProfile.nickname} · ${accountProfile.major} · ${accountProfile.grade || "年级未填写"}` : "暂未读取到个人资料"}</p></div></div><Link href="/account" className="rounded-full border border-black/[0.08] px-4 py-2.5 text-xs font-bold transition hover:border-[var(--violet)]/25 hover:text-[var(--violet)]">修改个人资料</Link></section>

          <section className="card overflow-hidden">
            <header className="border-b border-black/[0.06] p-6 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Step {String(step + 1).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.035em]">{STEP_LABELS[step] ?? "竞赛能力调查"}</h2><p className="mt-2 text-xs text-[var(--muted)]">请选择最接近你当前真实经历的一项。</p></div><span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--violet)]">{answered}/{profileQuestions.length}</span></div><div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="mt-5 h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-[var(--violet)] transition-all" style={{ width: `${progress}%` }} /></div></header>

            <div className="space-y-8 p-6 sm:p-7">
              {currentQuestions.map((question, questionIndex) => {
                const index = step * QUESTIONS_PER_STEP + questionIndex;
                return <fieldset key={question.id}><legend className="flex gap-3 text-sm font-semibold leading-6"><span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--coral)]">{String(index + 1).padStart(2, "0")}</span><span>{question.text}</span></legend><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">{question.options.map((label, optionIndex) => { const value = optionIndex + 1; const selected = answers[question.id] === value; return <label key={label} className={`cursor-pointer rounded-xl border p-3 text-center transition ${selected ? "border-[var(--violet)] bg-[#eeebff] text-[var(--violet)] shadow-sm" : "border-black/[0.07] bg-white hover:border-[var(--violet)]/25"}`}><input className="sr-only" type="radio" name={question.id} value={value} checked={selected} onChange={() => setAnswers((current) => ({ ...current, [question.id]: value }))} /><span className="text-[10px] leading-4">{label}</span></label>; })}</div></fieldset>;
              })}
            </div>

            <footer className="flex items-center justify-between border-t border-black/[0.06] bg-[var(--paper)]/60 p-5 sm:px-7"><button type="button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-[var(--muted)] disabled:opacity-30"><ChevronLeft className="size-4" /> 上一步</button>{!isLastStep && <button type="button" disabled={!currentComplete} onClick={() => setStep((current) => Math.min(totalSteps - 1, current + 1))} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ink)] px-5 py-3 text-xs font-bold text-white disabled:opacity-35">继续下一组 <ArrowRight className="size-4" /></button>}</footer>
          </section>

          {isLastStep && <section className="card p-6 sm:p-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[var(--lime)]/60"><Target className="size-5" /></span><div><h2 className="text-xl font-extrabold">兴趣与证据</h2><p className="text-xs text-[var(--muted)]">兴趣不改变能力分数，但会参与比赛和队友推荐。</p></div></div><div className="mt-5 flex flex-wrap gap-2">{profileInterestOptions.map((item) => <button key={item} type="button" onClick={() => toggleInterest(item)} aria-pressed={interests.includes(item)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${interests.includes(item) ? "border-[var(--lime)] bg-[var(--lime)]" : "border-black/[0.06] bg-[var(--paper)] text-[var(--muted)]"}`}>{item}</button>)}</div><label className="mt-5 block"><span className="mb-2 block text-xs font-bold">补充作品或项目证据（选填）</span><textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} rows={4} placeholder="例如：完成过课程管理系统，负责前端和接口联调" className="w-full rounded-2xl border border-black/[0.08] bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label></section>}

          {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">{error}</p>}
          {isLastStep && <button disabled={loading || identityLoading || !accountProfile || answered !== profileQuestions.length} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-4 text-sm font-bold text-white shadow-[0_16px_34px_rgba(23,32,51,0.14)] transition hover:-translate-y-0.5 disabled:opacity-40">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <ClipboardCheck className="size-4 text-[var(--lime)]" />}{loading ? "正在计算竞赛能力…" : "生成竞赛能力画像"}<ArrowRight className="size-4" /></button>}
        </form>

        <aside>
          {result ? <div className="card sticky top-8 p-6 sm:p-7"><span className="inline-flex items-center gap-2 rounded-full bg-[var(--lime)]/60 px-3 py-1.5 text-xs font-bold"><Sparkles className="size-3.5" /> {result.analysisMode === "questionnaire-ai" ? "规则评分 · AI 个性化解释" : "统一规则评分 · AI 降级"}</span><h2 className="mt-5 text-2xl font-extrabold tracking-[-0.025em]">你的竞赛能力坐标</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">{result.summary}</p><div className="mt-7"><SkillBars skills={result.skills} /></div><div className="mt-7 flex flex-wrap gap-2">{result.interests.map((item) => <span key={item} className="rounded-full bg-[#eeebff] px-3 py-1.5 text-xs font-semibold text-[var(--violet)]">{item}</span>)}</div><Link href="/account" className="mt-7 flex items-center justify-center gap-2 rounded-2xl border border-black/[0.08] px-4 py-3 text-xs font-bold">查看完整画像 <ArrowRight className="size-4" /></Link></div> : <div className="card sticky top-8 overflow-hidden"><div className="dot-grid bg-[var(--ink)] p-6 text-white"><div className="grid size-12 place-items-center rounded-2xl bg-[var(--lime)] text-[var(--ink)]"><ClipboardCheck className="size-5" /></div><h2 className="mt-5 text-xl font-extrabold">四步完成竞赛画像</h2><p className="mt-2 text-xs leading-6 text-white/55">每步只回答 4 道问题，结果仍采用统一的 16 题评分标准。</p></div><div className="p-5"><div className="space-y-3">{STEP_LABELS.map((label, index) => <div key={label} className={`flex items-center gap-3 rounded-2xl p-3 ${index === step ? "bg-[#eeebff] text-[var(--violet)]" : "bg-[var(--paper)] text-[var(--muted)]"}`}><span className={`grid size-7 place-items-center rounded-full text-[10px] font-bold ${index < step ? "bg-[var(--lime)] text-[var(--ink)]" : index === step ? "bg-[var(--violet)] text-white" : "bg-white"}`}>{index < step ? "✓" : index + 1}</span><strong className="text-xs">{label}</strong></div>)}</div><p className="mt-5 text-xs leading-6 text-[var(--muted)]">规则负责定量，AI 只结合项目证据生成总结和方向；模型不可用时自动返回规则画像。</p></div></div>}
        </aside>
      </div>
    </div>
  );
}
