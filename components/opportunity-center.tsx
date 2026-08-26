"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ExternalLink, Heart, LoaderCircle, Plus, Search, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { opportunities as seedOpportunities } from "@/lib/mock-data";
import type { Opportunity } from "@/lib/types";

type View = "overview" | "recommended";
type Notice = { type: "success" | "error"; text: string } | null;

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
    setOverview(data.overview ?? []); setRecommended(data.recommended ?? []); setCounts(data.recruitmentCounts ?? {}); setIntendedIds(data.intendedOpportunityIds ?? []);
    const stored = localStorage.getItem("dut-link-profile");
    if (stored) {
      const ranked = await fetch("/api/opportunities/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: JSON.parse(stored) }) });
      const rankedData = await ranked.json();
      if (rankedData.opportunities) setRecommended(rankedData.opportunities);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const visible = useMemo(() => (view === "overview" ? overview : recommended).filter((item) => `${item.title} ${item.tags.join(" ")} ${item.organizer} ${item.type}`.toLowerCase().includes(query.toLowerCase())), [overview, query, recommended, view]);

  async function publishOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setNotice(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"), organizer: form.get("organizer"), type: form.get("type"),
        registrationStart: form.get("registrationStart"), registrationEnd: form.get("registrationEnd") || null,
        eventDate: form.get("eventDate") || null, description: form.get("description"),
        tags: String(form.get("tags") ?? "").split(/[，,、]/),
      }),
    });
    const data = await response.json(); setLoading(false);
    if (!response.ok) { setNotice({ type: "error", text: data.message }); return; }
    setNotice({ type: "success", text: "校内比赛已发布，核验前会显示“待核验”" });
    setShowPublish(false); formElement.reset(); await load(); setView("overview");
  }

  async function toggleInterest(opportunityId: string) {
    const intended = !intendedIds.includes(opportunityId);
    const response = await fetch("/api/opportunity-interests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ opportunityId, intended }) });
    const data = await response.json();
    if (!response.ok) { setNotice({ type: "error", text: data.message }); return; }
    setIntendedIds((current) => intended ? [...current, opportunityId] : current.filter((id) => id !== opportunityId));
    setNotice({ type: "success", text: intended ? "已加入参赛意向，队长推荐队友时会优先筛选你" : "已取消参赛意向" });
  }

  return (
    <div className="space-y-7">
      <section className="card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex rounded-2xl bg-[var(--paper)] p-1">
            <Tab active={view === "overview"} onClick={() => setView("overview")} icon={<CalendarDays className="size-4" />} title="比赛总览" subtitle="按开始报名时间排序" />
            <Tab active={view === "recommended"} onClick={() => setView("recommended")} icon={<Sparkles className="size-4" />} title="推荐比赛" subtitle="按画像与兴趣排序" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索比赛或技能" className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--violet)] sm:w-64" /></div>
            <button onClick={() => setShowPublish((current) => !current)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-4 py-3 text-xs font-bold text-white"><Plus className="size-4" /> 发布校内比赛</button>
          </div>
        </div>
      </section>

      {notice && <div className={`rounded-2xl px-4 py-3 text-sm ${notice.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{notice.text}{notice.type === "error" && notice.text.includes("登录") && <Link href="/login?next=/opportunities" className="ml-2 font-bold underline">去登录</Link>}</div>}

      {showPublish && <form onSubmit={publishOpportunity} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-7"><div className="sm:col-span-2"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Campus opportunity</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">发布一个以组队为目标的校内比赛</h2><p className="mt-2 text-xs leading-6 text-[var(--muted)]">歌唱、羽毛球、创新项目都可以发布；平台只帮助组队，不统计或代替官方报名名单。</p></div><Input name="title" label="比赛名称" placeholder="例如：校羽毛球双打赛" required /><Input name="organizer" label="校内组织方" placeholder="例如：软件学院学生会" required /><label><span className="mb-2 block text-xs font-bold">类型</span><select name="type" className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm"><option>体育比赛</option><option>文艺比赛</option><option>学术竞赛</option><option>创新创业</option><option>项目</option><option>社区</option></select></label><Input name="tags" label="组队标签" placeholder="羽毛球、双打、混合组" required /><Input name="registrationStart" label="开始报名" type="date" placeholder="" required /><Input name="registrationEnd" label="截止报名" type="date" placeholder="" /><Input name="eventDate" label="比赛日期" type="date" placeholder="" /><label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold">比赛与组队说明</span><textarea name="description" required rows={4} placeholder="说明参赛对象、队伍人数和希望怎样组队" className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label><button disabled={loading} className="sm:col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-4 text-sm font-bold text-white">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />} 发布比赛</button></form>}

      <section>
        <div className="flex items-end justify-between"><div><h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">{view === "overview" ? "全部比赛" : "为你推荐"}</h2><p className="mt-1 text-xs text-[var(--muted)]">{view === "overview" ? "未知报名时间的比赛排列在后，绝不猜测日期" : "推荐分仅用于排序，比赛事实仍来自发布者或官方来源"}</p></div><span className="text-xs text-[var(--muted)]">{visible.length} 个组队机会</span></div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">{visible.map((item) => <OpportunityCard key={item.id} item={item} recommended={view === "recommended"} teamCount={counts[item.id] ?? 0} intended={intendedIds.includes(item.id)} onToggleInterest={() => toggleInterest(item.id)} />)}</div>
      </section>
    </div>
  );
}

function OpportunityCard({ item, recommended, teamCount, intended, onToggleInterest }: { item: Opportunity; recommended: boolean; teamCount: number; intended: boolean; onToggleInterest: () => void }) {
  return <article className="card flex flex-col p-5"><div className="flex items-start justify-between gap-3"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-bold">{item.type}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${item.verification === "pending" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{item.verification === "pending" ? "待核验" : "已核验来源"}</span></div>{recommended && <span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--violet)]">{item.fit}% FIT</span>}</div><h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-bold">{item.title}</h3><p className="mt-1 text-xs text-[var(--muted)]">{item.organizer} · {item.scope ?? "全国"}</p><p className="mt-4 text-sm leading-6 text-[var(--muted)]">{item.description}</p><div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-full bg-[var(--paper)] px-2.5 py-1 text-[10px]">{tag}</span>)}</div><button type="button" onClick={onToggleInterest} aria-pressed={intended} className={`mt-4 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold ${intended ? "bg-[#ebe8ff] text-[var(--violet)]" : "border border-black/10"}`}><Heart className={`size-4 ${intended ? "fill-current" : ""}`} />{intended ? "已有参赛意向" : "标记参赛意向"}</button><div className="mt-4 rounded-2xl bg-[var(--paper)] p-3 text-xs leading-6"><p><strong>开始报名：</strong>{item.registrationStart ?? "待官方或发布者补充"}</p><p><strong>截止报名：</strong>{item.registrationEnd ?? "待补充"}</p><p className="flex items-center gap-1.5"><UsersRound className="size-3.5" /><strong>{teamCount}</strong> 支队伍正在招募</p></div>{recommended && item.matchReasons && <p className="mt-3 text-xs leading-5 text-[var(--violet)]">{item.matchReasons.join("；")}</p>}<div className="mt-auto grid grid-cols-2 gap-2 pt-5"><Link href={`/opportunities/${item.id}/recruit`} className="flex items-center justify-center rounded-xl bg-[var(--ink)] px-3 py-2.5 text-center text-[11px] font-bold text-white">队长招募工作台</Link><Link href={`/opportunities/${item.id}/teams`} className="flex items-center justify-center rounded-xl border border-black/10 px-3 py-2.5 text-center text-[11px] font-bold">查看招募队伍</Link></div><div className="mt-3 flex items-center justify-between text-[10px] text-[var(--muted)]"><span className="inline-flex items-center gap-1"><ShieldCheck className="size-3" /> {item.sourceName}</span>{item.sourceUrl !== "#" && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">官方来源 <ExternalLink className="size-3" /></a>}</div></article>;
}

function Tab({ active, onClick, icon, title, subtitle }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string }) {
  return <button onClick={onClick} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-left transition ${active ? "bg-white shadow-sm" : "text-[var(--muted)]"}`}>{icon}<span><strong className="block text-xs">{title}</strong><span className="hidden text-[9px] sm:block">{subtitle}</span></span></button>;
}

function Input({ name, label, placeholder, type = "text", required = false }: { name: string; label: string; placeholder: string; type?: string; required?: boolean }) {
  return <label><span className="mb-2 block text-xs font-bold">{label}</span><input name={name} type={type} required={required} placeholder={placeholder} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>;
}
