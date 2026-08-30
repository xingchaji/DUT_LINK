"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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
import { opportunities as seedOpportunities } from "@/lib/mock-data";
import type { Opportunity } from "@/lib/types";

type View = "overview" | "recommended";
type Notice = { type: "success" | "error"; text: string } | null;

const ACCENTS: Record<string, { line: string; icon: string }> = {
  violet: { line: "bg-[var(--violet)]", icon: "bg-[#eeebff] text-[var(--violet)]" },
  cyan: { line: "bg-[var(--cyan)]", icon: "bg-[#e3f5f2] text-[#238983]" },
  amber: { line: "bg-[var(--amber)]", icon: "bg-[#fff2e3] text-[#bd792a]" },
  coral: { line: "bg-[var(--coral)]", icon: "bg-[#fff0ec] text-[var(--coral)]" },
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

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

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
    if (!response.ok) { setNotice({ type: "error", text: data.message }); return; }
    setNotice({ type: "success", text: "校内比赛已发布，核验前会显示“待核验”" });
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
    if (!response.ok) { setNotice({ type: "error", text: data.message }); return; }
    setIntendedIds((current) => intended ? [...current, opportunityId] : current.filter((id) => id !== opportunityId));
    setNotice({ type: "success", text: intended ? "已加入参赛意向，队长推荐队友时会优先筛选你" : "已取消参赛意向" });
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[28px] bg-[var(--ink)] p-5 text-white shadow-[0_24px_60px_rgba(23,32,51,0.14)] sm:p-6">
        <div className="absolute -right-16 -top-24 size-64 rounded-full bg-[var(--violet)]/55 blur-3xl" />
        <div className="relative grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid grid-cols-3 gap-3 sm:max-w-xl">
            <Stat value={overview.length} label="比赛机会" />
            <Stat value={verifiedCount} label="来源已核验" />
            <Stat value={recruitingTeamCount} label="队伍招募中" />
          </div>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 lg:w-72"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/45" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索比赛、主办方或技能" className="w-full rounded-2xl border border-white/10 bg-white/10 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--lime)]/60 focus:bg-white/15" /></div>
            <button type="button" onClick={() => setShowPublish((current) => !current)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--lime)] px-5 py-3.5 text-xs font-bold text-[var(--ink)] transition hover:-translate-y-0.5"><Plus className="size-4" /> 发布校内比赛</button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit rounded-2xl border border-black/[0.06] bg-white/75 p-1.5 shadow-sm">
          <Tab active={view === "overview"} onClick={() => setView("overview")} icon={<CalendarDays className="size-4" />} title="比赛总览" />
          <Tab active={view === "recommended"} onClick={() => setView("recommended")} icon={<Sparkles className="size-4" />} title="智能推荐" />
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]"><SlidersHorizontal className="size-3.5" /> {query ? `找到 ${visible.length} 项结果` : `当前展示 ${visible.length} 项机会`}</div>
      </div>

      {notice && <div role="status" className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}><CheckCircle2 className="size-4 shrink-0" /><span>{notice.text}{notice.type === "error" && notice.text.includes("登录") && <Link href="/login?next=/opportunities" className="ml-2 font-bold underline">去登录</Link>}</span></div>}

      {showPublish && (
        <form onSubmit={publishOpportunity} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-7">
          <div className="sm:col-span-2 flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Campus opportunity</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.03em]">发布一个校内组队机会</h2><p className="mt-2 text-xs leading-6 text-[var(--muted)]">平台帮助同学组队，不替代学校或主办方的正式报名。</p></div><button type="button" onClick={() => setShowPublish(false)} aria-label="关闭发布表单" className="grid size-9 shrink-0 place-items-center rounded-full bg-black/[0.04] text-[var(--muted)]"><X className="size-4" /></button></div>
          <Input name="title" label="比赛名称" placeholder="例如：校羽毛球双打赛" required />
          <Input name="organizer" label="校内组织方" placeholder="例如：软件学院学生会" required />
          <label><span className="mb-2 block text-xs font-bold">类型</span><select name="type" className="w-full rounded-2xl border border-black/[0.08] bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]"><option>体育比赛</option><option>文艺比赛</option><option>学术竞赛</option><option>创新创业</option><option>项目</option><option>社区</option></select></label>
          <Input name="tags" label="组队标签" placeholder="羽毛球、双打、混合组" required />
          <Input name="registrationStart" label="开始报名" type="date" placeholder="" required />
          <Input name="registrationEnd" label="截止报名" type="date" placeholder="" />
          <Input name="eventDate" label="比赛日期" type="date" placeholder="" />
          <label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold">比赛与组队说明</span><textarea name="description" required rows={4} placeholder="说明参赛对象、队伍人数和希望怎样组队" className="w-full rounded-2xl border border-black/[0.08] bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>
          <button disabled={loading} className="sm:col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-4 text-sm font-bold text-white disabled:opacity-60">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />} 发布比赛</button>
        </form>
      )}

      <section>
        <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--violet)]">{view === "overview" ? "Opportunity library" : "For your profile"}</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.035em]">{view === "overview" ? "全部比赛" : "为你推荐"}</h2><p className="mt-2 text-xs leading-5 text-[var(--muted)]">{view === "overview" ? "未知报名时间的比赛排列在后，平台不会猜测日期。" : "推荐分只用于排序；赛事事实仍来自发布者或官方来源。"}</p></div></div>
        {visible.length ? <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">{visible.map((item) => <OpportunityCard key={item.id} item={item} recommended={view === "recommended"} teamCount={counts[item.id] ?? 0} intended={intendedIds.includes(item.id)} onToggleInterest={() => toggleInterest(item.id)} />)}</div> : <div className="card mt-5 grid min-h-64 place-items-center p-8 text-center"><div><Search className="mx-auto size-7 text-[var(--muted)]" /><h3 className="mt-4 font-bold">没有找到对应比赛</h3><p className="mt-2 text-sm text-[var(--muted)]">换一个比赛名称、主办方或技能关键词试试。</p><button type="button" onClick={() => setQuery("")} className="mt-4 text-xs font-bold text-[var(--violet)]">清除搜索</button></div></div>}
      </section>
    </div>
  );
}

