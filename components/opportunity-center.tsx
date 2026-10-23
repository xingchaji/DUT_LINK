"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Heart,
  LoaderCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { CountUp } from "@/components/motion/metric";
import { notify } from "@/components/feedback/toast";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import type { Opportunity } from "@/lib/types";

type View = "overview" | "recommended";
type Notice = { type: "success" | "error"; text: string } | null;

const ACCENTS: Record<string, { icon: string }> = {
  violet: { icon: "bg-brand-soft text-brand" },
  cyan: { icon: "bg-tea-soft text-tea" },
  amber: { icon: "bg-ochre-soft text-ochre" },
  coral: { icon: "bg-clay-soft text-clay" },
};

export function OpportunityCenter({ initialView = "overview", initialQuery = "", focusSearch = false }: { initialView?: View; initialQuery?: string; focusSearch?: boolean }) {
  const [view, setView] = useState<View>(initialView);
  const [overview, setOverview] = useState<Opportunity[]>([]);
  const [recommended, setRecommended] = useState<Opportunity[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [query, setQuery] = useState(initialQuery);
  const [showPublish, setShowPublish] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [rankedBy, setRankedBy] = useState<"user-profile" | "demo-profile">("demo-profile");
  const [intendedIds, setIntendedIds] = useState<string[]>([]);
  const [pendingIntentIds, setPendingIntentIds] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  // 视图与搜索词写回 URL：刷新、分享和再次进入都能复原（replaceState 不触发路由请求）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (view === "recommended") params.set("view", "recommended");
    else params.delete("view");
    const needle = query.trim();
    if (needle) params.set("q", needle);
    else params.delete("q");
    params.delete("focus");
    const search = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
  }, [view, query]);

  useEffect(() => {
    if (!focusSearch) return;
    const frame = window.requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [focusSearch]);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/opportunities", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "无法加载比赛列表");
      setOverview(data.overview ?? []);
      setRecommended(data.recommended ?? []);
      setCounts(data.recruitmentCounts ?? {});
      setIntendedIds(data.intendedOpportunityIds ?? []);
      setRankedBy(data.rankedBy === "user-profile" ? "user-profile" : "demo-profile");
      setLoadError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "无法加载比赛列表";
      setLoadError(message);
      setNotice({ type: "error", text: message });
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const visible = useMemo(() => {
    const catalog = view === "overview" ? overview : recommended;
    const needle = query.trim().toLowerCase();
    if (!needle) return catalog;
    return catalog.filter((item) => `${item.title} ${item.tags.join(" ")} ${item.organizer} ${item.type}`.toLowerCase().includes(needle));
  }, [overview, query, recommended, view]);

  const verifiedCount = overview.filter((item) => item.verification !== "pending").length;
  const recruitingTeamCount = Object.values(counts).reduce((total, count) => total + count, 0);

  async function publishOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setNotice(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          organizer: form.get("organizer"),
          type: form.get("type"),
          registrationStart: form.get("registrationStart"),
          registrationEnd: form.get("registrationEnd") || null,
          eventDate: form.get("eventDate") || null,
          description: form.get("description"),
          tags: String(form.get("tags") ?? "").split(/[，,、]/),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data.message ?? "发布失败，请稍后重试";
        setNotice({ type: "error", text: message });
        notify(message, "error");
        return;
      }
      const message = "校内比赛已发布，核验前会显示「待核验」";
      setNotice({ type: "success", text: message });
      notify(message);
      setShowPublish(false);
      formElement.reset();
      await load();
      setView("overview");
    } catch {
      const message = "无法连接服务器，比赛未发布";
      setNotice({ type: "error", text: message });
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function toggleInterest(opportunityId: string) {
    if (pendingIntentIds.includes(opportunityId)) return;
    const intended = !intendedIds.includes(opportunityId);
    setPendingIntentIds((current) => [...current, opportunityId]);
    try {
      const response = await fetch("/api/opportunity-interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, intended }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data.message ?? "标记参赛意向失败";
        setNotice({ type: "error", text: message });
        notify(message, "error");
        return;
      }
      setIntendedIds((current) => (intended ? [...current, opportunityId] : current.filter((id) => id !== opportunityId)));
      const message = intended ? "已加入参赛意向，队长推荐队友时会优先筛选你" : "已取消参赛意向";
      setNotice({ type: "success", text: message });
      notify(message);
    } catch {
      const message = "网络异常，参赛意向未更新";
      setNotice({ type: "error", text: message });
      notify(message, "error");
    } finally {
      setPendingIntentIds((current) => current.filter((id) => id !== opportunityId));
    }
  }

  return (
    <div className="space-y-6">
      <dl className="e1 grid grid-cols-2 divide-x divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
        <Stat value={overview.length} label="比赛机会" hint="含校内发布" loading={!loaded} />
        <Stat value={recruitingTeamCount} label="队伍招募中" hint={loaded ? `${verifiedCount} 项来源已核验` : "正在寻找队友"} loading={!loaded} />
      </dl>

      <div>
        <div className="flex flex-col gap-3 border-b border-line pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="seg">
            <SegTab active={view === "overview"} onClick={() => setView("overview")} icon={<CalendarDays className="size-3.5" strokeWidth={1.9} />} title="比赛总览" />
            <SegTab active={view === "recommended"} onClick={() => setView("recommended")} icon={<Sparkles className="size-3.5" strokeWidth={1.9} />} title="智能推荐" />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-faint" strokeWidth={1.9} />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索比赛、主办方或技能"
                aria-label="搜索比赛"
                className="field h-9 w-full py-0 pl-8 pr-8 text-[12.5px] sm:w-60"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="清空搜索"
                  className="absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-[6px] text-faint transition hover:bg-raise hover:text-ink"
                >
                  <X className="size-3" strokeWidth={2.2} />
                </button>
              )}
            </div>
            <Magnetic strength={4} className="w-full sm:w-auto">
              <button type="button" onClick={() => setShowPublish((current) => !current)} className="btn btn-primary w-full">
                {showPublish ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
                {showPublish ? "收起表单" : "发布校内比赛"}
              </button>
            </Magnetic>
          </div>
        </div>
      </div>

      {notice && (
        <div role="status" className={`callout items-start ${notice.type === "success" ? "callout-moss" : "callout-clay"}`}>
          <CheckCircle2 className={`mt-0.5 size-4 shrink-0 ${notice.type === "success" ? "text-moss" : "text-clay"}`} strokeWidth={2} />
          <span>
            {notice.text}
            {notice.type === "error" && notice.text.includes("登录") && (
              <Link href="/login?next=/opportunities" className="ml-2 font-semibold underline underline-offset-2">
                去登录
              </Link>
            )}
          </span>
        </div>
      )}

      {showPublish && (
        <form onSubmit={publishOpportunity} className="card pop grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <div className="flex items-start justify-between gap-4 sm:col-span-2">
            <div>
              <p className="section-label">Campus opportunity</p>
              <h2 className="section-title mt-1.5">发布一个校内组队机会</h2>
              <p className="section-desc mt-1">平台帮助同学组队，不替代学校或主办方的正式报名。发布后会标记为待核验。</p>
            </div>
            <button type="button" onClick={() => setShowPublish(false)} aria-label="关闭发布表单" className="grid size-7 shrink-0 place-items-center rounded-md text-muted transition hover:bg-raise hover:text-ink">
              <X className="size-4" />
            </button>
          </div>

          <Input name="title" label="比赛名称" placeholder="例如：校羽毛球双打赛" required />
          <Input name="organizer" label="校内组织方" placeholder="例如：软件学院学生会" required />

          <label className="block">
            <span className="field-label">类型</span>
            <select name="type" className="field">
              <option>体育比赛</option>
              <option>文艺比赛</option>
              <option>学术竞赛</option>
              <option>创新创业</option>
              <option>项目</option>
              <option>社区</option>
            </select>
          </label>
          <Input name="tags" label="组队标签" placeholder="羽毛球、双打、混合组" required />

          <Input name="registrationStart" label="开始报名" type="date" placeholder="" required />
          <Input name="registrationEnd" label="截止报名" type="date" placeholder="" />
          <Input name="eventDate" label="比赛日期" type="date" placeholder="" />

          <label className="block sm:col-span-2">
            <span className="field-label">比赛与组队说明</span>
            <textarea name="description" required rows={4} placeholder="说明参赛对象、队伍人数和希望怎样组队" className="field" />
          </label>

          <div className="flex items-center justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
            <button type="button" onClick={() => setShowPublish(false)} className="btn btn-ghost">
              取消
            </button>
            <button disabled={loading} className="btn btn-primary">
              {loading ? <LoaderCircle className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />} 发布比赛
            </button>
          </div>
        </form>
      )}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-label">{view === "overview" ? "Opportunity library" : "For your profile"}</p>
            <h2 className="section-title mt-1.5 text-[17px]">{view === "overview" ? "全部比赛" : "为你推荐"}</h2>
          </div>
          <div className="flex items-center gap-2">
            {view === "recommended" && (
              <span className="chip">{rankedBy === "user-profile" ? "按你的画像排序" : "演示画像排序"}</span>
            )}
            <span className="text-[11px] text-faint">
              共 <span className="num">{visible.length}</span> 场
            </span>
          </div>
        </div>

        {!loaded ? (
          <div className="mt-3.5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3" aria-hidden>
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="card h-[324px] animate-pulse p-4">
                <div className="h-3 w-24 rounded bg-raise" />
                <div className="mt-4 h-4 w-4/5 rounded bg-raise" />
                <div className="mt-2 h-3 w-1/2 rounded bg-raise" />
                <div className="mt-5 h-14 rounded bg-raise" />
                <div className="mt-4 h-8 rounded bg-raise" />
              </div>
            ))}
          </div>
        ) : visible.length ? (
          <div className="mt-3.5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {visible.map((item, index) => (
              <Reveal key={item.id} delay={Math.min(index, 5) * 60} className="h-full">
                <OpportunityCard
                  item={item}
                  recommended={view === "recommended"}
                  teamCount={counts[item.id] ?? 0}
                  intended={intendedIds.includes(item.id)}
                  intentPending={pendingIntentIds.includes(item.id)}
                  onToggleInterest={() => toggleInterest(item.id)}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-3.5 grid min-h-56 place-items-center rounded-[14px] border border-dashed border-line-strong bg-surface/60 p-8 text-center">
            <div>
              <Search className="mx-auto size-5 text-faint" strokeWidth={1.8} />
              {loadError ? (
                <>
                  <h3 className="mt-3 text-[14px] font-semibold">没能加载机会目录</h3>
                  <p className="mt-1 text-[12px] text-muted">{loadError}</p>
                  <button type="button" onClick={() => { setLoaded(false); setLoadError(""); void load(); }} className="btn btn-secondary btn-sm mt-3">
                    重新加载
                  </button>
                </>
              ) : (
                <>
                  <h3 className="mt-3 text-[14px] font-semibold">没有找到对应比赛</h3>
                  <p className="mt-1 text-[12px] text-muted">换一个比赛名称、主办方或技能关键词试试。</p>
                  <button type="button" onClick={() => setQuery("")} className="btn btn-secondary btn-sm mt-3">
                    清除搜索
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function OpportunityCard({
  item,
  recommended,
  teamCount,
  intended,
  intentPending,
  onToggleInterest,
}: {
  item: Opportunity;
  recommended: boolean;
  teamCount: number;
  intended: boolean;
  intentPending: boolean;
  onToggleInterest: () => void;
}) {
  const accent = ACCENTS[item.accent] ?? ACCENTS.violet;

  return (
    <article className="card interactive-card group relative flex h-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`glyph size-7 shrink-0 rounded-[9px] border-0 ${accent.icon}`}>
                <CalendarDays className="size-3.5" strokeWidth={1.9} />
              </span>
              <span className="chip chip-outline">{item.type}</span>
              <span className={`status ${item.verification === "pending" ? "status-warn" : "status-ok"}`}>
                <ShieldCheck className="size-2.5" strokeWidth={2.2} />
                {item.verification === "pending" ? "待核验" : "来源已核验"}
              </span>
            </div>
            {recommended && <span className="num shrink-0 pt-0.5 text-[13px] font-semibold text-brand">{item.fit}%</span>}
          </div>

          <h3 className="mt-3 text-[15px] font-semibold leading-snug tracking-[-0.015em] text-ink">
            <Link
              href={`/opportunities/${item.id}`}
              className="decoration-line-strong underline-offset-2 after:absolute after:inset-0 after:content-[''] group-hover:underline"
            >
              {item.title}
            </Link>
          </h3>
          <p className="mt-1 text-[11.5px] text-muted">
            {item.organizer} · {item.scope ?? "全国"}
          </p>

          <p className="mt-2 line-clamp-2 text-[12.5px] leading-6 text-muted">{item.description}</p>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>

          {recommended && item.matchReasons?.length ? (
            <p className="mt-2.5 line-clamp-2 text-[11.5px] leading-5 text-brand">{item.matchReasons[0]}</p>
          ) : null}

          <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-2.5 text-[11px] text-faint">
            <CalendarDays className="size-3 shrink-0" strokeWidth={1.8} />
            <span className="num truncate">
              {item.registrationStart ?? "待补充"} → {item.registrationEnd ?? "待补充"}
            </span>
          </p>

          <div className="relative z-10 mt-auto pt-3">
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/opportunities/${item.id}/recruit`} className="btn btn-primary btn-sm group/cta">
                我是队长
                <ArrowRight className="size-3 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
              </Link>
              <Link href={`/opportunities/${item.id}/teams`} className="btn btn-secondary btn-sm">
                寻找队伍 <span className="num">{teamCount}</span>
              </Link>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2.5 text-[10.5px] text-faint">
              <button
                type="button"
                onClick={onToggleInterest}
                disabled={intentPending}
                aria-pressed={intended}
                aria-busy={intentPending}
                className={`inline-flex items-center gap-1 rounded-[6px] px-1.5 py-1 transition hover:bg-raise ${intended ? "text-brand" : "text-muted hover:text-ink"}`}
              >
                {intentPending ? <LoaderCircle className="size-3 animate-spin" /> : <Heart className={`size-3 ${intended ? "fill-current" : ""}`} strokeWidth={2} />}
                {intentPending ? "更新中…" : intended ? "已标记意向" : "标记意向"}
              </button>
              {item.sourceUrl !== "#" ? (
                <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 transition hover:text-brand">
                  官方来源 <ExternalLink className="size-2.5" />
                </a>
              ) : (
                <span className="min-w-0 truncate">{item.sourceName}</span>
              )}
            </div>
          </div>
      </div>
    </article>
  );
}

function Stat({ value, label, hint, loading = false }: { value: number; label: string; hint: string; loading?: boolean }) {
  return (
    <div className="px-4 py-3.5 sm:px-5">
      <dt className="text-[10.5px] text-faint">{label}</dt>
      <dd className="mt-1 flex items-baseline gap-2">
        {loading ? (
          <span className="num text-[22px] font-semibold leading-none text-faint">—</span>
        ) : (
          <CountUp value={value} className="num text-[22px] font-semibold leading-none text-ink" />
        )}
        <span className="hidden truncate text-[10.5px] text-faint sm:block">{hint}</span>
      </dd>
    </div>
  );
}

function SegTab({ active, onClick, icon, title }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} data-active={active} className="seg-item py-2">
      {icon}
      {title}
    </button>
  );
}

function Input({ name, label, placeholder, type = "text", required = false }: { name: string; label: string; placeholder: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} className="field" />
    </label>
  );
}
