"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, ExternalLink, LoaderCircle, Send, Sparkles, UsersRound } from "lucide-react";
import type { Opportunity, PersonMatch, RecruitmentPost } from "@/lib/types";

type DetailData = { opportunity: Opportunity; recruitments: RecruitmentPost[]; recommendedPeople: PersonMatch[] };

export function OpportunityDetail({ opportunityId }: { opportunityId: string }) {
  const [data, setData] = useState<DetailData | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch(`/api/opportunities/${opportunityId}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) { setError(payload.message ?? "比赛不存在"); return; }
    setData(payload);
  }, [opportunityId]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPublishing(true); setNotice("");
    if (!data) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/recruitments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ opportunityId: data.opportunity.id, opportunityTitle: data.opportunity.title, teamName: form.get("teamName"), description: form.get("description"), neededSkills: String(form.get("neededSkills") ?? "").split(/[，,、]/), capacity: Number(form.get("capacity")) }) });
    const payload = await response.json(); setPublishing(false);
    if (!response.ok) { setNotice(payload.message); return; }
    setNotice("招募已发布到本场比赛"); formElement.reset(); await load();
  }

  async function apply(recruitmentId: string) {
    setNotice("");
    const response = await fetch(`/api/recruitments/${recruitmentId}/apply`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "我的画像与队伍需求匹配，希望和队长进一步沟通。" }) });
    const payload = await response.json();
    setNotice(response.ok ? "申请已提交，可在“申请管理”中查看处理状态" : payload.message);
    if (response.ok) await load();
  }

  if (error) return <div className="mx-auto max-w-3xl px-5 py-20 text-center"><h1 className="text-2xl font-bold">{error}</h1><Link href="/opportunities" className="mt-5 inline-block underline">返回机会中心</Link></div>;
  if (!data) return <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-[var(--muted)]"><LoaderCircle className="size-4 animate-spin" /> 加载比赛组队空间</div>;
  const { opportunity, recruitments, recommendedPeople } = data;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <Link href="/opportunities" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft className="size-4" /> 返回机会中心</Link>
      <section className="card mt-6 overflow-hidden"><div className="bg-[var(--ink)] p-7 text-white sm:p-9"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">{opportunity.type}</span><span className="rounded-full bg-[var(--lime)] px-3 py-1.5 text-xs font-bold text-[var(--ink)]">{opportunity.scope}</span></div><h1 className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{opportunity.title}</h1><p className="mt-3 text-sm text-white/60">{opportunity.organizer}</p><p className="mt-5 max-w-3xl text-sm leading-7 text-white/75">{opportunity.description}</p></div><div className="grid gap-5 p-6 text-sm sm:grid-cols-3 sm:p-7"><Info label="报名时间" value={`${opportunity.registrationStart ?? "待补充"} — ${opportunity.registrationEnd ?? "待补充"}`} /><Info label="组队状态" value={`${recruitments.length} 支队伍正在招募`} /><Info label="信息状态" value={opportunity.verification === "pending" ? "校内发布 · 待核验" : `来源已核验 · ${opportunity.verifiedAt}`} /></div>{opportunity.sourceUrl !== "#" && <a href={opportunity.sourceUrl} target="_blank" rel="noreferrer" className="mx-6 mb-6 inline-flex items-center gap-2 text-xs font-bold text-[var(--violet)] sm:mx-7">查看官方来源 <ExternalLink className="size-3.5" /></a>}</section>

      {notice && <div className="mt-5 rounded-2xl bg-[var(--lime)]/45 px-4 py-3 text-sm">{notice}{notice.includes("登录") && <Link href={`/login?next=/opportunities/${opportunity.id}`} className="ml-2 font-bold underline">去登录</Link>}</div>}

      <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_0.72fr]">
        <div className="space-y-7">
          <section id="teams"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Teams for this opportunity</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">本场比赛正在招募的队伍</h2></div><Link href="/applications" className="text-xs font-bold text-[var(--violet)]">申请管理</Link></div><div className="mt-5 space-y-4">{recruitments.map((post) => <article key={post.id} className="card p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-bold">{post.teamName}</h3><p className="mt-1 text-xs text-[var(--muted)]">队长 {post.ownerName}</p></div><span className="rounded-full bg-[var(--lime)] px-2.5 py-1 text-[10px] font-bold">{post.currentSize}/{post.capacity} 人</span></div><p className="mt-4 text-sm leading-6 text-[var(--muted)]">{post.description}</p><div className="mt-4 flex flex-wrap gap-2">{post.neededSkills.map((skill) => <span key={skill} className="rounded-full bg-[var(--paper)] px-2.5 py-1 text-[10px] font-semibold">缺 {skill}</span>)}</div><div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4"><span className="flex items-center gap-1.5 text-xs text-[var(--muted)]"><UsersRound className="size-3.5" /> {post.applicants} 人申请</span><button disabled={post.currentSize >= post.capacity} onClick={() => apply(post.id)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">{post.currentSize >= post.capacity ? "队伍已满" : "申请加入"}<ArrowRight className="size-3.5" /></button></div></article>)}{recruitments.length === 0 && <div className="rounded-3xl border border-dashed border-black/10 p-10 text-center text-sm text-[var(--muted)]">本场比赛还没有队伍招募，你可以成为第一个。</div>}</div></section>

          <form id="publish" onSubmit={publish} className="card grid scroll-mt-6 gap-4 p-6 sm:grid-cols-2 sm:p-7"><div className="sm:col-span-2"><p className="text-xs font-bold text-[var(--violet)]">为「{opportunity.title}」招募</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">发布队伍需求</h2></div><Input name="teamName" label="队伍名称" placeholder="例如：Link Builders" /><Input name="neededSkills" label="需要的技能" placeholder="前端、视觉设计、文案" /><Input name="capacity" label="队伍人数上限" placeholder="4" type="number" /><label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold">招募说明</span><textarea name="description" required rows={4} placeholder="当前进度、项目想法和希望队友负责什么" className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label><button disabled={publishing} className="sm:col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-4 text-sm font-bold text-white">{publishing ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />} 发布到本场比赛</button></form>
        </div>

        <aside><section className="card sticky top-6 p-6"><div className="flex items-center gap-3"><Sparkles className="size-5 text-[var(--violet)]" /><div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold">本场比赛推荐队友</h2><p className="text-xs text-[var(--muted)]">依据比赛标签重新排序</p></div></div><div className="mt-5 space-y-4">{recommendedPeople.map((person) => <article key={person.id} className="rounded-2xl border border-black/[0.06] p-4"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-[#ebe8ff] text-sm font-bold text-[var(--violet)]">{person.avatar}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><strong className="text-sm">{person.name}</strong><span className="rounded-full bg-[var(--lime)] px-2 py-0.5 text-[9px] font-bold">{person.match}%</span></div><p className="text-[10px] text-[var(--muted)]">{person.major}</p></div></div><div className="mt-3 flex gap-2"><BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-[var(--violet)]" /><p className="text-xs leading-5 text-[var(--muted)]">{person.reason}</p></div></article>)}</div></section></aside>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-bold text-[var(--muted)]">{label}</p><p className="mt-2 font-semibold">{value}</p></div>; }
function Input({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder: string; type?: string }) { return <label><span className="mb-2 block text-xs font-bold">{label}</span><input name={name} required type={type} placeholder={placeholder} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>; }
