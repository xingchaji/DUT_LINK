"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink, LoaderCircle, Plus, Search, Send, UsersRound } from "lucide-react";
import { opportunities } from "@/lib/mock-data";
import type { Opportunity, RecruitmentPost } from "@/lib/types";

type Notice = { type: "success" | "error"; text: string } | null;

export function OpportunityCenter() {
  const [rankedOpportunities, setRankedOpportunities] = useState<Opportunity[]>(opportunities);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Opportunity>(opportunities[0]);
  const [recruitments, setRecruitments] = useState<RecruitmentPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecruitments();
    const stored = localStorage.getItem("dut-link-profile");
    const rankingRequest = stored
      ? fetch("/api/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: JSON.parse(stored) }) })
      : fetch("/api/opportunities");
    rankingRequest.then((response) => response.json()).then((data) => {
      if (data.opportunities?.length) {
        setRankedOpportunities(data.opportunities);
        setSelected(data.opportunities[0]);
      }
    });
  }, []);

  async function loadRecruitments() {
    const response = await fetch("/api/recruitments");
    const data = await response.json();
    setRecruitments(data.recruitments ?? []);
  }

  const visible = useMemo(() => rankedOpportunities.filter((item) => `${item.title} ${item.tags.join(" ")} ${item.organizer}`.toLowerCase().includes(query.toLowerCase())), [query, rankedOpportunities]);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setNotice(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/recruitments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunityId: selected.id,
        opportunityTitle: selected.title,
        teamName: form.get("teamName"),
        description: form.get("description"),
        neededSkills: String(form.get("neededSkills") ?? "").split(/[，,、]/),
        capacity: Number(form.get("capacity")),
      }),
    });
    const data = await response.json(); setLoading(false);
    if (!response.ok) { setNotice({ type: "error", text: data.message }); return; }
    setNotice({ type: "success", text: "招募已发布" }); setShowForm(false); await loadRecruitments();
  }

  async function apply(id: string) {
    setNotice(null);
    const response = await fetch(`/api/recruitments/${id}/apply`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "我的能力与队伍需求匹配，希望进一步沟通。" }) });
    const data = await response.json();
    if (!response.ok) { setNotice({ type: "error", text: data.message }); return; }
    setNotice({ type: "success", text: "报名成功，队长可以在申请列表中看到你" }); await loadRecruitments();
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索赛事、技能或主办方" className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--violet)]" /></div>
          <p className="text-xs text-[var(--muted)]">所有机会均显示来源和核验状态，避免把 AI 生成内容误当官方通知。</p>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {visible.map((item) => (
            <article key={item.id} className={`card flex flex-col p-5 ${selected.id === item.id ? "ring-2 ring-[var(--violet)]/50" : ""}`}>
              <div className="flex items-start justify-between gap-3"><span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-bold">{item.type}</span><span className="text-right font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--violet)]">{item.fit}% FIT</span></div>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-xl font-bold">{item.title}</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">{item.organizer} · {item.deadline}</p>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-full bg-[var(--paper)] px-2.5 py-1 text-[10px]">{tag}</span>)}</div>
              <div className="mt-5 border-t border-black/[0.06] pt-4 text-xs leading-5"><p><strong>状态：</strong>{item.status}</p><p className="mt-1"><strong>综测：</strong>{item.bonusPolicy}</p><p className="mt-1 text-[var(--muted)]">最近核验：{item.verifiedAt}</p></div>
              {item.matchReasons && <p className="mt-3 rounded-xl bg-[#ebe8ff] p-3 text-xs leading-5 text-[var(--violet)]"><strong>推荐依据：</strong>{item.matchReasons.join("；")}</p>}
              <div className="mt-auto flex items-center gap-2 pt-5"><button onClick={() => { setSelected(item); setShowForm(true); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-3 py-2.5 text-xs font-bold text-white"><Plus className="size-3.5" /> 为此机会招募</button>{item.sourceUrl !== "#" && <a href={item.sourceUrl} target="_blank" rel="noreferrer" aria-label="查看官方来源" className="grid size-9 place-items-center rounded-xl border border-black/10"><ExternalLink className="size-3.5" /></a>}</div>
            </article>
          ))}
        </div>
      </section>

      {notice && <div className={`rounded-2xl px-4 py-3 text-sm ${notice.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{notice.text}{notice.type === "error" && notice.text.includes("登录") && <Link href="/login?next=/opportunities" className="ml-2 font-bold underline">去登录</Link>}</div>}

      {showForm && <section className="card p-6 sm:p-7"><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-[var(--violet)]">发布招募 · {selected.title}</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">让合适的人找到你的队伍</h2></div><button onClick={() => setShowForm(false)} className="text-xs text-[var(--muted)]">关闭</button></div><form onSubmit={publish} className="mt-6 grid gap-4 sm:grid-cols-2"><Input name="teamName" label="队伍名称" placeholder="例如：Link Builders" required /><Input name="neededSkills" label="需要的技能" placeholder="React、UI 设计、内容策划" required /><Input name="capacity" label="队伍人数上限" placeholder="4" type="number" required /><label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold">招募说明</span><textarea name="description" required rows={4} placeholder="项目想法、目前进度、希望队友负责什么" className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label><button disabled={loading} className="sm:col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-4 text-sm font-bold text-white">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />} 发布招募</button></form></section>}

      <section>
        <div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Open teams</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">正在招募的队伍</h2></div><span className="text-xs text-[var(--muted)]">{recruitments.length} 条招募</span></div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">{recruitments.map((post) => <article key={post.id} className="card p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-[var(--violet)]">{post.opportunityTitle}</p><h3 className="mt-2 text-lg font-bold">{post.teamName}</h3><p className="mt-1 text-xs text-[var(--muted)]">队长 {post.ownerName}</p></div><span className="rounded-full bg-[var(--lime)] px-2.5 py-1 text-[10px] font-bold">{post.currentSize}/{post.capacity} 人</span></div><p className="mt-4 text-sm leading-6 text-[var(--muted)]">{post.description}</p><div className="mt-4 flex flex-wrap gap-2">{post.neededSkills.map((skill) => <span key={skill} className="rounded-full bg-[var(--paper)] px-2.5 py-1 text-[10px] font-semibold">缺 {skill}</span>)}</div><div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4"><span className="flex items-center gap-1.5 text-xs text-[var(--muted)]"><UsersRound className="size-3.5" /> {post.applicants} 人已申请</span><button onClick={() => apply(post.id)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-2.5 text-xs font-bold text-white">申请加入 <ArrowRight className="size-3.5" /></button></div></article>)}</div>
        {recruitments.length === 0 && <div className="mt-5 rounded-3xl border border-dashed border-black/10 p-10 text-center text-sm text-[var(--muted)]"><CheckCircle2 className="mx-auto mb-3 size-6" />暂时没有招募，成为第一个发布者吧。</div>}
      </section>
    </div>
  );
}

function Input({ name, label, placeholder, type = "text", required = false }: { name: string; label: string; placeholder: string; type?: string; required?: boolean }) {
  return <label><span className="mb-2 block text-xs font-bold">{label}</span><input name={name} type={type} required={required} placeholder={placeholder} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>;
}
