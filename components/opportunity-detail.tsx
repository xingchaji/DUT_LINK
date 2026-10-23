"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  ExternalLink,
  LoaderCircle,
  MailPlus,
  Send,
  Sparkles,
  Trash2,
  Trophy,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TagEditor } from "@/components/tag-editor";
import { Magnetic } from "@/components/motion/magnetic";
import { CountUp, Meter } from "@/components/motion/metric";
import { Reveal } from "@/components/motion/reveal";
import type { Opportunity, PersonMatch, PersonProfile, RecruitmentPost, TeamMemberSummary } from "@/lib/types";

type DetailData = {
  opportunity: Opportunity;
  recruitments: RecruitmentPost[];
  ownedRecruitment: RecruitmentPost | null;
};

type RecommendationData = { people: PersonMatch[]; mode: "ai" | "rules" | "profile-fallback"; policy: string };

const VERIFICATION: Record<string, { text: string; tone: "ok" | "warn" | "bad" }> = {
  official: { text: "官方来源已核验", tone: "ok" },
  "campus-verified": { text: "校内来源已核验", tone: "ok" },
  pending: { text: "校内发布 · 待核验", tone: "warn" },
  rejected: { text: "核验未通过", tone: "bad" },
};

function verificationOf(opportunity: Opportunity) {
  return VERIFICATION[opportunity.verification ?? "pending"] ?? VERIFICATION.pending;
}

function statusClass(tone: "ok" | "warn" | "bad") {
  if (tone === "ok") return "status status-ok";
  if (tone === "warn") return "status status-warn";
  return "status status-bad";
}

function fillRatio(current: number, capacity: number) {
  if (!capacity) return 0;
  return Math.min(100, Math.round((current / capacity) * 100));
}

