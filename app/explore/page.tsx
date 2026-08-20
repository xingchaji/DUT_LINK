import { ArrowRight, Compass, Dices, RefreshCw, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { discoveries, matches } from "@/lib/mock-data";

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <PageHeader eyebrow="Serendipity Engine" title="今天，遇见一点意外" />
      <section className="dot-grid relative mt-8 overflow-hidden rounded-[36px] bg-[var(--violet)] p-7 text-white sm:p-10">
        <div className="absolute -right-12 -top-12 size-48 rounded-full bg-[var(--coral)]/80 blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold"><Dices className="size-4" /> 今日盲盒已开启</span><h2 className="mt-6 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">{discoveries[0].title}</h2><p className="mt-5 max-w-xl text-sm leading-7 text-white/75">{discoveries[0].description}</p><div className="mt-6 flex flex-wrap items-center gap-3"><span className="rounded-full bg-[var(--lime)] px-3 py-1.5 text-xs font-bold text-[var(--ink)]">{discoveries[0].bridge}</span><span className="text-xs text-white/60">{discoveries[0].readTime}</span></div></div>
          <button className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 p-5 text-left backdrop-blur-sm"><div><p className="text-xs text-white/55">不太对胃口？</p><p className="mt-1 text-sm font-bold">换一个未知方向</p></div><RefreshCw className="size-5" /></button>
        </div>
      </section>
      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="card p-6 sm:p-7"><div className="flex items-center gap-3"><Compass className="size-5 text-[var(--coral)]" /><h2 className="font-[family-name:var(--font-display)] text-xl font-bold">更多跨域灵感</h2></div>{discoveries.slice(1).map((item) => <article key={item.title} className="mt-5 rounded-3xl bg-[var(--paper)] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--coral)]">{item.eyebrow}</p><h3 className="mt-3 text-lg font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p><button className="mt-5 inline-flex items-center gap-2 text-xs font-bold">开始探索 <ArrowRight className="size-3.5" /></button></article>)}</section>
        <section className="card p-6 sm:p-7"><div className="flex items-center gap-3"><UserRound className="size-5 text-[var(--cyan)]" /><div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold">和谁聊聊？</h2><p className="text-xs text-[var(--muted)]">知识之后，连接到真实的人</p></div></div><div className="mt-5 space-y-3">{matches.slice(1).map((person) => <div key={person.id} className="rounded-2xl border border-black/[0.06] p-4"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-[#dcf2ee] text-sm font-bold text-[#238983]">{person.avatar}</div><div><p className="text-sm font-bold">{person.name}</p><p className="text-[11px] text-[var(--muted)]">{person.major}</p></div></div><p className="mt-3 text-xs leading-5 text-[var(--muted)]">可以聊：{person.reason}</p></div>)}</div></section>
      </div>
    </div>
  );
}

