"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { SkillBars } from "@/components/skill-bars";
import type { GeneratedProfile, ProfileInput } from "@/lib/types";

const initial: ProfileInput = { name: "", major: "", grade: "大一", bio: "", experiences: "", interests: "" };

export default function OnboardingPage() {
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState<GeneratedProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(key: keyof ProfileInput, value: string) { setForm((current) => ({ ...current, [key]: value })); }

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) setError(data.message ?? "生成失败，请稍后重试"); else setResult(data);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft className="size-4" /> 返回首页</Link>
      <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_0.9fr]">
        <section><p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--coral)]">Build your profile</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.04em]">告诉我们，你做过什么</h1><p className="mt-3 text-sm leading-7 text-[var(--muted)]">不需要精心组织语言。课程作业、社团、失败的项目和刚开始的兴趣，都可以成为认识你的线索。</p>
          <form onSubmit={submit} className="card mt-7 space-y-5 p-6 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2"><Field label="怎么称呼你" value={form.name} placeholder="陆同学" onChange={(value) => update("name", value)} /><Field label="专业 *" value={form.major} placeholder="软件工程" onChange={(value) => update("major", value)} /></div>
            <label className="block"><span className="mb-2 block text-xs font-bold">年级</span><select value={form.grade} onChange={(event) => update("grade", event.target.value)} className="w-full rounded-2xl border border-black/[0.08] bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]"><option>大一</option><option>大二</option><option>大三</option><option>大四</option><option>研究生</option></select></label>
            <TextArea label="项目与学习经历 *" value={form.experiences} placeholder={'例如：\n· 用 C++ 做过课程管理系统\n· 参加游戏社，用 EasyX 做过小游戏\n· 正在学习 Python 数据分析'} onChange={(value) => update("experiences", value)} />
            <TextArea label="兴趣关键词" value={form.interests} placeholder="独立游戏、摄影、人工智能、羽毛球……" onChange={(value) => update("interests", value)} compact />
            <TextArea label="还有什么想让我们知道" value={form.bio} placeholder="最近在做什么、想尝试什么，或者困惑于什么？" onChange={(value) => update("bio", value)} compact />
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">{error}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-4 text-sm font-bold text-white disabled:opacity-60">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4 text-[var(--lime)]" />}{loading ? "正在分析经历…" : "生成我的能力画像"}<ArrowRight className="size-4" /></button>
          </form>
        </section>
        <aside className="lg:pt-20">{result ? <div className="card sticky top-8 p-6 sm:p-7"><span className="inline-flex items-center gap-2 rounded-full bg-[var(--lime)]/60 px-3 py-1.5 text-xs font-bold"><Sparkles className="size-3.5" /> 初步画像已生成</span><h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold">你身上的可能性</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">{result.summary}</p><div className="mt-7"><SkillBars skills={result.skills} /></div><div className="mt-7"><p className="text-xs font-bold">潜在方向</p><div className="mt-3 flex flex-wrap gap-2">{result.potentialDirections.map((item) => <span key={item} className="rounded-full bg-[#ebe8ff] px-3 py-1.5 text-xs font-semibold text-[var(--violet)]">{item}</span>)}</div></div><Link href="/profile" className="mt-7 flex items-center justify-center gap-2 rounded-2xl border border-black/10 px-4 py-3 text-xs font-bold">查看完整画像 <ArrowRight className="size-4" /></Link></div> : <div className="sticky top-8 rounded-[32px] border border-dashed border-black/10 p-8 text-center"><div className="mx-auto grid size-16 place-items-center rounded-3xl bg-[#ebe8ff] text-[var(--violet)]"><Sparkles className="size-7" /></div><h2 className="mt-5 font-[family-name:var(--font-display)] text-xl font-bold">你的画像会出现在这里</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">我们会先提取能力线索，再给出潜在方向。当前 Demo 使用本地规则模拟，后续可无缝替换为真实 AI。</p></div>}</aside>
      </div>
    </div>
  );
}

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-black/[0.08] bg-[var(--paper)] px-4 py-3 text-sm outline-none transition placeholder:text-black/25 focus:border-[var(--violet)] focus:bg-white" /></label>;
}

function TextArea({ label, value, placeholder, onChange, compact = false }: { label: string; value: string; placeholder: string; onChange: (value: string) => void; compact?: boolean }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={compact ? 3 : 6} className="w-full resize-none rounded-2xl border border-black/[0.08] bg-[var(--paper)] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-black/25 focus:border-[var(--violet)] focus:bg-white" /></label>;
}

