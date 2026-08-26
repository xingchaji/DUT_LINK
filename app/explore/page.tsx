"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Award, BookOpen, Dices, ExternalLink, LoaderCircle, PenLine, RefreshCw, Send, Sparkles, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { WinningWorkStory } from "@/components/winning-work-story";
import { discoveries, matches } from "@/lib/mock-data";
import type { CommunityArticle, Discovery, WinningWorkInsight } from "@/lib/types";

export default function ExplorePage() {
  const [discovery, setDiscovery] = useState<Discovery>(discoveries[0]);
  const [articles, setArticles] = useState<CommunityArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState("");
  const [workInsight, setWorkInsight] = useState<WinningWorkInsight | null>(null);
  const [workLoading, setWorkLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles").then((response) => response.json()).then((data) => setArticles(data.articles ?? []));
    fetch("/api/discoveries/winning-work", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { if (data.insight) setWorkInsight(data.insight); })
      .catch(() => setNotice("暂时无法读取获奖作品资料"))
      .finally(() => setWorkLoading(false));
  }, []);

  async function randomize() {
    setLoading(true);
    const response = await fetch(`/api/discoveries/random?exclude=${discovery.id}`, { cache: "no-store" });
    const data = await response.json();
    if (response.ok && data.discovery) setDiscovery(data.discovery); else setNotice(data.message ?? "暂时无法生成新的探索盲盒");
    setLoading(false);
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPublishing(true); setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.get("title"), summary: form.get("summary"), bridge: form.get("bridge") }) });
    const data = await response.json(); setPublishing(false);
    if (!response.ok) { setNotice(data.message); return; }
    setArticles((current) => [data.article, ...current]); setNotice("投稿已加入社区探索池"); formElement.reset();
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
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <PageHeader eyebrow="Serendipity Engine" title="今天，遇见一点意外" />
      <section className="dot-grid relative mt-8 overflow-hidden rounded-[36px] bg-[var(--violet)] p-7 text-white sm:p-10">
        <div className="absolute -right-12 -top-12 size-48 rounded-full bg-[var(--coral)]/80 blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold"><Dices className="size-4" /> {discovery.eyebrow} · {discovery.generationMode === "ai" ? "AI 个性化生成" : "可信内容降级"}</span><h2 className="mt-6 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">{discovery.title}</h2><p className="mt-5 max-w-xl text-sm leading-7 text-white/75">{discovery.description}</p><p className="mt-4 max-w-xl rounded-2xl bg-white/10 p-4 text-xs leading-6 text-white/80"><strong>为什么推荐给你：</strong>{discovery.why}</p><div className="mt-6 flex flex-wrap items-center gap-3"><span className="rounded-full bg-[var(--lime)] px-3 py-1.5 text-xs font-bold text-[var(--ink)]">{discovery.bridge}</span><span className="text-xs text-white/60">{discovery.readTime}</span></div></div>
          <button onClick={randomize} disabled={loading} className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 p-5 text-left backdrop-blur-sm"><div><p className="text-xs text-white/55">不太对胃口？</p><p className="mt-1 text-sm font-bold">换一个未知方向</p></div>{loading ? <LoaderCircle className="size-5 animate-spin" /> : <RefreshCw className="size-5" />}</button>
        </div>
      </section>

      <section className="card mt-6 p-6 sm:p-7"><div className="flex items-center gap-3"><BookOpen className="size-5 text-[var(--coral)]" /><div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold">继续阅读</h2><p className="text-xs text-[var(--muted)]">每条内容都提供原始来源，不让“趣事”变成无依据生成</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{discovery.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl bg-[var(--paper)] p-4 text-sm font-semibold"><span><span className="mr-2 rounded bg-white px-2 py-1 text-[10px] text-[var(--violet)]">{source.type}</span>{source.title}</span><ExternalLink className="size-4 shrink-0" /></a>)}</div></section>

      <section className="card mt-7 overflow-hidden">
        <div className="bg-[var(--ink)] p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-[var(--lime)] text-[var(--ink)]"><Award className="size-5" /></div><div><p className="text-xs text-white/50">Winning Work Observatory</p><h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">获奖作品专业解读</h2></div></div>
            <button onClick={refreshWinningWork} disabled={workLoading} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-bold disabled:opacity-60">{workLoading ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} 换一件作品</button>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">系统先根据你的专业、技能与能力画像排序官方获奖作品，再形成结构化长文。作品事实由官方证据锁定；未公开的技术细节会明确标为专业分析，不混同于原团队事实。</p>
        </div>
        {workLoading && !workInsight ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-[var(--muted)]"><LoaderCircle className="size-4 animate-spin" /> 正在匹配专业并整理作品证据…</div>
        ) : workInsight ? (
          <article className="mx-auto max-w-5xl p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[var(--lime)]/60 px-3 py-1.5 text-[10px] font-bold">{workInsight.mode === "ai" ? "AI 专业长文" : "核验资料长文"}</span><span className="rounded-full bg-[#ebe8ff] px-3 py-1.5 text-[10px] font-bold text-[var(--violet)]">面向 {workInsight.recommendedFor}</span></div>
            <p className="mt-7 text-xs font-bold text-[var(--coral)]">{workInsight.competitionTitle} · {workInsight.year ?? "年份见官方来源"} · {workInsight.award}</p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.03em] sm:text-4xl">{workInsight.workTitle}</h3>
            <p className="mt-3 text-xs text-[var(--muted)]">参赛学校：{workInsight.school}</p>

            <div className="mt-7 rounded-3xl border border-[var(--violet)]/15 bg-[#f5f3ff] p-5 sm:p-6"><p className="text-xs font-bold text-[var(--violet)]">为什么它与你的专业相关</p><p className="mt-2 text-sm leading-7">{workInsight.relevanceReason}</p></div>
            <p className="mt-8 text-base font-medium leading-8 text-[var(--muted)]">{workInsight.introduction}</p>

            <WinningWorkStory key={workInsight.id} insight={workInsight} />

            <section className="mt-8 rounded-3xl bg-[#ebe8ff] p-6"><div className="flex items-center gap-2 text-[var(--violet)]"><Sparkles className="size-4" /><strong className="text-sm">对你的专业有什么可复用价值</strong></div><p className="mt-3 text-sm leading-7">{workInsight.crossDisciplinaryValue}</p><div className="mt-4 flex flex-wrap gap-2">{workInsight.takeaways.map((item) => <span key={item} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold">{item}</span>)}</div></section>

            <a href={workInsight.source.url} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-[var(--violet)]">查看官方证据：{workInsight.source.title} <ExternalLink className="size-3.5" /></a>
            <p className="mt-4 text-xs leading-6 text-[var(--muted)]">{workInsight.mode === "curated" ? "当前展示人工核验的结构化长文；开启 AI 后会在同一证据边界内进一步结合你的能力画像。" : "AI 仅负责相关性选择与专业分析，作品名称、奖项、学校、年份及官方来源均由服务端锁定。"}</p>
          </article>
        ) : <div className="p-12 text-center text-sm text-[var(--muted)]">暂时没有可核验的获奖作品资料。</div>}
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="card p-6 sm:p-7"><div className="flex items-center gap-3"><PenLine className="size-5 text-[var(--coral)]" /><div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold">来自同学的跨域文章</h2><p className="text-xs text-[var(--muted)]">内容成为人与人相遇的入口</p></div></div><div className="mt-5 space-y-3">{articles.map((article) => <article key={article.id} className="rounded-3xl bg-[var(--paper)] p-5"><span className="rounded-full bg-[var(--lime)]/60 px-2.5 py-1 text-[10px] font-bold">{article.bridge}</span><h3 className="mt-4 text-lg font-bold">{article.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{article.summary}</p><p className="mt-4 text-xs font-semibold">{article.authorName} · {article.authorMajor}</p></article>)}</div></section>
        <section className="space-y-6"><div className="card p-6"><div className="flex items-center gap-3"><UserRound className="size-5 text-[var(--cyan)]" /><div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold">和谁聊聊？</h2><p className="text-xs text-[var(--muted)]">知识之后，连接到真实的人</p></div></div><div className="mt-5 space-y-3">{matches.slice(1).map((person) => <div key={person.id} className="rounded-2xl border border-black/[0.06] p-4"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-[#dcf2ee] text-sm font-bold text-[#238983]">{person.avatar}</div><div><p className="text-sm font-bold">{person.name}</p><p className="text-[11px] text-[var(--muted)]">{person.major}</p></div></div><p className="mt-3 text-xs leading-5 text-[var(--muted)]">可以聊：{person.reason}</p></div>)}</div></div>
          <form onSubmit={publish} className="card p-6"><h2 className="font-[family-name:var(--font-display)] text-xl font-bold">投稿一个意外连接</h2><p className="mt-1 text-xs text-[var(--muted)]">登录后可提交，当前 Demo 在本次服务进程内保存。</p><div className="mt-5 space-y-3"><Input name="title" placeholder="文章标题" /><Input name="bridge" placeholder="连接领域，例如：建筑 × 软件工程" /><textarea name="summary" required rows={4} placeholder="用几句话说明这个连接为什么有趣" className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></div>{notice && <p className="mt-3 text-xs text-[var(--coral)]">{notice}{notice.includes("登录") && <Link href="/login?next=/explore" className="ml-2 font-bold underline">去登录</Link>}</p>}<button disabled={publishing} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-xs font-bold text-white">{publishing ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />} 提交文章</button></form>
        </section>
      </div>
    </div>
  );
}

function Input({ name, placeholder }: { name: string; placeholder: string }) {
  return <input name={name} required placeholder={placeholder} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" />;
}
