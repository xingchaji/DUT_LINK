"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Award, BadgeCheck, BookOpen, Compass, Dices, ExternalLink, LoaderCircle, MessageCircle, PenLine, RefreshCw, Send, Sparkles, Trophy, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { WinningWorkStory } from "@/components/winning-work-story";
import { discoveries, matches } from "@/lib/mock-data";
import type { CommunityArticle, Discovery, WinningWorkInsight } from "@/lib/types";

type ExploreView = "inspiration" | "winning-work";

export default function ExplorePage() {
  const [view, setView] = useState<ExploreView>("inspiration");
  const [discovery, setDiscovery] = useState<Discovery>(discoveries[0]);
  const [articles, setArticles] = useState<CommunityArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState("");
  const [workInsight, setWorkInsight] = useState<WinningWorkInsight | null>(null);
  const [workLoading, setWorkLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles").then((response) => response.json()).then((data) => setArticles(data.articles ?? [])).catch(() => undefined);
    fetch("/api/discoveries/winning-work", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { if (data.insight) setWorkInsight(data.insight); })
      .catch(() => setNotice("暂时无法读取获奖作品资料"))
      .finally(() => setWorkLoading(false));
  }, []);

  async function randomize() {
    setLoading(true); setNotice("");
    try {
      const response = await fetch(`/api/discoveries/random?exclude=${discovery.id}`, { cache: "no-store" });
      const data = await response.json();
      if (response.ok && data.discovery) setDiscovery(data.discovery); else setNotice(data.message ?? "暂时无法生成新的跨域灵感");
    } catch {
      setNotice("暂时无法生成新的跨域灵感");
    } finally {
      setLoading(false);
    }
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPublishing(true); setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.get("title"), summary: form.get("summary"), bridge: form.get("bridge") }) });
      const data = await response.json();
      if (!response.ok) { setNotice(data.message ?? "投稿失败"); return; }
      setArticles((current) => [data.article, ...current]); setNotice("投稿已加入社区探索池"); formElement.reset();
    } catch {
      setNotice("投稿失败，请稍后重试");
    } finally {
      setPublishing(false);
    }
  }

  async function refreshWinningWork() {
    setWorkLoading(true); setNotice("");
    try {
      const response = await fetch(`/api/discoveries/winning-work${workInsight ? `?exclude=${workInsight.id}` : ""}`, { cache: "no-store" });
      const data = await response.json();
      if (response.ok && data.insight) setWorkInsight(data.insight); else setNotice(data.message ?? "暂时无法读取获奖作品资料");
    } catch {
      setNotice("暂时无法读取获奖作品资料");
    } finally {
      setWorkLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9 xl:px-12">
      <PageHeader eyebrow="Explore" title="探索新的连接" />
      <div className="mt-4 flex max-w-4xl items-start gap-3 text-sm leading-7 text-[var(--muted)]"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-[var(--violet)]" /><p>从一个可信案例出发，看见其他领域的知识如何进入作品核心，再连接到可以一起实践的人。</p></div>

      <nav aria-label="探索内容" className="mt-7 grid gap-3 sm:grid-cols-2">
        <ExploreTab active={view === "inspiration"} onClick={() => setView("inspiration")} icon={<Compass className="size-5" />} title="跨域灵感" description="来源、文章和同学集中在一个入口" />
        <ExploreTab active={view === "winning-work"} onClick={() => setView("winning-work")} icon={<Trophy className="size-5" />} title="获奖作品解读" description="按专业拆解作品与参赛方法" />
      </nav>

      {notice && <div className="mt-5 rounded-2xl bg-[#fff0ec] px-4 py-3 text-sm text-[var(--coral)]">{notice}{notice.includes("登录") && <Link href="/login?next=/explore" className="ml-2 font-bold underline">去登录</Link>}</div>}

      {view === "inspiration" ? (
        <InspirationHub discovery={discovery} articles={articles} loading={loading} publishing={publishing} onRandomize={randomize} onPublish={publish} />
      ) : (
        <WinningWorkHub insight={workInsight} loading={workLoading} onRefresh={refreshWinningWork} />
      )}
    </div>
  );
}

