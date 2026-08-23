"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ClipboardCheck, LoaderCircle, Sparkles } from "lucide-react";
import { SkillBars } from "@/components/skill-bars";
import { profileInterestOptions, profileQuestions } from "@/lib/questionnaire";
import type { GeneratedProfile } from "@/lib/types";

export default function OnboardingPage() {
  const [name, setName] = useState("陆同学");
  const [major, setMajor] = useState("软件工程");
  const [grade, setGrade] = useState("大一");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [interests, setInterests] = useState<string[]>(["人工智能", "软件开发"]);
  const [evidence, setEvidence] = useState("");
  const [result, setResult] = useState<GeneratedProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const answered = Object.keys(answers).length;
  const progress = useMemo(() => Math.round(answered / profileQuestions.length * 100), [answered]);

  function toggleInterest(value: string) {
    setInterests((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value].slice(0, 6));
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "questionnaire", name, major, grade, answers, interests, evidence }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) { setError(data.message); return; }
    localStorage.setItem("dut-link-profile", JSON.stringify(data));
    window.dispatchEvent(new Event("storage"));
    setResult(data);
  }

  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
    <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft className="size-4" /> 返回首页</Link>
    <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_0.72fr]">
      <section><p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--coral)]">Competition capability survey</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.04em]">用竞赛与项目事实构建能力画像</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">16 道跨专业统一问题调查问题解决、调研表达、竞赛经验和项目交付，重点记录可验证的参赛与协作事实，不分析人格类型。</p>
        <form onSubmit={submit} className="mt-7 space-y-6">
          <section className="card grid gap-4 p-6 sm:grid-cols-3"><Field label="称呼" value={name} onChange={setName} /><Field label="专业 *" value={major} onChange={setMajor} /><label><span className="mb-2 block text-xs font-bold">年级</span><select value={grade} onChange={(event) => setGrade(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm"><option>大一</option><option>大二</option><option>大三</option><option>大四</option><option>研究生</option></select></label></section>
          <section className="card p-6 sm:p-7"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">竞赛能力调查</h2><p className="mt-1 text-xs text-[var(--muted)]">请选择最接近你当前真实经历的一项</p></div><span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--violet)]">{answered}/{profileQuestions.length}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-[var(--violet)] transition-all" style={{ width: `${progress}%` }} /></div><div className="mt-7 space-y-7">{profileQuestions.map((question, index) => <fieldset key={question.id}><legend className="text-sm font-semibold leading-6"><span className="mr-2 text-[var(--coral)]">{String(index + 1).padStart(2, "0")}</span>{question.text}</legend><div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-5">{question.options.map((label, optionIndex) => { const value = optionIndex + 1; return <label key={label} className={`cursor-pointer rounded-xl border p-2 text-center transition ${answers[question.id] === value ? "border-[var(--violet)] bg-[#ebe8ff] text-[var(--violet)]" : "border-black/[0.07] bg-white"}`}><input className="sr-only" type="radio" name={question.id} value={value} checked={answers[question.id] === value} onChange={() => setAnswers((current) => ({ ...current, [question.id]: value }))} /><span className="text-[10px] leading-4">{label}</span></label>; })}</div></fieldset>)}</div></section>
          <section className="card p-6 sm:p-7"><h2 className="text-xl font-bold">兴趣与证据</h2><p className="mt-1 text-xs text-[var(--muted)]">兴趣不会影响能力分数，但会参与比赛和队友推荐。</p><div className="mt-5 flex flex-wrap gap-2">{profileInterestOptions.map((item) => <button key={item} type="button" onClick={() => toggleInterest(item)} aria-pressed={interests.includes(item)} className={`rounded-full px-4 py-2 text-xs font-semibold ${interests.includes(item) ? "bg-[var(--lime)]" : "bg-[var(--paper)]"}`}>{item}</button>)}</div><label className="mt-5 block"><span className="mb-2 block text-xs font-bold">补充作品或项目证据（选填）</span><textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} rows={3} placeholder="例如：完成过课程管理系统，负责前端和接口联调" className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label></section>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-4 text-sm font-bold text-white disabled:opacity-60">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <ClipboardCheck className="size-4 text-[var(--lime)]" />}{loading ? "正在计算竞赛能力…" : "生成竞赛能力画像"}<ArrowRight className="size-4" /></button>
        </form>
      </section>
      <aside className="lg:pt-24">{result ? <div className="card sticky top-8 p-6 sm:p-7"><span className="inline-flex items-center gap-2 rounded-full bg-[var(--lime)]/60 px-3 py-1.5 text-xs font-bold"><Sparkles className="size-3.5" /> {result.analysisMode === "questionnaire-ai" ? "规则评分 · AI 个性化解释" : "统一规则评分 · AI 降级"}</span><h2 className="mt-5 text-2xl font-bold">你的竞赛能力坐标</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">{result.summary}</p><div className="mt-7"><SkillBars skills={result.skills} /></div><div className="mt-7 flex flex-wrap gap-2">{result.interests.map((item) => <span key={item} className="rounded-full bg-[#ebe8ff] px-3 py-1.5 text-xs font-semibold text-[var(--violet)]">{item}</span>)}</div><Link href="/account" className="mt-7 flex items-center justify-center gap-2 rounded-2xl border border-black/10 px-4 py-3 text-xs font-bold">查看完整画像 <ArrowRight className="size-4" /></Link></div> : <div className="sticky top-8 rounded-[32px] border border-dashed border-black/10 p-8 text-center"><div className="mx-auto grid size-16 place-items-center rounded-3xl bg-[#ebe8ff] text-[var(--violet)]"><ClipboardCheck className="size-7" /></div><h2 className="mt-5 text-xl font-bold">规则定量，AI 负责解释</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">统一题目决定能力分数，AI 只结合证据生成总结和方向；模型不可用时自动返回规则画像。</p></div>}</aside>
    </div>
  </div>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span className="mb-2 block text-xs font-bold">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>;
}
