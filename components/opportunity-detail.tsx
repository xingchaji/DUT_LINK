"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, ExternalLink, LoaderCircle, MailPlus, Send, Sparkles, Trash2, UserRound, UsersRound, X } from "lucide-react";
import { TagEditor } from "@/components/tag-editor";
import type { Opportunity, PersonMatch, PersonProfile, RecruitmentPost, TeamMemberSummary } from "@/lib/types";

type DetailData = {
  opportunity: Opportunity;
  recruitments: RecruitmentPost[];
  ownedRecruitment: RecruitmentPost | null;
};

type RecommendationData = { people: PersonMatch[]; mode: "ai" | "rules" | "profile-fallback"; policy: string };

export function OpportunityDetail({ opportunityId, mode }: { opportunityId: string; mode: "overview" | "recruit" | "teams" }) {
  const [data, setData] = useState<DetailData | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);

  const load = useCallback(async () => {
    const response = await fetch(`/api/opportunities/${opportunityId}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) { setError(payload.message ?? "比赛不存在"); return; }
    setData(payload);
    if (payload.ownedRecruitment) {
      const recommendationResponse = await fetch(`/api/recruitments/${payload.ownedRecruitment.id}/recommendations`, { cache: "no-store" });
      const recommendationPayload = await recommendationResponse.json();
      setRecommendations(recommendationResponse.ok ? recommendationPayload : null);
    } else {
      setRecommendations(null);
    }
  }, [opportunityId]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    setPublishing(true); setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/recruitments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunityId: data.opportunity.id, opportunityTitle: data.opportunity.title,
        teamName: form.get("teamName"), projectDirection: form.get("projectDirection"),
        expectedAvailability: form.get("expectedAvailability"),
        contact: form.get("contact"), description: form.get("description"), requirements: form.get("requirements"),
        neededSkills: String(form.get("neededSkills") ?? "").split(/[，,、]/),
        capacity: Number(form.get("capacity")),
        recruitmentDeadline: form.get("recruitmentDeadline"),
      }),
    });
    const payload = await response.json(); setPublishing(false);
    if (!response.ok) { setNotice(payload.message); return; }
    setNotice("队伍已创建，推荐人选现在可以收到你的邀请"); formElement.reset(); setFormVersion((value) => value + 1); await load();
  }

  async function deleteTeam(recruitmentId: string) {
    const response = await fetch(`/api/recruitments/${recruitmentId}`, { method: "DELETE" });
    const payload = await response.json();
    setNotice(response.ok ? "队伍及其未完成的申请、邀请已删除" : payload.message);
    if (response.ok) await load();
  }

  async function apply(recruitmentId: string) {
    setNotice("");
    const response = await fetch(`/api/recruitments/${recruitmentId}/apply`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "我的画像与队伍需求匹配，希望和队长进一步沟通。" }) });
    const payload = await response.json();
    setNotice(response.ok ? "申请已提交，可在“申请管理”中查看处理状态" : payload.message);
    if (response.ok) await load();
  }

  async function openPerson(id: string) {
    setProfileLoading(true);
    const response = await fetch(`/api/people/${id}`);
    const payload = await response.json(); setProfileLoading(false);
    if (!response.ok) { setNotice(payload.message); return; }
    setSelectedPerson(payload.person);
  }

  async function invite(person: PersonProfile) {
    if (!data) return;
    const response = await fetch("/api/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: person.id, opportunityId: data.opportunity.id }) });
    const payload = await response.json();
    setNotice(response.ok ? `已向 ${person.name} 发送组队邀请` : payload.message);
    if (response.ok) setSelectedPerson(null);
  }

  if (error) return <div className="mx-auto max-w-3xl px-5 py-20 text-center"><h1 className="text-2xl font-bold">{error}</h1><Link href="/opportunities" className="mt-5 inline-block underline">返回组队中心</Link></div>;
  if (!data) return <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-[var(--muted)]"><LoaderCircle className="size-4 animate-spin" /> 加载比赛空间</div>;
  const { opportunity, recruitments, ownedRecruitment } = data;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <Link href="/opportunities" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft className="size-4" /> 返回组队中心</Link>
      <OpportunityHeader opportunity={opportunity} activeTeams={recruitments.length} />
      {notice && <div className="mt-5 rounded-2xl bg-[var(--lime)]/45 px-4 py-3 text-sm">{notice}{notice.includes("登录") && <Link href={`/login?next=/opportunities/${opportunity.id}/${mode === "teams" ? "teams" : "recruit"}`} className="ml-2 font-bold underline">去登录</Link>}</div>}
      {mode === "overview" && <RoleChooser opportunity={opportunity} activeTeams={recruitments.length} />}
      {mode === "teams" && <TeamsView recruitments={recruitments} opportunity={opportunity} onApply={apply} />}
      {mode === "recruit" && <RecruitView key={formVersion} opportunity={opportunity} recommendations={recommendations} ownedRecruitment={ownedRecruitment} publishing={publishing} profileLoading={profileLoading} onPublish={publish} onDelete={deleteTeam} onOpenPerson={openPerson} />}
      {selectedPerson && <PersonDialog person={selectedPerson} onClose={() => setSelectedPerson(null)} onInvite={() => invite(selectedPerson)} />}
    </div>
  );
}

function OpportunityHeader({ opportunity, activeTeams }: { opportunity: Opportunity; activeTeams: number }) {
  return <section className="card mt-6 overflow-hidden"><div className="bg-[var(--ink)] p-7 text-white sm:p-9"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">{opportunity.type}</span><span className="rounded-full bg-[var(--lime)] px-3 py-1.5 text-xs font-bold text-[var(--ink)]">{opportunity.scope}</span></div><h1 className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{opportunity.title}</h1><p className="mt-3 text-sm text-white/60">{opportunity.organizer}</p><p className="mt-5 max-w-3xl text-sm leading-7 text-white/75">{opportunity.description}</p></div><div className="grid gap-5 p-6 text-sm sm:grid-cols-3 sm:p-7"><Info label="报名时间" value={`${opportunity.registrationStart ?? "待补充"} — ${opportunity.registrationEnd ?? "待补充"}`} /><Info label="有效招募" value={`${activeTeams} 支队伍`} /><Info label="信息状态" value={opportunity.verification === "pending" ? "校内发布 · 待核验" : `来源已核验 · ${opportunity.verifiedAt}`} /></div>{opportunity.sourceUrl !== "#" && <a href={opportunity.sourceUrl} target="_blank" rel="noreferrer" className="mx-6 mb-6 inline-flex items-center gap-2 text-xs font-bold text-[var(--violet)] sm:mx-7">查看官方来源 <ExternalLink className="size-3.5" /></a>}</section>;
}

function RoleChooser({ opportunity, activeTeams }: { opportunity: Opportunity; activeTeams: number }) {
  return <section className="mt-7 grid gap-5 md:grid-cols-2"><Link href={`/opportunities/${opportunity.id}/recruit`} className="card group p-7"><BriefcaseBusiness className="size-7 text-[var(--violet)]" /><p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">我是队长</p><h2 className="mt-2 text-2xl font-bold">创建队伍并智能招募</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">填写完整队伍信息，查看对本场比赛有意向且画像匹配的同学，并直接发送邀请。</p><span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[var(--violet)]">进入队长工作台 <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span></Link><Link href={`/opportunities/${opportunity.id}/teams`} className="card group p-7"><UsersRound className="size-7 text-[var(--coral)]" /><p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">我是队员</p><h2 className="mt-2 text-2xl font-bold">查看正在招募的队伍</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">当前有 {activeTeams} 支有效招募，超过截止日期或已经满员的队伍不会展示。</p><span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[var(--coral)]">进入找队页面 <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span></Link></section>;
}

function TeamsView({ recruitments, opportunity, onApply }: { recruitments: RecruitmentPost[]; opportunity: Opportunity; onApply: (id: string) => void }) {
  return <section className="mt-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Find a team</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">正在招募的队伍</h2><p className="mt-2 text-sm text-[var(--muted)]">只展示尚未截止且仍有名额的招募。</p></div><Link href={`/opportunities/${opportunity.id}/recruit`} className="rounded-xl border border-black/10 px-4 py-3 text-xs font-bold">我是队长，去创建队伍</Link></div><div className="mt-6 grid gap-5 lg:grid-cols-2">{recruitments.map((post) => <RecruitmentCard key={post.id} post={post} onApply={() => onApply(post.id)} />)}{recruitments.length === 0 && <div className="card p-12 text-center text-sm text-[var(--muted)] lg:col-span-2">目前没有仍在有效期内的队伍招募。</div>}</div></section>;
}

function RecruitmentCard({ post, onApply }: { post: RecruitmentPost; onApply: () => void }) {
  return <article className="card p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold text-[var(--violet)]">{post.projectDirection || "方向待沟通"}</p><h3 className="mt-2 text-xl font-bold">{post.teamName}</h3><p className="mt-1 text-xs text-[var(--muted)]">队长 {post.ownerName} · {post.contact}</p></div><span className="rounded-full bg-[var(--lime)] px-3 py-1 text-[10px] font-bold">{post.currentSize}/{post.capacity} 人</span></div>{post.description && <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{post.description}</p>}<div className="mt-4 rounded-2xl bg-[var(--paper)] p-4 text-xs leading-6"><p><strong>招募要求：</strong>{post.requirements}</p><div className="flex flex-wrap items-center gap-1"><strong>已有成员：</strong><MemberLinks members={post.members} /></div><p><strong>截止日期：</strong>{post.recruitmentDeadline}</p></div><div className="mt-4 flex flex-wrap gap-2">{post.neededSkills.map((skill) => <span key={skill} className="rounded-full bg-[#ebe8ff] px-2.5 py-1 text-[10px] font-semibold text-[var(--violet)]">需要 {skill}</span>)}</div><div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4"><span className="flex items-center gap-1.5 text-xs text-[var(--muted)]"><UsersRound className="size-3.5" /> {post.applicants} 人申请</span><button onClick={onApply} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-2.5 text-xs font-bold text-white">申请加入 <ArrowRight className="size-3.5" /></button></div></article>;
}

function RecruitView({ opportunity, recommendations, ownedRecruitment, publishing, profileLoading, onPublish, onDelete, onOpenPerson }: { opportunity: Opportunity; recommendations: RecommendationData | null; ownedRecruitment: RecruitmentPost | null; publishing: boolean; profileLoading: boolean; onPublish: (event: FormEvent<HTMLFormElement>) => void; onDelete: (id: string) => void; onOpenPerson: (id: string) => void }) {
  const [tags, setTags] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const createPanel = ownedRecruitment ? <section className="card p-6 sm:p-7"><p className="text-xs font-bold text-[var(--violet)]">我的本场队伍</p><div className="mt-3 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-bold">{ownedRecruitment.teamName}</h2><p className="mt-2 text-sm text-[var(--muted)]">{ownedRecruitment.projectDirection || "尚未填写项目方向"}</p></div><span className="rounded-full bg-[var(--lime)] px-3 py-1 text-xs font-bold">{ownedRecruitment.currentSize}/{ownedRecruitment.capacity} 人</span></div><div className="mt-5 rounded-2xl bg-[var(--paper)] p-4 text-xs leading-6"><div className="flex flex-wrap items-center gap-1"><strong>自动成员名单：</strong><MemberLinks members={ownedRecruitment.members} /></div><p><strong>招募截止：</strong>{ownedRecruitment.recruitmentDeadline}</p><p><strong>联系方式：</strong>{ownedRecruitment.contact}</p></div><p className="mt-5 text-xs leading-6 text-[var(--muted)]">同一比赛只能创建一支队伍。删除后，本队申请和邀请记录也会清理。</p>{confirmDelete ? <div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => onDelete(ownedRecruitment.id)} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-bold text-white"><Trash2 className="size-4" /> 确认删除</button><button type="button" onClick={() => setConfirmDelete(false)} className="rounded-xl border border-black/10 px-4 py-3 text-xs font-bold">取消</button></div> : <button type="button" onClick={() => setConfirmDelete(true)} className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-xs font-bold text-red-600"><Trash2 className="size-4" /> 删除本队伍</button>}</section> : <form onSubmit={onPublish} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-7"><div className="sm:col-span-2"><p className="text-xs font-bold text-[var(--violet)]">队长招募工作台</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">为「{opportunity.title}」创建队伍</h2><p className="mt-2 text-xs leading-6 text-[var(--muted)]">先填写技能标签和具体招募要求，创建队伍后系统才会生成定向推荐。</p></div><Input name="teamName" label="队伍名称 *" placeholder="例如：Link Builders" required /><Input name="projectDirection" label="项目方向（选填）" placeholder="例如：AI 校园助手" /><Input name="expectedAvailability" label="期望可用时间（选填）" placeholder="例如：周末、工作日晚间" /><Input name="contact" label="队长联系方式 *" placeholder="微信、QQ 或校园邮箱" required /><TagEditor label="招募技能标签 *" tags={tags} onChange={setTags} inputName="neededSkills" maxTags={8} placeholder="输入“用户调研”后按回车" /><Input name="capacity" label="队员上限 *" placeholder="4" type="number" required min="2" max="12" /><Input name="recruitmentDeadline" label="招募截止日期 *" placeholder="" type="date" required /><label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold">队伍介绍（选填）</span><textarea name="description" rows={3} placeholder="当前进度、项目想法和协作方式" className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label><label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold">招募要求 *</span><textarea name="requirements" required rows={4} minLength={8} placeholder="希望队员具备什么能力、每周投入时间和具体职责" className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label><button disabled={publishing || tags.length === 0} className="sm:col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-4 text-sm font-bold text-white disabled:opacity-50">{publishing ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />} 创建队伍并开始招募</button></form>;
  const people = recommendations?.people ?? [];
  return <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_0.72fr]">{createPanel}<aside><section className="card sticky top-6 p-6"><div className="flex items-center gap-3"><Sparkles className="size-5 text-[var(--violet)]" /><div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold">智能推荐队友</h2><p className="text-xs text-[var(--muted)]">{ownedRecruitment ? recommendations?.policy ?? "正在根据队伍需求生成推荐" : "创建队伍并填写招募需求后生成"}</p></div></div>{!ownedRecruitment ? <div className="mt-5 rounded-2xl border border-dashed border-black/10 p-7 text-center text-xs leading-6 text-[var(--muted)]">推荐不会提前展示。请先补全技能标签和招募要求，系统将据此匹配有参赛意向的同学。</div> : <div className="mt-5 space-y-4">{recommendations && <span className="inline-flex rounded-full bg-[var(--lime)]/55 px-2.5 py-1 text-[10px] font-bold">{recommendations.mode === "ai" ? "AI 匹配" : recommendations.mode === "rules" ? "可解释规则匹配" : "能力画像降级匹配"}</span>}{people.map((person) => <article key={person.id} className="rounded-2xl border border-black/[0.06] p-4"><button type="button" onClick={() => onOpenPerson(person.id)} className="flex w-full items-center gap-3 text-left"><div className="grid size-11 place-items-center rounded-2xl bg-[#ebe8ff] text-sm font-bold text-[var(--violet)]">{person.avatar}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><strong className="text-sm">{person.name}</strong><span className="rounded-full bg-[var(--lime)] px-2 py-0.5 text-[9px] font-bold">{person.match}%</span></div><p className="text-[10px] text-[var(--muted)]">{person.major} · {person.grade}</p></div><UserRound className="size-4 text-[var(--muted)]" /></button><div className="mt-3 flex gap-2"><BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-[var(--violet)]" /><p className="text-xs leading-5 text-[var(--muted)]">{person.reason}</p></div></article>)}{recommendations && people.length === 0 && <div className="rounded-2xl border border-dashed border-black/10 p-7 text-center text-xs leading-6 text-[var(--muted)]">当前暂无可推荐同学，等待意向池或能力资料更新。</div>}</div>}{profileLoading && <p className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]"><LoaderCircle className="size-3.5 animate-spin" /> 加载用户主页</p>}</section></aside></div>;
}

function PersonDialog({ person, onClose, onInvite }: { person: PersonProfile; onClose: () => void; onInvite: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-label={`${person.name}的用户主页`} className="card w-full max-w-lg p-6 sm:p-8"><div className="flex items-start justify-between"><div className="flex items-center gap-4"><div className="grid size-16 place-items-center rounded-3xl bg-[#ebe8ff] text-xl font-bold text-[var(--violet)]">{person.avatar}</div><div><p className="text-xs text-[var(--violet)]">用户主页</p><h2 className="mt-1 text-2xl font-bold">{person.name}</h2><p className="text-xs text-[var(--muted)]">{person.major} · {person.grade}</p></div></div><button onClick={onClose} aria-label="关闭用户主页" className="rounded-xl p-2 hover:bg-black/5"><X className="size-5" /></button></div><p className="mt-6 text-sm leading-7 text-[var(--muted)]">{person.bio}</p><div className="mt-5 grid gap-3 rounded-2xl bg-[var(--paper)] p-4 text-xs sm:grid-cols-2"><p><strong>联系方式</strong><br />{person.contact}</p><p><strong>可投入时间</strong><br />{person.availability}</p></div><div className="mt-5 flex flex-wrap gap-2">{person.tags.map((tag) => <span key={tag} className="rounded-full bg-[#ebe8ff] px-3 py-1.5 text-xs font-semibold text-[var(--violet)]">{tag}</span>)}</div><div className="mt-6 grid grid-cols-2 gap-2"><Link href={`/people/${person.id}`} className="flex items-center justify-center rounded-2xl border border-black/10 px-4 py-3 text-xs font-bold">打开完整主页</Link><button onClick={onInvite} className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-4 py-3 text-xs font-bold text-white"><MailPlus className="size-4 text-[var(--lime)]" /> 发送邀请</button></div></section></div>;
}

function MemberLinks({ members }: { members: TeamMemberSummary[] }) {
  return <span className="inline-flex flex-wrap gap-x-2 gap-y-1">{members.map((member) => <span key={member.userId} className="group relative"><Link href={`/people/${member.userId}`} className="font-semibold text-[var(--violet)] underline decoration-[var(--violet)]/25 underline-offset-2">{member.name}</Link><span className="pointer-events-none invisible absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-2xl bg-[var(--ink)] p-3 text-left text-white opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"><strong className="block text-xs">{member.name}</strong><span className="mt-1 block text-[10px] text-white/60">{member.major} · {member.grade}</span><span className="mt-2 flex flex-wrap gap-1">{member.skills.length ? member.skills.slice(0, 4).map((skill) => <span key={skill} className="rounded-full bg-white/10 px-2 py-0.5 text-[9px]">{skill}</span>) : <span className="text-[9px] text-white/50">技能标签待补充</span>}</span></span></span>)}</span>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-bold text-[var(--muted)]">{label}</p><p className="mt-2 font-semibold">{value}</p></div>; }
function Input({ name, label, placeholder, type = "text", required = false, min, max }: { name: string; label: string; placeholder: string; type?: string; required?: boolean; min?: string; max?: string }) { return <label><span className="mb-2 block text-xs font-bold">{label}</span><input name={name} required={required} type={type} min={min} max={max} placeholder={placeholder} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>; }