function ExploreTab({ active, onClick, icon, title, description }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; description: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`interactive-card group relative flex min-h-24 items-center gap-4 overflow-hidden rounded-[24px] border p-5 text-left ${active ? "border-[var(--ink)] bg-[var(--ink)] text-white shadow-[0_18px_45px_rgba(23,32,51,0.14)]" : "border-black/[0.06] bg-white/85 hover:border-[var(--violet)]/25"}`}><span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${active ? "bg-[var(--lime)] text-[var(--ink)]" : "bg-[#eeebff] text-[var(--violet)]"}`}>{icon}</span><span className="min-w-0 flex-1"><strong className="block text-base">{title}</strong><span className={`mt-1 block text-xs leading-5 ${active ? "text-white/55" : "text-[var(--muted)]"}`}>{description}</span></span><ArrowUpRight className={`size-4 shrink-0 transition ${active ? "text-[var(--lime)]" : "text-[var(--muted)] group-hover:rotate-45 group-hover:text-[var(--violet)]"}`} />{active && <span className="absolute inset-x-5 bottom-0 h-0.5 bg-[var(--lime)]" />}</button>;
}

function InspirationHub({ discovery, articles, loading, publishing, onRandomize, onPublish }: { discovery: Discovery; articles: CommunityArticle[]; loading: boolean; publishing: boolean; onRandomize: () => void; onPublish: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <section className="card mt-5 overflow-hidden">
      <div className="dot-grid relative bg-[var(--ink)] p-7 text-white sm:p-9 lg:p-10">
        <div className="absolute -right-12 -top-12 size-56 rounded-full bg-[var(--violet)]/85 blur-3xl" />
        <div className="absolute -bottom-24 left-[35%] size-48 rounded-full bg-[var(--cyan)]/30 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold"><Dices className="size-4 text-[var(--lime)]" /> {discovery.eyebrow}</span><h2 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-extrabold leading-tight tracking-[-0.045em] sm:text-5xl">{discovery.title}</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-white/68">{discovery.description}</p><div className="mt-6 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[var(--lime)] px-3 py-1.5 text-xs font-bold text-[var(--ink)]">{discovery.bridge}</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/60">{discovery.readTime}</span><span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/60"><BadgeCheck className="size-3.5" /> {discovery.generationMode === "ai" ? "AI 个性化生成" : "可信内容整理"}</span></div></div>
          <button type="button" onClick={onRandomize} disabled={loading} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-bold backdrop-blur-sm transition hover:bg-white/15 disabled:opacity-60">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} 换一个灵感</button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8">
          <div className="rounded-[22px] border border-[var(--violet)]/10 bg-[var(--violet)]/[0.065] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--violet)]">Why this for you</p><p className="mt-2 text-sm leading-7"><strong>为什么推荐：</strong>{discovery.why}</p></div>
          <div className="mt-7 flex items-center gap-2"><BookOpen className="size-4 text-[var(--coral)]" /><h3 className="text-sm font-bold">来源与延伸阅读</h3><span className="ml-auto text-[10px] text-[var(--muted)]">所有外部内容均保留原始链接</span></div>
          <div className="mt-3 grid gap-3">{discovery.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-black/[0.06] p-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-[var(--violet)]/20 hover:shadow-md"><span><span className="mr-2 rounded-lg bg-[var(--paper)] px-2 py-1 text-[10px] text-[var(--violet)]">{source.type}</span>{source.title}</span><ExternalLink className="size-4 shrink-0 text-[var(--muted)] transition group-hover:text-[var(--violet)]" /></a>)}</div>

          <div className="mt-7 flex items-center gap-2"><PenLine className="size-4 text-[var(--coral)]" /><h3 className="text-sm font-bold">同学的延伸</h3></div>
          <div className="mt-3 space-y-3">{articles.length ? articles.slice(0, 3).map((article) => <article key={article.id} className="rounded-2xl bg-[var(--paper)] p-5"><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[var(--violet)]">{article.bridge}</span><h4 className="mt-3 text-sm font-bold">{article.title}</h4><p className="mt-1 text-xs leading-6 text-[var(--muted)]">{article.summary}</p><p className="mt-3 text-[10px] font-semibold">{article.authorName} · {article.authorMajor}</p></article>) : <p className="text-xs text-[var(--muted)]">暂时没有同学投稿。</p>}</div>
        </div>

        <aside className="border-t border-black/[0.06] bg-[var(--paper)]/75 p-6 sm:p-8 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2"><UserRound className="size-4 text-[var(--cyan)]" /><h3 className="text-sm font-bold">推荐同学</h3></div>
          <div className="mt-4 space-y-3">{matches.slice(1).map((person) => <Link key={person.id} href={`/people/${person.id}`} className="group flex items-center gap-3 rounded-2xl bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#dcf2ee] text-sm font-bold text-[#238983]">{person.avatar}</span><span className="min-w-0 flex-1"><strong className="block text-sm">{person.name} · {person.major}</strong><span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{person.reason}</span><span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[var(--violet)]">查看主页与联系方式 <MessageCircle className="size-3" /></span></span></Link>)}</div>

          <details className="group mt-6 rounded-2xl border border-black/[0.05] bg-white p-5"><summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold"><span className="flex items-center gap-2"><Send className="size-4 text-[var(--violet)]" />分享一个跨域连接</span><span className="text-lg text-[var(--muted)] transition group-open:rotate-45">＋</span></summary><form onSubmit={onPublish} className="mt-5 space-y-3"><Input name="title" placeholder="文章标题" /><Input name="bridge" placeholder="例如：建筑 × 软件工程" /><textarea name="summary" required rows={4} placeholder="这个连接为什么值得分享？" className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /><button disabled={publishing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-xs font-bold text-white">{publishing ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />} 提交</button></form></details>
        </aside>
      </div>
    </section>
  );
}

function WinningWorkHub({ insight, loading, onRefresh }: { insight: WinningWorkInsight | null; loading: boolean; onRefresh: () => void }) {
  return (
    <section className="card mt-5 overflow-hidden">
      <div className="dot-grid relative overflow-hidden bg-[var(--ink)] p-6 text-white sm:p-8"><div className="absolute -right-20 -top-24 size-64 rounded-full bg-[var(--violet)]/65 blur-3xl" /><div className="relative flex flex-wrap items-start justify-between gap-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[var(--lime)] text-[var(--ink)]"><Award className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Winning Work Review</p><h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.03em]">获奖作品专业解读</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-white/55">从作品设计思路、跨学科接口和验证方法中提炼可复用的参赛经验。</p></div></div><button type="button" onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-bold transition hover:bg-white/15 disabled:opacity-60">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} 换一件作品</button></div></div>
      {loading && !insight ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-[var(--muted)]"><LoaderCircle className="size-4 animate-spin" /> 正在整理作品资料…</div> : insight ? <article className="mx-auto max-w-5xl p-6 sm:p-10"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[var(--lime)]/60 px-3 py-1.5 text-[10px] font-bold">{insight.mode === "ai" ? "AI 专业分析" : "核验资料分析"}</span><span className="rounded-full bg-[#ebe8ff] px-3 py-1.5 text-[10px] font-bold text-[var(--violet)]">面向 {insight.recommendedFor}</span></div><p className="mt-7 text-xs font-bold text-[var(--coral)]">{insight.competitionTitle} · {insight.year ?? "年份见官方来源"} · {insight.award}</p><h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl">{insight.workTitle}</h3><p className="mt-3 text-xs text-[var(--muted)]">{insight.school}</p><div className="mt-7 rounded-3xl border border-[var(--violet)]/10 bg-[#f5f3ff] p-5"><p className="text-xs font-bold text-[var(--violet)]">为什么与你相关</p><p className="mt-2 text-sm leading-7">{insight.relevanceReason}</p></div><p className="mt-7 text-sm leading-8 text-[var(--muted)]">{insight.introduction}</p><WinningWorkStory key={insight.id} insight={insight} /><section className="mt-8 rounded-3xl bg-[#ebe8ff] p-6"><div className="flex items-center gap-2 text-[var(--violet)]"><Sparkles className="size-4" /><strong className="text-sm">可复用的参赛方法</strong></div><p className="mt-3 text-sm leading-7">{insight.crossDisciplinaryValue}</p><div className="mt-4 flex flex-wrap gap-2">{insight.takeaways.map((item) => <span key={item} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold">{item}</span>)}</div></section><a href={insight.source.url} target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-between rounded-2xl border border-black/[0.07] bg-white p-4 text-xs font-bold transition hover:border-[var(--violet)]/25 hover:text-[var(--violet)]"><span>查看原作品与官方来源：{insight.source.title}</span><ExternalLink className="size-4 shrink-0" /></a></article> : <div className="p-12 text-center text-sm text-[var(--muted)]">暂时没有可核验的获奖作品资料。</div>}
    </section>
  );
}

function Input({ name, placeholder }: { name: string; placeholder: string }) {
  return <input name={name} required placeholder={placeholder} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" />;
}
