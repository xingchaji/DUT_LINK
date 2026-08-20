import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight, CircleUserRound, Orbit, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SkillBars } from "@/components/skill-bars";
import { demoProfile, matches, opportunities } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
      <PageHeader eyebrow="Thursday · 20 August" title="下午好，陆同学" />

      <section className="dot-grid relative mt-8 overflow-hidden rounded-[34px] bg-[var(--ink)] px-6 py-8 text-white sm:px-9 sm:py-10">
        <div className="absolute -right-16 -top-28 size-72 rounded-full bg-[var(--violet)] opacity-70 blur-2xl" />
        <div className="absolute bottom-[-7rem] right-40 size-56 rounded-full bg-[var(--cyan)] opacity-30 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold"><Sparkles className="size-3.5 text-[var(--lime)]" /> AI 今日洞察</span>
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.12] tracking-[-0.04em] sm:text-5xl">你的技术能力，正在靠近一个<br className="hidden sm:block" />有趣的新方向。</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">基于近期新增的 Unity 项目经历，我们发现「空间设计 × 游戏开发」可能成为你的独特优势。</p>
          <Link href="/explore" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--lime)] px-5 py-3 text-sm font-bold text-[var(--ink)] transition hover:gap-3">拆开今日盲盒 <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <div className="mt-7 grid gap-7 xl:grid-cols-[1.12fr_0.88fr]">
        <section className="card p-6 sm:p-7">
          <div className="flex items-start justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Your profile</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">能力雷达</h2></div>
            <Link href="/profile" className="flex items-center gap-1 text-xs font-semibold text-[var(--violet)]">完整画像 <ChevronRight className="size-4" /></Link>
          </div>
          <div className="mt-7 grid gap-7 sm:grid-cols-[1fr_0.78fr] sm:items-center">
            <SkillBars skills={demoProfile.skills} />
            <div className="relative mx-auto grid aspect-square w-full max-w-[220px] place-items-center rounded-full border border-dashed border-[var(--violet)]/30 bg-[var(--violet)]/[0.06]">
              <div className="grid size-[72%] place-items-center rounded-full border border-[var(--violet)]/20 bg-white shadow-sm">
                <div className="text-center"><span className="font-[family-name:var(--font-display)] text-4xl font-bold">78</span><span className="text-sm text-[var(--muted)]">/100</span><p className="mt-1 text-xs font-semibold text-[var(--violet)]">画像完整度</p></div>
              </div>
              <span className="absolute left-0 top-5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold shadow-sm">工程思维</span>
              <span className="absolute bottom-4 right-0 rounded-full bg-[var(--lime)] px-3 py-1.5 text-[10px] font-bold">创意潜力</span>
            </div>
          </div>
        </section>

        <section className="card p-6 sm:p-7">
          <div className="flex items-start justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">People to meet</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">值得认识的人</h2></div>
            <Link href="/teams" className="flex items-center gap-1 text-xs font-semibold text-[var(--violet)]">查看全部 <ChevronRight className="size-4" /></Link>
          </div>
          <div className="mt-5 divide-y divide-black/[0.055]">
            {matches.slice(0, 3).map((person, index) => (
              <div key={person.id} className="flex items-center gap-4 py-4 first:pt-1">
                <div className={`grid size-11 shrink-0 place-items-center rounded-2xl text-sm font-bold ${index === 0 ? "bg-[#ebe8ff] text-[var(--violet)]" : index === 1 ? "bg-[#dcf2ee] text-[#238983]" : "bg-[#fff0df] text-[#c1762e]"}`}>{person.avatar}</div>
                <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-bold">{person.name}</p><span className="rounded-full bg-[var(--lime)]/70 px-2 py-0.5 text-[10px] font-bold">{person.match}%</span></div><p className="mt-1 truncate text-xs text-[var(--muted)]">{person.major} · {person.reason}</p></div>
                <button aria-label={`认识${person.name}`} className="grid size-8 shrink-0 place-items-center rounded-full border border-black/10"><ArrowRight className="size-3.5" /></button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-7">
        <div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Recommended for you</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">也许适合你的机会</h2></div><span className="hidden text-xs text-[var(--muted)] sm:block">由能力、兴趣与成长空间共同计算</span></div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {opportunities.map((item, index) => {
            const icons = [Orbit, CircleUserRound, BookOpen];
            const Icon = icons[index];
            return (
              <article key={item.title} className="card group p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between"><div className={`grid size-10 place-items-center rounded-2xl ${index === 0 ? "bg-[#ebe8ff] text-[var(--violet)]" : index === 1 ? "bg-[#dcf2ee] text-[#238983]" : "bg-[#fff0df] text-[#bd792a]"}`}><Icon className="size-5" /></div><span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--violet)]">{item.fit}% FIT</span></div>
                <p className="mt-6 text-xs font-semibold text-[var(--muted)]">{item.type} · {item.deadline}</p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-bold">{item.title}</h3>
                <div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-full bg-black/[0.035] px-2.5 py-1 text-[10px] font-medium text-[var(--muted)]">{tag}</span>)}</div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
