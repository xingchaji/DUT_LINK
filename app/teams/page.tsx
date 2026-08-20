"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, LoaderCircle, Plus, SlidersHorizontal, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { matches as initialMatches } from "@/lib/mock-data";
import type { PersonMatch } from "@/lib/types";

export default function TeamsPage() {
  const [matches, setMatches] = useState<PersonMatch[]>(initialMatches);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("dut-link-profile");
    const request = stored
      ? fetch("/api/matches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: JSON.parse(stored) }) })
      : fetch("/api/matches");
    request.then((response) => response.json()).then((data) => setMatches(data.matches ?? initialMatches)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <PageHeader eyebrow="Explainable Matching" title="寻找互补，而不只是相似" />
      <div className="mt-3 flex items-start gap-2 text-xs leading-6 text-[var(--muted)]"><SlidersHorizontal className="mt-1 size-4 shrink-0" /><p>当前评分由技能互补 50%、共同兴趣 30%、跨专业价值 20% 组成。画像更新后可重新计算，不再使用固定匹配数字。</p></div>
      <section className="mt-8 grid gap-5 sm:grid-cols-3">
        <div className="card col-span-full overflow-hidden bg-[var(--ink)] p-7 text-white sm:flex sm:items-center sm:justify-between"><div><span className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--lime)]"><UsersRound className="size-4" /> 当前团队</span><h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold">校园 AI 导览小队</h2><p className="mt-2 text-sm text-white/55">已有 2 人 · 还缺 UI 设计与内容策划</p></div><Link href="/opportunities" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--lime)] px-5 py-3 text-sm font-bold text-[var(--ink)] sm:mt-0"><Plus className="size-4" /> 发布招募</Link></div>
        {loading && <div className="col-span-full flex items-center justify-center gap-2 py-8 text-sm text-[var(--muted)]"><LoaderCircle className="size-4 animate-spin" /> 正在根据画像计算</div>}
        {!loading && matches.map((person, index) => (
          <article key={person.id} className="card flex flex-col p-5">
            <div className="flex items-start justify-between"><div className={`grid size-14 place-items-center rounded-3xl text-lg font-bold ${index === 0 ? "bg-[#ebe8ff] text-[var(--violet)]" : index === 1 ? "bg-[#dcf2ee] text-[#238983]" : "bg-[#fff0df] text-[#c1762e]"}`}>{person.avatar}</div><span className="rounded-full bg-[var(--lime)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-bold">{person.match}% MATCH</span></div>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-xl font-bold">{person.name}</h2><p className="mt-1 text-xs text-[var(--muted)]">{person.major}</p>
            <div className="mt-4 flex flex-wrap gap-2">{person.tags.map((tag) => <span key={tag} className="rounded-full bg-black/[0.035] px-2.5 py-1 text-[10px] font-medium">{tag}</span>)}</div>
            {person.scoreBreakdown && <div className="mt-5 grid grid-cols-3 gap-2 text-center">{Object.entries({ 技能互补: person.scoreBreakdown.complementarity, 兴趣桥接: person.scoreBreakdown.sharedInterests, 跨专业: person.scoreBreakdown.crossDiscipline }).map(([label, score]) => <div key={label} className="rounded-xl bg-[var(--paper)] p-2"><strong className="block text-sm">{score}</strong><span className="text-[9px] text-[var(--muted)]">{label}</span></div>)}</div>}
            <div className="mt-4 flex gap-2 rounded-2xl bg-[var(--paper)] p-3"><BadgeCheck className="mt-0.5 size-4 shrink-0 text-[var(--violet)]" /><p className="text-xs leading-5 text-[var(--muted)]">{person.reason}</p></div>
            <p className="mt-4 text-xs font-semibold text-[#238983]">● {person.status}</p>
            <button className="mt-5 flex items-center justify-between rounded-xl border border-black/10 px-4 py-3 text-xs font-bold transition hover:bg-[var(--ink)] hover:text-white">发起连接 <ArrowRight className="size-4" /></button>
          </article>
        ))}
      </section>
    </div>
  );
}
