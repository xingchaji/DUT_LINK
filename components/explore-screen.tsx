"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Clock,
  Compass,
  Dices,
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  PenLine,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { notify } from "@/components/feedback/toast";
import { WinningWorkStory } from "@/components/winning-work-story";
import { Reveal } from "@/components/motion/reveal";
import { Spot } from "@/components/motion/tilt-card";
import type { CommunityArticle, Discovery, PersonMatch, WinningWorkInsight } from "@/lib/types";

type ExploreTab = "inspiration" | "winning-work";

const VIEWS = [
  { id: "inspiration" as const, label: "跨域灵感", description: "来源、文章和同学集中在一个入口", icon: Compass },
  { id: "winning-work" as const, label: "获奖作品解读", description: "按专业拆解作品与参赛方法", icon: Trophy },
];

export function ExploreScreen({ initialView, initialDiscovery }: { initialView: ExploreTab; initialDiscovery: Discovery }) {
  const [view, setView] = useState<ExploreTab>(initialView);
  const [discovery, setDiscovery] = useState<Discovery>(initialDiscovery);
  const [articles, setArticles] = useState<CommunityArticle[]>([]);
  const [people, setPeople] = useState<PersonMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState("");
  const [workInsight, setWorkInsight] = useState<WinningWorkInsight | null>(null);
  const [seenWorkIds, setSeenWorkIds] = useState<string[]>([]);
  const [workLoading, setWorkLoading] = useState(true);

  // 两个入口写回 URL：刷新与分享都能回到同一视图（replaceState 不触发路由请求）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (view === "winning-work") params.set("view", "winning-work");
    else params.delete("view");
    const search = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
  }, [view]);

  useEffect(() => {
    fetch("/api/articles").then((response) => response.json()).then((data) => setArticles(data.articles ?? [])).catch(() => undefined);
    fetch("/api/matches", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => { if (data?.matches) setPeople(data.matches); })
      .catch(() => undefined);
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
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.discovery) {
        setDiscovery(data.discovery);
        notify("已换一条跨域灵感");
      } else {
        const message = data.message ?? "暂时无法生成新的跨域灵感";
        setNotice(message);
        notify(message, "error");
      }
    } catch {
      const message = "网络异常，暂时无法生成新的跨域灵感";
      setNotice(message);
      notify(message, "error");
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
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data.message ?? "投稿失败";
        setNotice(message);
        notify(message, "error");
        return;
      }
      setArticles((current) => [data.article, ...current]);
      const message = "投稿已加入社区探索池";
      setNotice(message);
      notify(message);
      formElement.reset();
    } catch {
      const message = "网络异常，投稿失败";
      setNotice(message);
      notify(message, "error");
    } finally {
      setPublishing(false);
    }
  }

  async function refreshWinningWork() {
    setWorkLoading(true); setNotice("");
    // 记住已看过的作品，保证「换一件」把整轮看完、而不是在两件之间回跳
    const exclude = Array.from(new Set([...seenWorkIds, ...(workInsight ? [workInsight.id] : [])]));
    try {
      const query = exclude.length ? `?exclude=${encodeURIComponent(exclude.join(","))}` : "";
      const response = await fetch(`/api/discoveries/winning-work${query}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.insight) {
        setWorkInsight(data.insight);
        if (exclude.includes(data.insight.id)) {
          setSeenWorkIds([data.insight.id]);
          notify("全部作品已看完一轮，从头开始");
        } else {
          setSeenWorkIds(exclude);
          notify("已换一件获奖作品");
        }
      } else {
        const message = data.message ?? "暂时无法读取获奖作品资料";
        setNotice(message);
        notify(message, "error");
      }
    } catch {
      const message = "网络异常，暂时无法读取获奖作品资料";
      setNotice(message);
      notify(message, "error");
    } finally {
      setWorkLoading(false);
    }
  }

  const currentView = VIEWS.find((item) => item.id === view) ?? VIEWS[0];

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="探索"
        title="探索新的连接"
        lede="从一个可信案例出发，看其他领域的知识如何进入作品核心，再连接到可以一起实践的人。"
        icon={<Compass className="size-5" strokeWidth={1.8} />}
      />

      {/* 两个入口：凹槽分段控件，当前项以凸起拇指抬起 */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <nav aria-label="探索内容" className="seg">
          {VIEWS.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                aria-pressed={active}
                data-active={active}
                className="seg-item h-8 px-3 text-[12.5px] active:scale-[0.98]"
              >
                <Icon className="size-3.5" strokeWidth={1.9} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <p className="text-[11.5px] leading-6 text-muted">{currentView.description}</p>
      </div>

      {notice && (
        <div role="status" className="callout callout-clay mt-4">
          <p className="min-w-0 text-[12.5px] leading-6">
            {notice}
            {notice.includes("登录") && <Link href="/login?next=/explore" className="ml-2 font-medium underline">去登录</Link>}
          </p>
        </div>
      )}

      {view === "inspiration" ? (
        <InspirationHub discovery={discovery} articles={articles} people={people} loading={loading} publishing={publishing} onRandomize={randomize} onPublish={publish} />
      ) : (
        <WinningWorkHub insight={workInsight} loading={workLoading} onRefresh={refreshWinningWork} />
      )}
    </div>
  );
}

function InspirationHub({ discovery, articles, people, loading, publishing, onRandomize, onPublish }: { discovery: Discovery; articles: CommunityArticle[]; people: PersonMatch[]; loading: boolean; publishing: boolean; onRandomize: () => void; onPublish: (event: FormEvent<HTMLFormElement>) => void }) {
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [showAllPeople, setShowAllPeople] = useState(false);
  return (
    <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1fr)_288px] xl:gap-10">
      {/* 今日知识盲盒：指针柔光跟随纸面，长文正文保持不倾斜 */}
      <Spot className="min-w-0 rounded-[14px]">
        <article className="card min-w-0 overflow-hidden">
          <header className="relative overflow-hidden border-b border-line px-4 py-5 sm:px-6 sm:py-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_circle_at_var(--sx,74%)_var(--sy,0%),rgba(255,255,255,0.92),rgba(255,255,255,0)_62%)]"
            />

            <div className="relative flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="chip chip-marker">
                    <Dices className="size-3" strokeWidth={2.1} /> {discovery.eyebrow}
                  </span>
                  <span className="chip">{discovery.bridge}</span>
                </div>
                <h2 className="mt-3 text-[21px] font-semibold leading-[1.35] tracking-[-0.02em] text-ink sm:text-[24px]">{discovery.title}</h2>
                <p className="mt-2 max-w-xl text-[13px] leading-7 text-muted">{discovery.description}</p>
              </div>
              <button
                type="button"
                onClick={onRandomize}
                disabled={loading}
                className="btn btn-secondary shrink-0 active:scale-[0.97]"
              >
                {loading ? <LoaderCircle className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />} 换一个灵感
              </button>
            </div>

            <dl className="relative mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-line pt-3 text-[10.5px] text-faint">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3" strokeWidth={1.9} />
                <dt>阅读时长</dt>
                <dd className="num text-muted">{discovery.readTime}</dd>
              </div>
              <span className="h-3 w-px bg-line" />
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="size-3 text-moss" strokeWidth={2} />
                <dt>内容模式</dt>
                <dd className="text-muted">{discovery.generationMode === "ai" ? "AI 个性化生成" : "可信内容整理"}</dd>
              </div>
              <span className="h-3 w-px bg-line" />
              <div className="flex items-center gap-1.5">
                <BookOpen className="size-3" strokeWidth={1.9} />
                <dt>来源</dt>
                <dd className="num text-muted">{discovery.sources.length} 条</dd>
              </div>
            </dl>
          </header>

          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <Reveal delay={60}>
              <div className="callout callout-brand">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.9} />
                <div className="min-w-0">
                  <p className="text-[11.5px] font-semibold text-ink">为什么推荐给你</p>
                  <p className="mt-1 text-[13px] leading-7 text-ink-soft">{discovery.why}</p>
                </div>
              </div>
            </Reveal>

            <Reveal as="section" delay={110} className="mt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                  <BookOpen className="size-3.5 text-muted" strokeWidth={1.9} /> 来源与延伸阅读
                </h3>
                <span className="text-[10.5px] text-faint">所有外部内容均保留原始链接</span>
              </div>
              <div className="card mt-2 divide-y divide-line overflow-hidden p-0">
                {discovery.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="row-hover group flex items-center gap-3 px-3.5 py-2.5"
                  >
                    <span className="chip shrink-0">{source.type}</span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink decoration-line-strong underline-offset-2 group-hover:underline">{source.title}</span>
                    <ExternalLink className="size-3.5 shrink-0 text-faint transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                  </a>
                ))}
              </div>
            </Reveal>

            <Reveal as="section" delay={160} className="mt-7">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                  <PenLine className="size-3.5 text-muted" strokeWidth={1.9} /> 同学的延伸
                </h3>
                <span className="num text-[10.5px] text-faint">{articles.length} 篇</span>
              </div>
              {articles.length ? (
                <>
                  <div className="card mt-2 divide-y divide-line overflow-hidden p-0">
                    {(showAllArticles ? articles : articles.slice(0, 3)).map((article) => (
                      <article key={article.id} className="row-hover px-3.5 py-3.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="chip chip-outline">{article.bridge}</span>
                          <span className="text-[10.5px] text-faint">{article.authorName} · {article.authorMajor}</span>
                        </div>
                        <h4 className="mt-1.5 text-[13px] font-medium text-ink">{article.title}</h4>
                        <p className="mt-1 text-[12px] leading-6 text-muted">{article.summary}</p>
                      </article>
                    ))}
                  </div>
                  {articles.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllArticles((current) => !current)}
                      aria-expanded={showAllArticles}
                      className="btn btn-secondary btn-sm mt-2 w-full"
                    >
                      {showAllArticles ? "收起，只看最近 3 篇" : `展开全部 ${articles.length} 篇`}
                    </button>
                  )}
                </>
              ) : (
                <p className="mt-2 rounded-[10px] border border-dashed border-line-strong px-3 py-4 text-[12px] text-muted">暂时没有同学投稿。</p>
              )}
            </Reveal>
          </div>
        </article>
      </Spot>

      <aside className="grid min-w-0 content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
        <Reveal as="section" delay={80} className="card interactive-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="section-label flex items-center gap-1.5">
              <UserRound className="size-3" strokeWidth={2} /> People to meet
            </p>
            <span className="chip chip-tea">互补优先</span>
          </div>
          <h3 className="section-title mt-1.5">推荐同学</h3>
          <p className="mt-1 text-[11px] leading-5 text-faint">
            {people.length ? `共 ${people.length} 位同学，按能力互补、共同兴趣与跨专业跨度排序。` : "按能力互补、共同兴趣与跨专业跨度排序。"}
          </p>

          <div className="mt-2 divide-y divide-line">
            {people.length === 0 && (
              <p className="sunk rounded-[8px] px-3 py-4 text-center text-[11.5px] text-muted">正在根据你的画像匹配同学…</p>
            )}
            {(showAllPeople ? people : people.slice(0, 3)).map((person) => (
              <Link key={person.id} href={`/people/${person.id}`} className="row-hover group -mx-1 flex items-start gap-2.5 rounded-[8px] px-1 py-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-tea-soft text-[11.5px] font-semibold text-tea shadow-[0_1px_1px_rgba(60,48,30,0.08),0_3px_8px_-4px_rgba(60,48,30,0.28),inset_0_1px_0_rgba(255,255,255,0.9)]">
                  {person.avatar}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-1.5">
                    <span className="truncate text-[12.5px] font-medium text-ink decoration-line-strong underline-offset-2 group-hover:underline">{person.name}</span>
                    <span className="truncate text-[10.5px] text-faint">{person.major}</span>
                    <span className="num ml-auto shrink-0 text-[10.5px] text-muted">{person.match}%</span>
                  </span>
                  <span className="mt-1 block text-[11.5px] leading-5 text-muted">{person.reason}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-faint transition duration-300 group-hover:text-brand">
                    查看主页与联系方式 <MessageCircle className="size-3" strokeWidth={1.9} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
          {people.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllPeople((current) => !current)}
              aria-expanded={showAllPeople}
              className="btn btn-secondary btn-sm mt-2 w-full"
            >
              {showAllPeople ? "收起" : `查看全部 ${people.length} 位同学`}
            </button>
          )}
        </Reveal>

        <Reveal as="section" delay={140} className="card interactive-card p-4">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                <Send className="size-3.5 text-muted" strokeWidth={1.9} /> 分享一个跨域连接
              </span>
              <Plus className="size-3.5 text-faint transition group-open:rotate-45" strokeWidth={2} />
            </summary>
            <form
              onSubmit={onPublish}
              className="mt-3 space-y-2.5 border-t border-line pt-3 group-open:animate-[pop-in_220ms_var(--spring)_both]"
            >
              <TextField name="title" label="标题" placeholder="文章标题" />
              <TextField name="bridge" label="跨域连接" placeholder="例如：建筑 × 软件工程" />
              <label className="block">
                <span className="field-label">为什么值得分享</span>
                <textarea name="summary" required rows={4} placeholder="这个连接为什么值得分享？" className="field" />
              </label>
              <button type="submit" disabled={publishing} className="btn btn-primary btn-block">
                {publishing ? <LoaderCircle className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} 提交
              </button>
            </form>
          </details>
        </Reveal>
      </aside>
    </div>
  );
}

function WinningWorkHub({ insight, loading, onRefresh }: { insight: WinningWorkInsight | null; loading: boolean; onRefresh: () => void }) {
  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <p className="section-label flex items-center gap-1.5">
            <Award className="size-3" strokeWidth={2} /> Winning work review
          </p>
          <h2 className="section-title mt-1.5">获奖作品专业解读</h2>
          <p className="section-desc mt-1 max-w-2xl">从作品设计思路、跨学科接口和验证方法中提炼可复用的参赛经验。</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} className="btn btn-secondary shrink-0 active:scale-[0.97]">
          {loading ? <LoaderCircle className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />} 换一件作品
        </button>
      </div>

      {loading && !insight ? (
        <div className="card mt-4 space-y-3 p-5">
          <div className="h-3 w-24 animate-pulse rounded bg-raise" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-raise" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-raise" />
          <p className="flex items-center gap-1.5 pt-1 text-[11.5px] text-muted">
            <LoaderCircle className="size-3.5 animate-spin" /> 正在整理作品资料…
          </p>
        </div>
      ) : insight ? (
        <article className="reveal card mt-4 overflow-hidden" style={{ ["--i" as string]: 0 }}>
          <header className="border-b border-line px-4 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="chip chip-moss">{insight.mode === "ai" ? "AI 专业分析" : "核验资料分析"}</span>
              <span className="chip chip-brand">面向 {insight.recommendedFor}</span>
            </div>
            <p className="mt-3 text-[11.5px] text-muted">
              {insight.competitionTitle} · {insight.year ? <span className="num">{insight.year}</span> : "年份见官方来源"} · {insight.award}
            </p>
            <h3 className="mt-1.5 text-[25px] font-semibold leading-[1.3] tracking-[-0.025em] text-ink sm:text-[30px]">{insight.workTitle}</h3>
            <p className="mt-2 text-[11.5px] text-faint">{insight.school}</p>
          </header>

          <div className="px-4 py-5 sm:px-7 sm:py-6">
            <div className="callout callout-brand">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.9} />
              <div className="min-w-0">
                <p className="text-[11.5px] font-semibold text-ink">为什么与你相关</p>
                <p className="mt-1 text-[13px] leading-7 text-ink-soft">{insight.relevanceReason}</p>
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-[14px] leading-8 text-ink-soft">{insight.introduction}</p>

            <WinningWorkStory key={insight.id} insight={insight} />

            <section className="panel mt-8 px-4 py-4">
              <div className="flex items-center gap-1.5 text-ink">
                <Sparkles className="size-3.5 text-muted" strokeWidth={1.9} />
                <strong className="text-[12.5px] font-semibold">可复用的参赛方法</strong>
              </div>
              <p className="mt-2.5 text-[13px] leading-7 text-ink-soft">{insight.crossDisciplinaryValue}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {insight.takeaways.map((item) => (
                  <span key={item} className="chip">{item}</span>
                ))}
              </div>
            </section>

            <a
              href={insight.source.url}
              target="_blank"
              rel="noreferrer"
              className="row-hover group mt-3 flex items-center justify-between gap-3 rounded-[10px] border border-line bg-surface px-3.5 py-2.5 text-[12px] text-muted transition hover:text-ink"
            >
              <span className="min-w-0 truncate">查看原作品与官方来源：{insight.source.title}</span>
              <ExternalLink className="size-3.5 shrink-0 text-faint transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
            </a>
          </div>
        </article>
      ) : (
        <div className="mt-4 rounded-[14px] border border-dashed border-line-strong px-4 py-10 text-center text-[12.5px] text-muted">
          暂时没有可核验的获奖作品资料。
        </div>
      )}
    </section>
  );
}

function TextField({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input name={name} required placeholder={placeholder} className="field" />
    </label>
  );
}
