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
  SlidersHorizontal,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { CountUp } from "@/components/motion/metric";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { opportunities as seedOpportunities } from "@/lib/mock-data";
import type { Opportunity } from "@/lib/types";

type View = "overview" | "recommended";
type Notice = { type: "success" | "error"; text: string } | null;

const ACCENTS: Record<string, { icon: string; bar: string }> = {
  violet: { icon: "bg-brand-soft text-brand", bar: "bg-brand" },
  cyan: { icon: "bg-tea-soft text-tea", bar: "bg-tea" },
  amber: { icon: "bg-ochre-soft text-ochre", bar: "bg-ochre" },
  coral: { icon: "bg-clay-soft text-clay", bar: "bg-clay" },
};

export function OpportunityCenter() {
  const [view, setView] = useState<View>("overview");
  const [overview, setOverview] = useState<Opportunity[]>(seedOpportunities);
  const [recommended, setRecommended] = useState<Opportunity[]>(seedOpportunities);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [showPublish, setShowPublish] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(false);
  const [intendedIds, setIntendedIds] = useState<string[]>([]);
  const noticeRef = useRef<HTMLDivElement>(null);

  // 操作反馈可能出现在视口之外，出现时滚到最近位置，避免“点了没反应”
  useEffect(() => {
    if (!notice) return;
    noticeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [notice]);

  const load = useCallback(async () => {
    const response = await fetch("/api/opportunities", { cache: "no-store" });
    const data = await response.json();
    setOverview(data.overview ?? []);
    setRecommended(data.recommended ?? []);
    setCounts(data.recruitmentCounts ?? {});
    setIntendedIds(data.intendedOpportunityIds ?? []);

    const stored = localStorage.getItem("dut-link-profile");
    if (stored) {
      const ranked = await fetch("/api/opportunities/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: JSON.parse(stored) }),
      });
      const rankedData = await ranked.json();
      if (rankedData.opportunities) setRecommended(rankedData.opportunities);
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
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setNotice({ type: "error", text: data.message });
      return;
    }
    setNotice({ type: "success", text: "校内比赛已发布，核验前会显示「待核验」" });
    setShowPublish(false);
    formElement.reset();
    await load();
    setView("overview");
  }

  async function toggleInterest(opportunityId: string) {
    const intended = !intendedIds.includes(opportunityId);
    const response = await fetch("/api/opportunity-interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId, intended }),
    });
    const data = await response.json();
    if (!response.ok) {
      setNotice({ type: "error", text: data.message });
      return;
    }
    setIntendedIds((current) => (intended ? [...current, opportunityId] : current.filter((id) => id !== opportunityId)));
    setNotice({ type: "success", text: intended ? "已加入参赛意向，队长推荐队友时会优先筛选你" : "已取消参赛意向" });
  }

  return (
    <div className="space-y-6">
      <dl className="e1 grid grid-cols-3 divide-x divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
        <Stat value={overview.length} label="比赛机会" hint="含校内发布" />
        <Stat value={verifiedCount} label="来源已核验" hint="可追溯到主办方" />
        <Stat value={recruitingTeamCount} label="队伍招募中" hint="正在寻找队友" />
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
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索比赛、主办方或技能"
                aria-label="搜索比赛"
                className="field h-9 w-full py-0 pl-8 text-[12.5px] sm:w-60"
              />
            </div>
            <Magnetic strength={4} className="w-full sm:w-auto">
              <button type="button" onClick={() => setShowPublish((current) => !current)} className="btn btn-primary w-full">
                {showPublish ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
                {showPublish ? "收起表单" : "发布校内比赛"}
              </button>
            </Magnetic>
          </div>
        </div>

        <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-faint">
          <SlidersHorizontal className="size-3" strokeWidth={1.9} />
          {query ? `找到 ${visible.length} 项结果` : `当前展示 ${visible.length} 项机会`}
          <span className="text-line-strong">·</span>
          {view === "overview" ? "未知报名时间的比赛排在后面，平台不会猜测日期" : "推荐分只用于排序，赛事事实仍来自官方来源"}
        </p>
      </div>

      {notice && (
        <div ref={noticeRef} role="status" className={`callout items-start ${notice.type === "success" ? "callout-moss" : "callout-clay"}`}>
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
          <span className="text-[11px] text-faint">
            共 <span className="num">{visible.length}</span> 场
          </span>
        </div>

        {visible.length ? (
          <div className="mt-3.5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {visible.map((item, index) => (
              <Reveal key={item.id} delay={Math.min(index, 5) * 60} className="h-full">
                <OpportunityCard
                  item={item}
                  recommended={view === "recommended"}
                  teamCount={counts[item.id] ?? 0}
                  intended={intendedIds.includes(item.id)}
                  onToggleInterest={() => toggleInterest(item.id)}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-3.5 grid min-h-56 place-items-center rounded-[14px] border border-dashed border-line-strong bg-surface/60 p-8 text-center">
            <div>
              <Search className="mx-auto size-5 text-faint" strokeWidth={1.8} />
              <h3 className="mt-3 text-[14px] font-semibold">没有找到对应比赛</h3>
              <p className="mt-1 text-[12px] text-muted">换一个比赛名称、主办方或技能关键词试试。</p>
              <button type="button" onClick={() => setQuery("")} className="btn btn-secondary btn-sm mt-3">
                清除搜索
              </button>
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
  onToggleInterest,
}: {
  item: Opportunity;
  recommended: boolean;
  teamCount: number;
  intended: boolean;
  onToggleInterest: () => void;
}) {
  const accent = ACCENTS[item.accent] ?? ACCENTS.violet;

  return (
    <TiltCard max={5} lift={4} spotlight className="group h-full rounded-[16px]">
      <article className="card relative flex h-full flex-col overflow-hidden transition-shadow duration-500 [transition-timing-function:var(--spring)] group-hover:shadow-[0_2px_6px_-2px_rgba(60,48,30,0.08),0_18px_38px_-18px_rgba(60,48,30,0.26)]">
        {/* 脊：有厚度的强调色棱，内高光 + 底部投影，像压在纸面上的凸条 */}
        <div
          aria-hidden
          className={`h-1 w-full rounded-t-[15px] ${accent.bar} shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_2px_rgba(60,48,30,0.22)]`}
        />
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

          <p className="mt-2.5 line-clamp-3 text-[12.5px] leading-6 text-muted">{item.description}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>

          {recommended && item.matchReasons?.length ? (
            <p className="callout callout-brand mt-3 px-2.5 py-2 text-[11.5px] leading-5">
              <strong className="font-semibold">推荐理由：</strong>
              {item.matchReasons[0]}
            </p>
          ) : null}

          <div className="mt-3.5 grid grid-cols-[1fr_auto] items-center gap-3 border-t border-line pt-3 text-[11px]">
            <dl className="min-w-0 space-y-1">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-2">
                <dt className="text-faint">开始报名</dt>
                <dd className="num truncate text-ink-soft">{item.registrationStart ?? "待补充"}</dd>
              </div>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-2">
                <dt className="text-faint">截止报名</dt>
                <dd className="num truncate text-ink-soft">{item.registrationEnd ?? "待补充"}</dd>
              </div>
            </dl>
            <Link
              href={`/opportunities/${item.id}/teams`}
              aria-label={`查看 ${item.title} 招募中的 ${teamCount} 支队伍`}
              className="panel relative z-10 flex items-center gap-1.5 rounded-[9px] px-2.5 py-1.5 transition duration-300 hover:border-tea/40 hover:text-tea"
            >
              <UsersRound className="size-3.5 text-tea" strokeWidth={1.9} />
              <span className="num text-[12px] font-semibold text-ink-soft">{teamCount}</span>
              <span className="text-[10px] text-faint">队招募中</span>
            </Link>
          </div>

          <div className="relative z-10 mt-auto pt-3.5">
            <button
              type="button"
              onClick={onToggleInterest}
              aria-pressed={intended}
              className={`btn btn-secondary btn-sm btn-block gap-1.5 ${intended ? "border-transparent bg-brand-soft text-brand shadow-[inset_0_1px_2px_rgba(60,48,30,0.1)]" : ""}`}
            >
              <Heart className={`size-3.5 ${intended ? "fill-current" : ""}`} strokeWidth={1.9} />
              {intended ? "已标记参赛意向" : "标记参赛意向"}
            </button>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href={`/opportunities/${item.id}/recruit`} className="btn btn-primary btn-sm group/cta">
                我是队长
                <ArrowRight className="size-3 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
              </Link>
              <Link href={`/opportunities/${item.id}/teams`} className="btn btn-secondary btn-sm">
                寻找队伍 <UsersRound className="size-3" />
              </Link>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2.5 text-[10.5px] text-faint">
              <span className="min-w-0 truncate">{item.sourceName}</span>
              {item.sourceUrl !== "#" && (
                <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 transition hover:text-brand">
                  官方来源 <ExternalLink className="size-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

function Stat({ value, label, hint }: { value: number; label: string; hint: string }) {
  return (
    <div className="px-4 py-3.5 sm:px-5">
      <dt className="text-[10.5px] text-faint">{label}</dt>
      <dd className="mt-1 flex items-baseline gap-2">
        <CountUp value={value} className="num text-[22px] font-semibold leading-none text-ink" />
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
