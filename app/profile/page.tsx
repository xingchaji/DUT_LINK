import Link from "next/link";
import { ArrowUpRight, BrainCircuit, Layers3, Pencil, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SkillBars } from "@/components/skill-bars";
import { demoProfile } from "@/lib/mock-data";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <PageHeader eyebrow="AI Skill Profile" title="认识真正的自己" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="card p-6">
          <div className="rounded-[24px] bg-[var(--ink)] p-6 text-white">
            <div className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-[var(--coral)] to-[var(--amber)] text-2xl font-bold">陆</div>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold">陆同学</h2>
            <p className="mt-1 text-sm text-white/55">软件工程 · 大一</p>
            <p className="mt-5 text-sm leading-7 text-white/70">{demoProfile.summary}</p>
            <Link href="/onboarding" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold ring-1 ring-white/15"><Pencil className="size-3.5" /> 编辑资料</Link>
          </div>
          <div className="mt-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">兴趣坐标</p><div className="mt-3 flex flex-wrap gap-2">{demoProfile.interests.map((item) => <span key={item} className="rounded-full bg-[var(--lime)]/60 px-3 py-1.5 text-xs font-semibold">{item}</span>)}</div></div>
        </aside>

        <div className="space-y-6">
          <section className="card p-6 sm:p-8"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-[#ebe8ff] text-[var(--violet)]"><BrainCircuit className="size-5" /></div><div><p className="text-xs text-[var(--muted)]">基于经历与作品的综合分析</p><h2 className="font-[family-name:var(--font-display)] text-xl font-bold">核心能力</h2></div></div><div className="mt-7"><SkillBars skills={demoProfile.skills} /></div></section>
          <section className="card p-6 sm:p-8"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-[#fff0df] text-[#bd792a]"><Layers3 className="size-5" /></div><div><p className="text-xs text-[var(--muted)]">AI 推断，不是职业定论</p><h2 className="font-[family-name:var(--font-display)] text-xl font-bold">潜在方向</h2></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{demoProfile.potentialDirections.map((item, i) => <div key={item} className="group rounded-2xl border border-black/[0.06] bg-black/[0.018] p-4"><span className="font-[family-name:var(--font-mono)] text-[10px] font-bold text-[var(--coral)]">0{i + 1}</span><p className="mt-6 font-bold">{item}</p><ArrowUpRight className="mt-3 size-4 text-[var(--muted)] transition group-hover:translate-x-1" /></div>)}</div></section>
          <div className="flex items-start gap-4 rounded-[24px] bg-[var(--lime)]/55 p-5"><Sparkles className="mt-0.5 size-5 shrink-0" /><p className="text-sm leading-6"><strong>画像会持续生长。</strong> 每次新增项目、作品或兴趣，系统都会重新分析，不会把你困在固定标签里。</p></div>
        </div>
      </div>
    </div>
  );
}