function OpportunityCard({ item, recommended, teamCount, intended, onToggleInterest }: { item: Opportunity; recommended: boolean; teamCount: number; intended: boolean; onToggleInterest: () => void }) {
  const accent = ACCENTS[item.accent] ?? ACCENTS.violet;
  return (
    <article className="card interactive-card group relative flex min-h-[390px] flex-col overflow-hidden p-5 sm:p-6">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent.line}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2"><span className={`grid size-9 place-items-center rounded-xl ${accent.icon}`}><CalendarDays className="size-4" /></span><span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-bold">{item.type}</span><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${item.verification === "pending" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}><ShieldCheck className="size-3" />{item.verification === "pending" ? "待核验" : "来源已核验"}</span></div>
        {recommended && <div className="shrink-0 text-right"><span className="font-[family-name:var(--font-mono)] text-lg font-bold text-[var(--violet)]">{item.fit}%</span><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Match</p></div>}
      </div>

      <Link href={`/opportunities/${item.id}`} className="mt-5 block w-fit max-w-full">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold leading-snug tracking-[-0.025em] transition group-hover:text-[var(--violet)]">{item.title}</h3>
      </Link>
      <p className="mt-2 text-xs text-[var(--muted)]">{item.organizer} · {item.scope ?? "全国"}</p>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{item.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">{item.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-[var(--paper)] px-2.5 py-1 text-[10px] font-semibold text-[var(--muted)]">{tag}</span>)}</div>

      {recommended && item.matchReasons?.length ? <div className="mt-4 rounded-2xl bg-[var(--violet)]/[0.07] p-3 text-xs leading-5 text-[var(--violet)]"><strong>推荐理由：</strong>{item.matchReasons[0]}</div> : null}

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-3 rounded-2xl bg-[var(--paper)] p-4 text-xs">
        <div className="space-y-2"><p><span className="text-[var(--muted)]">开始报名</span><strong className="ml-2">{item.registrationStart ?? "待补充"}</strong></p><p><span className="text-[var(--muted)]">截止报名</span><strong className="ml-2">{item.registrationEnd ?? "待补充"}</strong></p></div>
        <div className="flex min-w-20 flex-col items-center justify-center rounded-xl bg-white px-3 text-center"><UsersRound className="size-4 text-[var(--cyan)]" /><strong className="mt-1 text-sm">{teamCount}</strong><span className="text-[9px] text-[var(--muted)]">队招募中</span></div>
      </div>

      <div className="mt-auto pt-5">
        <button type="button" onClick={onToggleInterest} aria-pressed={intended} className={`mb-3 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${intended ? "bg-[#eeebff] text-[var(--violet)]" : "border border-black/[0.08] bg-white hover:border-[var(--violet)]/25"}`}><Heart className={`size-4 ${intended ? "fill-current" : ""}`} />{intended ? "已有参赛意向" : "标记参赛意向"}</button>
        <div className="grid grid-cols-2 gap-2"><Link href={`/opportunities/${item.id}/recruit`} className="flex items-center justify-center gap-1.5 rounded-xl bg-[var(--ink)] px-3 py-3 text-center text-[11px] font-bold text-white">我是队长 <ArrowRight className="size-3.5" /></Link><Link href={`/opportunities/${item.id}/teams`} className="flex items-center justify-center gap-1.5 rounded-xl border border-black/[0.08] px-3 py-3 text-center text-[11px] font-bold">寻找队伍 <UsersRound className="size-3.5" /></Link></div>
        <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-[var(--muted)]"><span className="min-w-0 truncate">{item.sourceName}</span>{item.sourceUrl !== "#" && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 font-semibold hover:text-[var(--violet)]">官方来源 <ExternalLink className="size-3" /></a>}</div>
      </div>
    </article>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="rounded-2xl border border-white/8 bg-white/[0.065] px-4 py-3 backdrop-blur-sm"><p className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.04em]">{value}</p><p className="mt-1 text-[10px] text-white/45">{label}</p></div>;
}

function Tab({ active, onClick, icon, title }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${active ? "bg-[var(--ink)] text-white shadow-md" : "text-[var(--muted)] hover:bg-white"}`}>{icon}{title}</button>;
}

function Input({ name, label, placeholder, type = "text", required = false }: { name: string; label: string; placeholder: string; type?: string; required?: boolean }) {
  return <label><span className="mb-2 block text-xs font-bold">{label}</span><input name={name} type={type} required={required} placeholder={placeholder} className="w-full rounded-2xl border border-black/[0.08] bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>;
}