export function OpportunityDetail({ opportunityId, mode }: { opportunityId: string; mode: "overview" | "recruit" | "teams" }) {
  const [data, setData] = useState<DetailData | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null);
  const [inviteNotice, setInviteNotice] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [intended, setIntended] = useState(false);
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notice) return;
    noticeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [notice]);

  const load = useCallback(async () => {
    const response = await fetch(`/api/opportunities/${opportunityId}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) { setError(payload.message ?? "比赛不存在"); return; }
    setData(payload);
    const interestResponse = await fetch("/api/opportunity-interests", { cache: "no-store" });
    if (interestResponse.ok) {
      const interestPayload = await interestResponse.json();
      setIntended(((interestPayload.opportunityIds ?? []) as string[]).includes(opportunityId));
    }
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
    setInviteNotice("");
    setProfileLoading(true);
    const response = await fetch(`/api/people/${id}`);
    const payload = await response.json(); setProfileLoading(false);
    if (!response.ok) { setNotice(payload.message); return; }
    setSelectedPerson(payload.person);
  }

  async function invite(person: PersonProfile) {
    if (!data) return;
    setInviteNotice("");
    const response = await fetch("/api/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: person.id, opportunityId: data.opportunity.id }) });
    const payload = await response.json();
    if (!response.ok) { setInviteNotice(payload.message ?? "邀请发送失败"); return; }
    setNotice(`已向 ${person.name} 发送组队邀请`);
    setSelectedPerson(null);
  }

  async function toggleInterest() {
    setNotice("");
    const next = !intended;
    const response = await fetch("/api/opportunity-interests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ opportunityId, intended: next }) });
    const payload = await response.json();
    if (!response.ok) { setNotice(payload.message ?? "标记参赛意向失败"); return; }
    setIntended(Boolean(payload.intended));
    setNotice(next ? "已加入参赛意向，队长推荐队友时会优先筛选你" : "已取消参赛意向");
  }

  if (error) {
    return (
      <div className="page-shell">
        <PageHeader eyebrow="比赛文档" title={error} icon={<Trophy className="size-5" strokeWidth={1.8} />} />
        <div className="mt-8">
          <Link href="/opportunities" className="btn btn-secondary">
            <ArrowLeft className="size-3.5" /> 返回组队中心
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-shell">
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-[13px] text-muted">
          <LoaderCircle className="size-[13px] animate-spin" /> 加载比赛文档
        </div>
      </div>
    );
  }

  const { opportunity, recruitments, ownedRecruitment } = data;
  const header = mode === "recruit"
    ? {
      eyebrow: "队长工作台",
      title: ownedRecruitment ? ownedRecruitment.teamName : "创建队伍并招募",
      lede: ownedRecruitment
        ? "推荐按当前队伍需求生成，你可以继续邀请有参赛意向的同学。"
        : `为「${opportunity.title}」填写项目方向、技能缺口与招募要求，创建队伍后系统才会生成定向推荐。`,
    }
    : mode === "teams"
      ? {
        eyebrow: "寻找队伍",
        title: "正在招募的队伍",
        lede: `「${opportunity.title}」当前有 ${recruitments.length} 支有效招募，只展示尚未截止且仍有名额的队伍。`,
      }
      : {
        eyebrow: "比赛文档",
        title: opportunity.title,
        lede: opportunity.status,
      };
  const icon = mode === "recruit"
    ? <BriefcaseBusiness className="size-5" strokeWidth={1.8} />
    : <Trophy className="size-5" strokeWidth={1.8} />;

  return (
    <div className="page-shell">
      <PageHeader eyebrow={header.eyebrow} title={header.title} lede={header.lede} icon={icon} />

      {notice && (
        <div ref={noticeRef} role="status" className="callout mt-6 scroll-mt-24 items-start">
          <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-moss" strokeWidth={2} />
          <span className="min-w-0">
            {notice}
            {notice.includes("登录") && (
              <Link href={`/login?next=/opportunities/${opportunity.id}/${mode === "teams" ? "teams" : "recruit"}`} className="ml-2 font-medium text-brand underline decoration-brand/30 underline-offset-2">
                去登录
              </Link>
            )}
          </span>
        </div>
      )}

      {mode === "overview" && <OverviewView opportunity={opportunity} recruitments={recruitments} intended={intended} onToggleInterest={toggleInterest} />}
      {mode === "teams" && <TeamsView recruitments={recruitments} opportunity={opportunity} onApply={apply} />}
      {mode === "recruit" && (
        <RecruitView
          key={formVersion}
          opportunity={opportunity}
          recommendations={recommendations}
          ownedRecruitment={ownedRecruitment}
          publishing={publishing}
          profileLoading={profileLoading}
          onPublish={publish}
          onDelete={deleteTeam}
          onOpenPerson={openPerson}
        />
      )}
      {selectedPerson && <PersonDialog person={selectedPerson} inviteNotice={inviteNotice} onClose={() => setSelectedPerson(null)} onInvite={() => invite(selectedPerson)} />}
    </div>
  );
}

/* ---------------- 比赛文档 ---------------- */

function OverviewView({ opportunity, recruitments, intended, onToggleInterest }: { opportunity: Opportunity; recruitments: RecruitmentPost[]; intended: boolean; onToggleInterest: () => void }) {
  const verification = verificationOf(opportunity);
  return (
    <div className="mt-8 grid gap-9 xl:grid-cols-[minmax(0,1fr)_264px] xl:gap-10">
      <div className="min-w-0 space-y-9">
        <Reveal as="section" delay={60}>
          <p className="section-label">Facts</p>
          <div className="sunk mt-2.5 overflow-hidden rounded-[14px] border border-line bg-surface">
            <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-line">
              <dl className="divide-y divide-line">
                <Attr label="类型">{opportunity.type}</Attr>
                <Attr label="主办方">{opportunity.organizer}</Attr>
                <Attr label="范围">{opportunity.scope ?? "全国"}</Attr>
              </dl>
              <dl className="divide-y divide-line border-t border-line sm:border-t-0">
                <Attr label="开始报名">
                  {opportunity.registrationStart ? <span className="num">{opportunity.registrationStart}</span> : <span className="text-faint">待补充</span>}
                </Attr>
                <Attr label="截止报名">
                  {opportunity.registrationEnd ? <span className="num">{opportunity.registrationEnd}</span> : <span className="text-faint">待补充</span>}
                </Attr>
                <Attr label="核验状态">
                  <span className={statusClass(verification.tone)}>{verification.text}</span>
                  <span className="num ml-2 text-[11.5px] text-muted">{opportunity.verifiedAt}</span>
                </Attr>
              </dl>
            </div>
            <div className="flex flex-col gap-1 border-t border-line bg-raise/60 px-4 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <span className="text-[11.5px] text-faint">综测政策</span>
              <span className="text-[12.5px] leading-6 text-ink-soft">{opportunity.bonusPolicy}</span>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" delay={120}>
          <h2 className="section-title">比赛说明</h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-[1.9] text-ink-soft">{opportunity.description}</p>

          {opportunity.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {opportunity.tags.map((tag) => <span key={tag} className="chip chip-outline">{tag}</span>)}
            </div>
          )}

          <dl className="mt-6 divide-y divide-line border-y border-line">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
              <dt className="text-[11.5px] text-faint">来源</dt>
              <dd className="text-[12px] text-muted">{opportunity.sourceName}</dd>
            </div>
            {opportunity.sourceUrl !== "#" && (
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
                <dt className="text-[11.5px] text-faint">原始通知</dt>
                <dd>
                  <a href={opportunity.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline">
                    查看比赛官网与原始通知 <ExternalLink className="size-3" />
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </Reveal>

        <Reveal as="section" delay={180}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-label">Teams</p>
              <h2 className="section-title mt-1.5">参赛队伍</h2>
              <p className="section-desc mt-1">当前 <span className="num">{recruitments.length}</span> 支有效招募，只展示尚未截止且仍有名额的队伍。</p>
            </div>
            <Link href={`/opportunities/${opportunity.id}/teams`} className="btn btn-ghost btn-sm">
              查看全部 <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {recruitments.length > 0 ? (
            <div className="e1 mt-3.5 overflow-hidden rounded-[14px] border border-line bg-surface">
              {recruitments.slice(0, 4).map((post) => <TeamLinkRow key={post.id} post={post} opportunityId={opportunity.id} />)}
            </div>
          ) : (
            <div className="sunk mt-3.5 rounded-[14px] border border-dashed border-line-strong bg-raise/40 px-4 py-9 text-center">
              <p className="text-[12.5px] text-muted">还没有队伍在本场发布招募。</p>
              <Link href={`/opportunities/${opportunity.id}/recruit`} className="btn btn-secondary btn-sm mt-3">我是队长，创建队伍</Link>
            </div>
          )}

          {recruitments.length > 4 && (
            <p className="mt-2 text-[11px] text-faint">另有 <span className="num">{recruitments.length - 4}</span> 支队伍在招募中。</p>
          )}
        </Reveal>
      </div>

      <Reveal as="aside" delay={120} className="min-w-0 xl:sticky xl:top-6 xl:self-start">
        <div className="card e2 p-4 transition-shadow duration-500 hover:shadow-[var(--sh-3),var(--hi)]">
          <p className="section-label">Actions</p>
          <div className="mt-3 space-y-2">
            <Magnetic strength={4} className="w-full">
              <Link href={`/opportunities/${opportunity.id}/recruit`} className="btn btn-primary btn-block">
                我是队长 <ArrowRight className="size-3.5" />
              </Link>
            </Magnetic>
            <Link href={`/opportunities/${opportunity.id}/teams`} className="btn btn-secondary btn-block">
              寻找队伍 <UsersRound className="size-3.5" />
            </Link>
            <button type="button" onClick={onToggleInterest} aria-pressed={intended} className={`btn btn-block pressable ${intended ? "btn-marker" : "btn-secondary"}`}>
              {intended ? "已标记参赛意向" : "标记参赛意向"}
            </button>
          </div>
          <p className="mt-3.5 border-t border-line pt-3 text-[11px] leading-6 text-faint">
            同一场比赛只能加入一支队伍。平台帮助同学组队，不替代学校或主办方的正式报名。
          </p>
        </div>

        <div className="card-sunk mt-4 rounded-[10px] px-3 py-2.5">
          <p className="font-editorial text-[19px] leading-tight text-ink">Facts first, then the team.</p>
          <p className="mt-1.5 text-[11px] leading-6 text-muted">报名时间与核验状态来自来源页；队伍方向与要求由队长填写。</p>
        </div>

        <Link href="/opportunities" className="link-quiet mt-4 inline-flex items-center gap-1.5 text-[11.5px]">
          <ArrowLeft className="size-3" /> 返回组队中心
        </Link>
      </Reveal>
    </div>
  );
}

function Attr({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[68px_minmax(0,1fr)] items-baseline gap-3 px-4 py-2.5">
      <dt className="text-[11.5px] text-faint">{label}</dt>
      <dd className="min-w-0 text-[12.5px] leading-6 text-ink-soft">{children}</dd>
    </div>
  );
}

function TeamLinkRow({ post, opportunityId }: { post: RecruitmentPost; opportunityId: string }) {
  return (
    <Link
      href={`/opportunities/${opportunityId}/teams`}
      className="row-hover group flex items-start gap-3 border-b border-line px-3 py-3.5 transition duration-300 [transition-timing-function:var(--spring)] last:border-b-0 hover:-translate-y-px sm:px-4"
    >
      <span className="glyph mt-0.5 size-8 shrink-0 border-0 bg-tea-soft text-tea">
        <UsersRound className="size-4" strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-[13.5px] font-medium text-ink decoration-line-strong underline-offset-2 group-hover:underline">{post.teamName}</span>
          {post.projectDirection && <span className="chip chip-outline">{post.projectDirection}</span>}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted">
          <span>队长 {post.ownerName}</span>
          <span className="text-line-strong">·</span>
          <span className="num">{post.currentSize}/{post.capacity} 人</span>
          <span className="text-line-strong">·</span>
          <span className="num">截止 {post.recruitmentDeadline}</span>
        </span>
      </span>
      <ArrowUpRight className="mt-1 size-3.5 shrink-0 text-faint transition duration-300 [transition-timing-function:var(--spring)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
    </Link>
  );
}

/* ---------------- 寻找队伍 ---------------- */

function TeamsView({ recruitments, opportunity, onApply }: { recruitments: RecruitmentPost[]; opportunity: Opportunity; onApply: (id: string) => void }) {
  const totalMembers = recruitments.reduce((total, post) => total + post.currentSize, 0);
  const remainingSeats = recruitments.reduce((total, post) => total + Math.max(0, post.capacity - post.currentSize), 0);

  return (
    <div className="mt-8 space-y-8">
      <Reveal as="section" delay={60}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-label">Open seats</p>
            <h2 className="section-title mt-1.5">队伍列表</h2>
            <p className="section-desc mt-1">对照方向、技能缺口和投入时间，选择真正适合你的合作。</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Link href={`/opportunities/${opportunity.id}`} className="btn btn-ghost btn-sm">
              <ArrowLeft className="size-3.5" /> 比赛文档
            </Link>
            <Link href={`/opportunities/${opportunity.id}/recruit`} className="btn btn-secondary btn-sm">我是队长，创建队伍</Link>
          </div>
        </div>

        <dl className="card mt-4 grid grid-cols-3 divide-x divide-line overflow-hidden">
          <Stat value={recruitments.length} label="有效招募" />
          <Stat value={totalMembers} label="在队人数" />
          <Stat value={remainingSeats} label="剩余名额" />
        </dl>

        {recruitments.length > 0 ? (
          <div className="mt-5 space-y-2.5">
            {recruitments.map((post, index) => (
              <TeamRow key={post.id} post={post} index={index} onApply={() => onApply(post.id)} />
            ))}
          </div>
        ) : (
          <div className="sunk mt-5 rounded-[14px] border border-dashed border-line-strong bg-raise/40 px-4 py-10 text-center">
            <p className="text-[12.5px] text-muted">目前没有仍在有效期内的队伍招募。</p>
            <Link href={`/opportunities/${opportunity.id}/recruit`} className="btn btn-secondary btn-sm mt-3">我是队长，创建队伍</Link>
          </div>
        )}
      </Reveal>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="px-4 py-3">
      <dt className="text-[10.5px] text-faint">{label}</dt>
      <dd className="mt-1">
        <CountUp value={value} className="num text-[19px] font-semibold leading-none text-ink" />
      </dd>
    </div>
  );
}

function TeamRow({ post, index, onApply }: { post: RecruitmentPost; index: number; onApply: () => void }) {
  return (
    <article className="card interactive-card group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-3 p-3.5 sm:px-4 lg:grid-cols-[minmax(0,1fr)_104px_92px_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate text-[13.5px] font-medium text-ink decoration-line-strong underline-offset-2 group-hover:underline">{post.teamName}</h3>
          {post.projectDirection && <span className="chip">{post.projectDirection}</span>}
          <span className="text-[11.5px] text-faint">队长 {post.ownerName}</span>
        </div>
        {post.description && <p className="mt-1.5 line-clamp-2 text-[12px] leading-6 text-muted">{post.description}</p>}
        <p className="mt-1.5 line-clamp-3 text-[12px] leading-6 text-ink-soft">{post.requirements}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {post.neededSkills.map((skill) => <span key={skill} className="chip chip-brand">需要 {skill}</span>)}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-faint">
          <span>已有成员</span>
          <MemberLinks members={post.members} />
          <span className="text-line-strong">·</span>
          <span>联系方式 {post.contact}</span>
          {post.expectedAvailability && <><span className="text-line-strong">·</span><span>可用时间 {post.expectedAvailability}</span></>}
        </div>
      </div>

      <div className="shrink-0">
        <p className="num text-[13px] font-medium text-ink">
          {post.currentSize}<span className="text-faint">/{post.capacity}</span>
        </p>
        <div className="mt-1.5 w-16">
          <Meter value={fillRatio(post.currentSize, post.capacity)} height={5} color="var(--color-ink)" delay={index * 80} />
        </div>
        <p className="mt-1.5 text-[10.5px] text-faint"><span className="num">{post.applicants}</span> 人申请</p>
      </div>

      <p className="shrink-0 text-[10.5px] leading-5 text-faint">
        招募截止
        <span className="num mt-0.5 block text-[11.5px] text-muted">{post.recruitmentDeadline}</span>
      </p>

      <button type="button" onClick={onApply} className="btn btn-secondary pressable justify-self-start lg:justify-self-end">
        申请加入 <ArrowRight className="size-3.5" />
      </button>
    </article>
  );
}

/* ---------------- 队长工作台 ---------------- */

function RecruitView({ opportunity, recommendations, ownedRecruitment, publishing, profileLoading, onPublish, onDelete, onOpenPerson }: { opportunity: Opportunity; recommendations: RecommendationData | null; ownedRecruitment: RecruitmentPost | null; publishing: boolean; profileLoading: boolean; onPublish: (event: FormEvent<HTMLFormElement>) => void; onDelete: (id: string) => void; onOpenPerson: (id: string) => void }) {
  const [tags, setTags] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const people = recommendations?.people ?? [];
  const modeLabel = recommendations?.mode === "ai" ? "AI 匹配" : recommendations?.mode === "rules" ? "可解释规则匹配" : "能力画像降级匹配";

  return (
    <div className="mt-8 grid gap-9 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-10">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
          <Link href={`/opportunities/${opportunity.id}`} className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-muted transition hover:bg-raise hover:text-ink">
            <ArrowLeft className="size-3" /> 比赛文档
          </Link>
          <span className="text-line-strong">/</span>
          <span className="px-1.5 py-1 text-faint">队长工作台</span>
        </div>

        {ownedRecruitment ? (
          <Reveal as="section" delay={60} className="card e2 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11.5px] text-faint">我的本场队伍</p>
                <h2 className="section-title mt-1.5 truncate">{ownedRecruitment.teamName}</h2>
                <p className="section-desc mt-1">{ownedRecruitment.projectDirection || "尚未填写项目方向"}</p>
              </div>
              <div className="shrink-0">
                <p className="num text-[15px] font-semibold text-ink">
                  {ownedRecruitment.currentSize}<span className="text-faint">/{ownedRecruitment.capacity}</span>
                </p>
                <div className="mt-1.5 w-20">
                  <Meter value={fillRatio(ownedRecruitment.currentSize, ownedRecruitment.capacity)} height={5} color="var(--color-moss)" />
                </div>
                <p className="mt-1 text-[10.5px] text-faint">队员人数</p>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-line border-y border-line">
              <div className="grid grid-cols-[68px_minmax(0,1fr)] items-baseline gap-3 py-2.5">
                <dt className="text-[11.5px] text-faint">成员名单</dt>
                <dd className="min-w-0 self-baseline"><MemberLinks members={ownedRecruitment.members} /></dd>
              </div>
              <div className="grid grid-cols-[68px_minmax(0,1fr)] items-baseline gap-3 py-2.5">
                <dt className="text-[11.5px] text-faint">招募截止</dt>
                <dd className="num text-[12.5px] text-ink-soft">{ownedRecruitment.recruitmentDeadline}</dd>
              </div>
              <div className="grid grid-cols-[68px_minmax(0,1fr)] items-baseline gap-3 py-2.5">
                <dt className="text-[11.5px] text-faint">联系方式</dt>
                <dd className="break-words text-[12.5px] text-ink-soft">{ownedRecruitment.contact}</dd>
              </div>
              <div className="grid grid-cols-[68px_minmax(0,1fr)] items-baseline gap-3 py-2.5">
                <dt className="text-[11.5px] text-faint">招募要求</dt>
                <dd className="text-[12.5px] leading-6 text-ink-soft">{ownedRecruitment.requirements}</dd>
              </div>
            </dl>

            <p className="mt-4 text-[11.5px] leading-6 text-muted">同一比赛只能创建一支队伍。删除后，本队申请和邀请记录也会清理。</p>

            {confirmDelete ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => onDelete(ownedRecruitment.id)} className="btn border-clay bg-clay text-white">
                  <Trash2 className="size-3.5" /> 确认删除
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="btn btn-secondary">取消</button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="btn btn-secondary mt-4 text-clay">
                <Trash2 className="size-3.5" /> 删除本队伍
              </button>
            )}
          </Reveal>
        ) : (
          <Reveal as="form" onSubmit={onPublish} delay={60} className="max-w-[720px]">
            <h2 className="section-title">创建队伍</h2>
            <p className="section-desc mt-1.5">先填写技能标签和具体招募要求，创建队伍后系统才会生成定向推荐。</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field name="teamName" label="队伍名称 *" placeholder="例如：Link Builders" required />
              <Field name="projectDirection" label="项目方向（选填）" placeholder="例如：AI 校园助手" />
              <Field name="expectedAvailability" label="期望可用时间（选填）" placeholder="例如：周末、工作日晚间" />
              <Field name="contact" label="队长联系方式 *" placeholder="微信、QQ 或校园邮箱" required />
              <TagEditor
                className="min-w-0 sm:col-span-2"
                label="招募技能标签 *"
                tags={tags}
                onChange={setTags}
                inputName="neededSkills"
                placeholder="输入“用户调研”后按回车"
                maxTags={8}
              />
              <Field name="capacity" label="队员上限 *" placeholder="4" type="number" required min="2" max="12" hint="2 至 12 人，包含队长本人。" />
              <Field name="recruitmentDeadline" label="招募截止日期 *" placeholder="" type="date" required />
              <label className="block sm:col-span-2">
                <span className="field-label">队伍介绍（选填）</span>
                <textarea name="description" rows={3} placeholder="当前进度、项目想法和协作方式" className="field" />
              </label>
              <label className="block sm:col-span-2">
                <span className="field-label">招募要求 *</span>
                <textarea name="requirements" required rows={4} minLength={8} placeholder="希望队员具备什么能力、每周投入时间和具体职责" className="field" />
                <span className="field-hint">至少 8 个字，写清能力要求、每周投入与具体职责。</span>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="max-w-[19rem] text-[11px] leading-6 text-faint">同一场比赛只能加入一支队伍，创建后不可与其它队伍并行。</p>
              <div className="flex items-center gap-2.5">
                {tags.length === 0 && (
                  <span role="status" className="text-[11px] text-faint">先添加至少 1 个技能标签</span>
                )}
                <button disabled={publishing || tags.length === 0} className="btn btn-primary pressable px-4">
                  {publishing ? <LoaderCircle className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} 创建队伍并开始招募
                </button>
              </div>
            </div>
          </Reveal>
        )}
      </div>

      <Reveal as="aside" delay={120} className="min-w-0">
        <section className="card e2 p-4 transition-shadow duration-500 hover:shadow-[var(--sh-3),var(--hi)] xl:sticky xl:top-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-brand" strokeWidth={2} />
              <h2 className="section-title text-[14px]">推荐队友</h2>
            </div>
            {recommendations && ownedRecruitment && <span className="chip">{modeLabel}</span>}
          </div>
          <p className="mt-1.5 text-[11px] leading-6 text-faint">
            {ownedRecruitment ? recommendations?.policy ?? "正在根据队伍需求生成推荐" : "创建队伍并填写招募需求后生成"}
          </p>

          {!ownedRecruitment ? (
            <p className="sunk mt-4 rounded-[10px] border border-dashed border-line-strong bg-raise/40 px-3 py-5 text-center text-[11.5px] leading-6 text-muted">
              推荐不会提前展示。请先补全技能标签和招募要求，系统将据此匹配有参赛意向的同学。
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {people.map((person) => (
                <li key={person.id}>
                  <button type="button" onClick={() => onOpenPerson(person.id)} className="row-hover -mx-2 flex w-full items-start gap-2.5 rounded-[8px] px-2 py-2.5 text-left transition duration-300 [transition-timing-function:var(--spring)] hover:-translate-y-px">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-[10.5px] font-semibold text-brand shadow-[0_1px_1px_rgba(60,48,30,0.06),0_3px_7px_-4px_rgba(60,48,30,0.28),inset_0_1px_0_rgba(255,255,255,0.9)]">{person.avatar}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-1.5">
                        <span className="truncate text-[12.5px] font-medium text-ink">{person.name}</span>
                        <span className="num shrink-0 text-[11px] text-muted">{person.match}%</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[10.5px] text-faint">{person.major} · {person.grade}</span>
                      <span className="mt-1 block text-[11px] leading-5 text-muted">{person.reason}</span>
                    </span>
                    <UserRound className="mt-0.5 size-3.5 shrink-0 text-faint" />
                  </button>
                </li>
              ))}
              {recommendations && people.length === 0 && (
                <li className="sunk rounded-[10px] border border-dashed border-line-strong bg-raise/40 px-3 py-5 text-center text-[11.5px] leading-6 text-muted">
                  当前暂无可推荐同学，等待意向池或能力资料更新。
                </li>
              )}
            </ul>
          )}

          {profileLoading && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
              <LoaderCircle className="size-3 animate-spin" /> 加载用户主页
            </p>
          )}
        </section>
      </Reveal>
    </div>
  );
}

function Field({ name, label, placeholder, type = "text", required = false, min, max, hint }: { name: string; label: string; placeholder?: string; type?: string; required?: boolean; min?: string; max?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input name={name} type={type} required={required} min={min} max={max} placeholder={placeholder} className="field" />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

/* ---------------- 用户主页 ---------------- */

function PersonDialog({ person, inviteNotice, onClose, onInvite }: { person: PersonProfile; inviteNotice: string; onClose: () => void; onInvite: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/30 p-4 sm:p-6"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section role="dialog" aria-modal="true" aria-label={`${person.name}的用户主页`} className="card e3 pop w-full max-w-lg p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-[13px] font-semibold text-brand">{person.avatar}</span>
            <div className="min-w-0">
              <p className="text-[11px] text-faint">用户主页</p>
              <h2 className="section-title mt-0.5 truncate">{person.name}</h2>
              <p className="mt-0.5 text-[11.5px] text-muted">{person.major} · {person.grade}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="关闭用户主页" className="grid size-8 shrink-0 place-items-center rounded-[8px] text-faint transition hover:bg-raise hover:text-ink">
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-4 text-[12.5px] leading-7 text-ink-soft">{person.bio}</p>

        <dl className="mt-4 divide-y divide-line border-y border-line">
          <div className="grid grid-cols-[68px_minmax(0,1fr)] items-baseline gap-3 py-2.5">
            <dt className="text-[11.5px] text-faint">联系方式</dt>
            <dd className="text-[12.5px] text-ink-soft">{person.contact}</dd>
          </div>
          <div className="grid grid-cols-[68px_minmax(0,1fr)] items-baseline gap-3 py-2.5">
            <dt className="text-[11.5px] text-faint">可投入时间</dt>
            <dd className="text-[12.5px] text-ink-soft">{person.availability}</dd>
          </div>
        </dl>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {person.tags.map((tag) => <span key={tag} className="chip chip-outline">{tag}</span>)}
        </div>

        {inviteNotice && (
          <p role="alert" className="mt-4 rounded-[10px] bg-clay-soft px-3 py-2 text-[11.5px] leading-6 text-clay">{inviteNotice}</p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link href={`/people/${person.id}`} className="btn btn-secondary">打开完整主页</Link>
          <button onClick={onInvite} className="btn btn-primary">
            <MailPlus className="size-3.5" /> 发送邀请
          </button>
        </div>
      </section>
    </div>
  );
}

function MemberLinks({ members }: { members: TeamMemberSummary[] }) {
  return (
    <span className="inline-flex flex-wrap gap-x-2 gap-y-1">
      {members.map((member) => (
        <span key={member.userId} className="group relative">
          <Link href={`/people/${member.userId}`} className="text-[11.5px] font-medium text-brand underline decoration-brand/25 underline-offset-2 hover:decoration-brand">
            {member.name}
          </Link>
          <span className="pointer-events-none invisible absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-[10px] border border-line bg-surface p-2.5 text-left opacity-0 e2 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            <span className="block text-[11.5px] font-medium text-ink">{member.name}</span>
            <span className="mt-0.5 block text-[10.5px] text-muted">{member.major} · {member.grade}</span>
            <span className="mt-1.5 flex flex-wrap gap-1">
              {member.skills.length
                ? member.skills.slice(0, 4).map((skill) => <span key={skill} className="chip">{skill}</span>)
                : <span className="text-[10.5px] text-faint">技能标签待补充</span>}
            </span>
          </span>
        </span>
      ))}
    </span>
  );
}
