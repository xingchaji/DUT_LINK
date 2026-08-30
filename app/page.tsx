import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Orbit,
  Sparkles,
  Target,
  UserRoundPlus,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SkillBars } from "@/components/skill-bars";
import { demoProfile, matches } from "@/lib/mock-data";
import { rankOpportunities } from "@/lib/opportunity-ranking";
import { getCurrentUser } from "@/lib/auth";
import { getAbilityProfile, getAccountProfile } from "@/lib/repositories/account-repository";
import { listOpportunities } from "@/lib/repositories/opportunity-repository";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const OPPORTUNITY_VISUALS = [
  { icon: Orbit, className: "bg-[#eeebff] text-[var(--violet)]", accent: "bg-[var(--violet)]" },
  { icon: CircleUserRound, className: "bg-[#e3f5f2] text-[#238983]", accent: "bg-[var(--cyan)]" },
  { icon: BookOpen, className: "bg-[#fff2e3] text-[#bd792a]", accent: "bg-[var(--amber)]" },
] as const;

function getGreeting(hour: number) {
  if (hour < 6) return "深夜好";
  if (hour < 12) return "早上好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const [profile, abilityProfile, opportunityCatalog] = await Promise.all([
    user ? getAccountProfile(user) : Promise.resolve(null),
    user ? getAbilityProfile(user.id) : Promise.resolve(null),
    listOpportunities(),
  ]);
  const displayName = profile?.nickname ?? user?.name ?? "同学";
  const activeProfile = abilityProfile ?? demoProfile;
  const opportunities = rankOpportunities(activeProfile, opportunityCatalog).slice(0, 3);
  const strongestSkill = [...activeProfile.skills].sort((a, b) => b.score - a.score)[0];
  const evidenceCount = activeProfile.evidenceCount ?? activeProfile.skills.reduce((total, skill) => total + (skill.evidence?.length ?? 0), 0);
  const profileCompleteness = Math.min(96, 64 + evidenceCount * 4);

  const now = new Date();
  const eyebrow = `${WEEKDAYS[now.getDay()]} · ${now.getDate()} ${MONTHS[now.getMonth()]}`;
  const title = `${getGreeting(now.getHours())}，${displayName}`;

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9 xl:px-12">
      <PageHeader eyebrow={eyebrow} title={title} />

      <section className="dot-grid relative mt-8 overflow-hidden rounded-[32px] bg-[var(--ink)] text-white shadow-[0_30px_80px_rgba(23,32,51,0.18)]">
        <div className="absolute -right-24 -top-32 size-80 rounded-full bg-[var(--violet)]/75 blur-3xl" />
        <div className="absolute -bottom-28 left-[38%] size-64 rounded-full bg-[var(--cyan)]/30 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1.35fr_0.65fr]">
          <div className="px-6 py-8 sm:px-9 sm:py-10 xl:px-11 xl:py-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/85 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-[var(--lime)]" /> AI 今日洞察
            </span>
            <h2 className="mt-6 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-extrabold leading-[1.12] tracking-[-0.045em] sm:text-5xl xl:text-[3.4rem]">
              把你的技术能力，<br className="hidden sm:block" />连接到更大的问题。
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/64 sm:text-[15px]">
              {activeProfile.summary} 现在可以从「{activeProfile.potentialDirections[0] ?? "跨学科实践"}」切入，寻找一次真正能落地的合作。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/explore" className="inline-flex items-center gap-2 rounded-full bg-[var(--lime)] px-5 py-3 text-sm font-bold text-[var(--ink)] shadow-[0_12px_30px_rgba(223,242,104,0.2)] transition hover:-translate-y-0.5 hover:gap-3">
                拆开今日盲盒 <ArrowRight className="size-4" />
              </Link>
              <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14">
                更新我的经历
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-white/[0.055] p-5 backdrop-blur-md sm:p-7 lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/42">Ability signal</p><p className="mt-2 text-sm font-semibold">你的优势信号</p></div>
              <BrainCircuit className="size-5 text-[var(--lime)]" />
            </div>
            <div className="mt-8 flex items-end gap-3">
              <span className="font-[family-name:var(--font-display)] text-6xl font-extrabold tracking-[-0.06em]">{strongestSkill?.score ?? 0}</span>
              <div className="pb-1.5"><p className="text-xs text-white/45">最高能力分</p><p className="mt-1 text-sm font-bold">{strongestSkill?.name ?? "等待分析"}</p></div>
            </div>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[var(--lime)]" style={{ width: `${strongestSkill?.score ?? 0}%` }} /></div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/8 bg-black/10 p-4"><p className="text-2xl font-bold">{evidenceCount}</p><p className="mt-1 text-[11px] text-white/45">项画像证据</p></div>
              <div className="rounded-2xl border border-white/8 bg-black/10 p-4"><p className="text-2xl font-bold">{opportunityCatalog.length}</p><p className="mt-1 text-[11px] text-white/45">个可信机会</p></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {activeProfile.potentialDirections.slice(0, 3).map((direction) => <span key={direction} className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] text-white/60">{direction}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--violet)]"><Target className="size-3.5" /> Focus now</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.04em]">优先关注的机会</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">根据你的能力证据、兴趣方向与赛事要求综合排序。</p>
          </div>
          <Link href="/opportunities" className="inline-flex w-fit items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 py-2.5 text-xs font-bold shadow-sm transition hover:border-[var(--violet)]/30 hover:text-[var(--violet)]">查看全部机会 <ArrowUpRight className="size-3.5" /></Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {opportunities.map((item, index) => {
            const visual = OPPORTUNITY_VISUALS[index % OPPORTUNITY_VISUALS.length] ?? OPPORTUNITY_VISUALS[0];
            const Icon = visual.icon;
            return (
              <Link key={item.id} href={`/opportunities/${item.id}`} className="card interactive-card group flex min-h-[300px] flex-col overflow-hidden p-5 sm:p-6">
                <div className={`-mx-6 -mt-6 mb-5 h-1 ${visual.accent}`} />
                <div className="flex items-center justify-between">
                  <div className={`grid size-11 place-items-center rounded-2xl ${visual.className}`}><Icon className="size-5" /></div>
                  <div className="text-right"><span className="font-[family-name:var(--font-mono)] text-lg font-bold text-[var(--violet)]">{item.fit}%</span><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Match</p></div>
                </div>
                <div className="mt-5 flex items-center gap-2 text-[10px] font-bold text-[var(--muted)]"><span className="rounded-full bg-black/[0.04] px-2.5 py-1">{item.type}</span>{item.verification === "official" && <span className="inline-flex items-center gap-1 text-[#27857f]"><BadgeCheck className="size-3.5" /> 官方来源</span>}</div>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-extrabold leading-snug tracking-[-0.025em]">{item.title}</h3>
                <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{item.matchReasons?.[0] ?? item.description}</p>
                <div className="mt-auto flex items-center justify-between border-t border-black/[0.06] pt-4">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--muted)]"><CalendarDays className="size-3.5" /> {item.deadline}</span>
                  <span className="grid size-8 place-items-center rounded-full bg-[var(--ink)] text-white transition group-hover:rotate-45"><ArrowUpRight className="size-3.5" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="card overflow-hidden p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Ability profile</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.035em]">能力画像</h2><p className="mt-2 text-xs leading-5 text-[var(--muted)]">用真实经历解释你的优势，而不只是一组分数。</p></div>
            <Link href="/account" className="flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--violet)]">完整画像 <ChevronRight className="size-4" /></Link>
          </div>
          <div className="mt-7 grid gap-7 sm:grid-cols-[1fr_0.72fr] sm:items-center">
            <SkillBars skills={activeProfile.skills.slice(0, 4)} />
            <div className="soft-grid relative overflow-hidden rounded-[24px] bg-[var(--ink)] p-5 text-white">
              <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Profile ready</span><BadgeCheck className="size-4 text-[var(--lime)]" /></div>
              <p className="mt-6 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-[-0.05em]">{profileCompleteness}<span className="text-lg text-white/35">%</span></p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[var(--lime)]" style={{ width: `${profileCompleteness}%` }} /></div>
              <p className="mt-4 text-[11px] leading-5 text-white/50">再补充一段团队协作经历，推荐结果会更稳定。</p>
            </div>
          </div>
        </section>

        <section className="card p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cyan)]">People to meet</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.035em]">值得认识的人</h2><p className="mt-2 text-xs text-[var(--muted)]">不是“和你一样”，而是“与你互补”。</p></div>
            <UserRoundPlus className="size-5 text-[var(--cyan)]" />
          </div>
          <div className="mt-5 divide-y divide-black/[0.06]">
            {matches.slice(0, 3).map((person, index) => (
              <Link href={`/people/${person.id}`} key={person.id} className="group flex items-center gap-4 py-4 first:pt-1">
                <div className={`grid size-11 shrink-0 place-items-center rounded-2xl text-sm font-bold ${index === 0 ? "bg-[#eeebff] text-[var(--violet)]" : index === 1 ? "bg-[#e3f5f2] text-[#238983]" : "bg-[#fff2e3] text-[#c1762e]"}`}>{person.avatar}</div>
                <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-bold">{person.name}</p><span className="rounded-full bg-[var(--lime)]/70 px-2 py-0.5 text-[10px] font-bold">{person.match}%</span></div><p className="mt-1 truncate text-xs text-[var(--muted)]">{person.major} · {person.reason}</p></div>
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-black/[0.08] text-[var(--muted)] transition group-hover:border-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-white"><ArrowRight className="size-3.5" /></span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-5 flex flex-col gap-4 overflow-hidden rounded-[24px] border border-[var(--violet)]/10 bg-[var(--violet)]/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-4"><div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-[var(--violet)] shadow-sm"><Clock3 className="size-5" /></div><div><p className="font-bold">还没有想好参加什么？</p><p className="mt-1 text-xs text-[var(--muted)]">从一个跨领域案例开始，看看别人的知识是怎样真正组合起来的。</p></div></div>
        <Link href="/explore" className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-[var(--violet)]">去探索盲盒 <ArrowRight className="size-4" /></Link>
      </section>
    </div>
  );
}
