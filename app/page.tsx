import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CircleUserRound,
  Compass,
  GraduationCap,
  Orbit,
  Sparkles,
  Target,
  UserRoundPlus,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SkillBars } from "@/components/skill-bars";
import { CountUp, Meter, Ring } from "@/components/motion/metric";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { demoProfile, matches } from "@/lib/mock-data";
import { rankOpportunities } from "@/lib/opportunity-ranking";
import { getCurrentUser } from "@/lib/auth";
import { getAbilityProfile, getAccountProfile } from "@/lib/repositories/account-repository";
import { listOpportunities } from "@/lib/repositories/opportunity-repository";

const OPPORTUNITY_VISUALS = [
  { icon: Orbit, className: "bg-brand-soft text-brand" },
  { icon: CircleUserRound, className: "bg-tea-soft text-tea" },
  { icon: BookOpen, className: "bg-ochre-soft text-ochre" },
] as const;

const AVATAR_TINTS = ["bg-brand-soft text-brand", "bg-tea-soft text-tea", "bg-ochre-soft text-ochre"];

function getGreeting(hour: number) {
  if (hour < 6) return "深夜好";
  if (hour < 12) return "早上好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function formatToday(date: Date) {
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日 · ${weekdays[date.getDay()]}`;
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
  const opportunities = rankOpportunities(activeProfile, opportunityCatalog).slice(0, 4);
  const strongestSkill = [...activeProfile.skills].sort((a, b) => b.score - a.score)[0];
  const evidenceCount = activeProfile.evidenceCount ?? activeProfile.skills.reduce((total, skill) => total + (skill.evidence?.length ?? 0), 0);
  const profileCompleteness = Math.min(96, 64 + evidenceCount * 4);
  const direction = activeProfile.potentialDirections[0] ?? "跨学科实践";

  const now = new Date();

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="首页"
        title={`${getGreeting(now.getHours())}，${displayName}`}
        lede="这里集中了你的能力证据、正在关注的机会和值得认识的同学。先从一件具体的事开始。"
        icon={<Sparkles className="size-5" strokeWidth={1.8} />}
      >
        <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="size-3.5 text-faint" strokeWidth={1.8} />
            <dt className="text-faint">专业</dt>
            <dd className="font-medium text-ink-soft">{profile?.major ?? user?.major ?? "软件工程"} · {profile?.grade ?? "大一"}</dd>
          </div>
          <span className="h-3 w-px bg-line shadow-[1px_0_0_rgba(255,255,255,0.8)]" />
          <div className="flex items-center gap-1.5">
            <Target className="size-3.5 text-faint" strokeWidth={1.8} />
            <dt className="text-faint">方向</dt>
            <dd className="font-medium text-ink-soft">{activeProfile.potentialDirections.slice(0, 2).join(" · ")}</dd>
          </div>
          <span className="h-3 w-px bg-line shadow-[1px_0_0_rgba(255,255,255,0.8)]" />
          <span className="font-mono text-[11px] text-faint">{formatToday(now)}</span>
        </dl>
      </PageHeader>

      <div className="mt-9 grid gap-10 xl:grid-cols-[minmax(0,1fr)_272px] xl:gap-10">
        <div className="min-w-0 space-y-10">
          {/* 今日洞察：纸张堆叠 + 指针光影 */}
          <TiltCard max={2.6} lift={3}>
            <section className="stack">
              <div
                className="relative overflow-hidden rounded-[18px] border border-note-line bg-note"
                style={{
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.95) inset, 0 2px 4px rgba(60,48,30,0.06), 0 22px 44px -26px rgba(120,92,32,0.42)",
                }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(520px_circle_at_var(--mx,78%)_var(--my,0%),rgba(255,255,255,0.9),rgba(255,255,255,0)_62%)]" />
                <div className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-marker/50 blur-2xl" />

                <div className="relative p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip bg-surface text-ochre">
                      <Sparkles className="size-3" strokeWidth={2.2} /> AI 今日洞察
                    </span>
                    <span className="text-[11px] text-faint">基于你的能力画像与 {opportunityCatalog.length} 个可信机会</span>
                  </div>

                  <h2 className="mt-4 max-w-2xl text-[22px] font-semibold leading-[1.42] tracking-[-0.03em] text-ink sm:text-[26px]">
                    <span className="block sm:inline">把你的技术能力，</span><span className="block sm:inline">连接到更大的问题上。</span>
                  </h2>
                  <p className="mt-3 max-w-2xl text-[13.5px] leading-7 text-muted">
                    {activeProfile.summary} 现在可以从「{direction}」切入，寻找一次真正能落地的合作。
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Magnetic>
                      <Link href="/explore" className="btn btn-primary">
                        拆开今日盲盒 <ArrowRight className="size-3.5" />
                      </Link>
                    </Magnetic>
                    <Magnetic strength={3}>
                      <Link href="/onboarding" className="btn btn-secondary">
                        更新我的经历
                      </Link>
                    </Magnetic>
                    <span className="ml-1 hidden items-center gap-1.5 text-[11px] text-faint sm:inline-flex">
                      <span className="size-1.5 rounded-full bg-moss shadow-[0_0_0_3px_rgba(38,114,79,0.12)]" /> 规则可解释，AI 只做解释
                    </span>
                  </div>
                </div>

                <dl className="relative grid grid-cols-3 divide-x divide-note-line/80 border-t border-note-line/80 bg-white/35">
                  <div className="px-4 py-3.5 transition-colors duration-300 hover:bg-white/55 sm:px-5">
                    <dt className="text-[10.5px] text-faint">最高能力分</dt>
                    <dd className="mt-1 flex items-baseline gap-1.5">
                      <CountUp value={strongestSkill?.score ?? 0} className="num text-[22px] font-semibold leading-none text-ink" />
                      <span className="truncate text-[11px] text-muted">{strongestSkill?.name ?? "等待分析"}</span>
                    </dd>
                  </div>
                  <div className="px-4 py-3.5 transition-colors duration-300 hover:bg-white/55 sm:px-5">
                    <dt className="text-[10.5px] text-faint">画像证据</dt>
                    <dd className="mt-1 flex items-baseline gap-1.5">
                      <CountUp value={evidenceCount} className="num text-[22px] font-semibold leading-none text-ink" />
                      <span className="text-[11px] text-muted">项</span>
                    </dd>
                  </div>
                  <div className="px-4 py-3.5 transition-colors duration-300 hover:bg-white/55 sm:px-5">
                    <dt className="text-[10.5px] text-faint">可信机会</dt>
                    <dd className="mt-1 flex items-baseline gap-1.5">
                      <CountUp value={opportunityCatalog.length} className="num text-[22px] font-semibold leading-none text-ink" />
                      <span className="text-[11px] text-muted">个</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
          </TiltCard>

          {/* 优先关注的机会 */}
          <Reveal as="section" delay={60}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="section-label">Focus now</p>
                <h2 className="section-title mt-1.5 text-[17px]">优先关注的机会</h2>
                <p className="section-desc mt-1">按能力证据、兴趣方向与赛事要求综合排序。</p>
              </div>
              <Link href="/opportunities" className="btn btn-ghost btn-sm">
                查看全部 <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="card mt-3.5 overflow-hidden p-0">
              {opportunities.map((item, index) => {
                const visual = OPPORTUNITY_VISUALS[index % OPPORTUNITY_VISUALS.length] ?? OPPORTUNITY_VISUALS[0];
                const Icon = visual.icon;
                return (
                  <Link
                    key={item.id}
                    href={`/opportunities/${item.id}`}
                    className="row-hover group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-line/70 px-3 py-3.5 last:border-b-0 sm:px-4"
                  >
                    <span className={`glyph size-8 shrink-0 border-0 ${visual.className}`}>
                      <Icon className="size-4" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13.5px] font-medium text-ink decoration-line-strong underline-offset-2 group-hover:underline">{item.title}</span>
                        {item.verification === "official" && <BadgeCheck className="size-3.5 shrink-0 text-moss" strokeWidth={2} />}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted">
                        <span className="chip">{item.type}</span>
                        <span className="truncate">{item.organizer}</span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3" strokeWidth={1.8} /> {item.deadline}
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2.5">
                      <span className="hidden w-16 md:block">
                        <Meter value={item.fit} height={5} color="var(--color-brand)" delay={index * 80} />
                      </span>
                      <span className="chip chip-brand num">{item.fit}%</span>
                      <ArrowUpRight className="hidden size-3.5 text-faint transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink sm:block" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </Reveal>

          {/* 能力画像 + 值得认识的人 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Reveal as="section" delay={80} className="card p-5 transition-shadow duration-500 hover:shadow-[0_2px_6px_-2px_rgba(60,48,30,0.08),0_20px_40px_-20px_rgba(60,48,30,0.28)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="section-label flex items-center gap-1.5">
                    <BrainCircuit className="size-3" strokeWidth={2} /> Ability profile
                  </p>
                  <h2 className="section-title mt-1.5">能力画像</h2>
                </div>
                <Link href="/account" className="text-[11.5px] font-medium text-brand hover:underline">
                  完整画像
                </Link>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-6 text-muted">用真实经历解释你的优势，而不只是一组分数。</p>

              <div className="mt-4">
                <SkillBars skills={activeProfile.skills.slice(0, 4)} />
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-[12px] border border-line/70 bg-raise px-3 py-2.5 shadow-[inset_0_1px_2px_rgba(60,48,30,0.06)]">
                <Ring value={profileCompleteness} size={46} stroke={5} color="var(--color-ink)">
                  <span className="num text-[10.5px] font-semibold text-ink">{profileCompleteness}%</span>
                </Ring>
                <div className="min-w-0">
                  <p className="text-[11.5px] font-medium text-ink-soft">画像完成度</p>
                  <p className="mt-0.5 text-[10.5px] leading-relaxed text-faint">再补充一段团队协作经历，推荐结果会更稳定。</p>
                </div>
              </div>
            </Reveal>

            <Reveal as="section" delay={140} className="card p-5 transition-shadow duration-500 hover:shadow-[0_2px_6px_-2px_rgba(60,48,30,0.08),0_20px_40px_-20px_rgba(60,48,30,0.28)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="section-label flex items-center gap-1.5">
                    <UserRoundPlus className="size-3" strokeWidth={2} /> People to meet
                  </p>
                  <h2 className="section-title mt-1.5">值得认识的人</h2>
                </div>
                <span className="chip chip-tea">互补优先</span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-6 text-muted">不是「和你一样」，而是「与你互补」。</p>

              <div className="mt-2 divide-y divide-line/70">
                {matches.slice(0, 3).map((person, index) => (
                  <Link key={person.id} href={`/people/${person.id}`} className="row-hover group -mx-2 flex items-center gap-3 rounded-[10px] px-2 py-3">
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[11.5px] font-semibold shadow-[0_1px_1px_rgba(60,48,30,0.08),0_3px_8px_-4px_rgba(60,48,30,0.3),inset_0_1px_0_rgba(255,255,255,0.9)] transition duration-500 [transition-timing-function:var(--spring)] group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_14px_-6px_rgba(60,48,30,0.35),inset_0_1px_0_rgba(255,255,255,0.9)] ${AVATAR_TINTS[index % 3]}`}>
                      {person.avatar}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-medium text-ink decoration-line-strong underline-offset-2 group-hover:underline">{person.name}</span>
                        <span className="text-[11px] text-faint">{person.major}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted">{person.reason}</span>
                    </span>
                    <span className="num shrink-0 text-[11px] text-muted">{person.match}%</span>
                  </Link>
                ))}
              </div>

              <Link
                href="/explore"
                className="mt-2 flex items-center justify-between rounded-[11px] border border-line/70 bg-gradient-to-b from-white to-raise px-3 py-2.5 text-[11.5px] font-medium text-muted shadow-[0_1px_1px_rgba(60,48,30,0.04)] transition duration-300 [transition-timing-function:var(--spring)] hover:-translate-y-px hover:text-ink hover:shadow-[0_6px_14px_-8px_rgba(60,48,30,0.3)]"
              >
                从跨域案例认识更多人 <ArrowRight className="size-3.5" />
              </Link>
            </Reveal>
          </div>
        </div>

        {/* 右侧栏 */}
        <aside className="hidden xl:block">
          <div className="sticky top-6 space-y-4">
            <Reveal delay={80} className="card p-4">
              <p className="section-label">继续处理</p>
              <ul className="mt-2.5 divide-y divide-line/70">
                {[
                  { href: "/onboarding", text: "补充一段团队协作证据", tag: "画像" },
                  { href: "/opportunities", text: "查看 3 个匹配的机会", tag: "机会" },
                  { href: "/applications", text: "处理待回复的申请", tag: "协作" },
                ].map((task, index) => (
                  <li key={task.text}>
                    <Link href={task.href} className="row-hover group -mx-2 flex items-center gap-2.5 rounded-[8px] px-2 py-2.5 text-[12px] leading-5 text-ink-soft">
                      <span className="num shrink-0 text-[10px] text-faint">{String(index + 1).padStart(2, "0")}</span>
                      <span className="flex-1 group-hover:text-ink">{task.text}</span>
                      <span className="shrink-0 text-[10px] text-faint">{task.tag}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={140}>
              <div className="card relative overflow-hidden p-4 transition duration-500 [transition-timing-function:var(--spring)] hover:-translate-y-1 hover:rotate-[-0.5deg] hover:shadow-[0_2px_6px_-2px_rgba(60,48,30,0.08),0_24px_44px_-24px_rgba(60,48,30,0.32)]">
                <span className="absolute right-3 top-3 h-5 w-8 rotate-[-6deg] rounded-[2px] bg-marker/70 shadow-[0_1px_2px_rgba(120,92,32,0.18)]" />
                <p className="font-editorial text-[20px] leading-tight text-ink">Make the right connection.</p>
                <p className="mt-2 text-[11.5px] leading-6 text-muted">组队不是找最厉害的人，而是找能力互补、目标一致的人。</p>
                <div className="mt-3 flex items-center gap-2 border-t border-line/70 pt-3 text-[11px] text-faint">
                  <Compass className="size-3.5" strokeWidth={1.8} /> 探索盲盒 · 每日一条跨域灵感
                </div>
              </div>
            </Reveal>

            <Reveal delay={200} className="card p-4">
              <p className="section-label">页面信息</p>
              <dl className="mt-3 space-y-2 text-[11.5px]">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-faint">数据模式</dt>
                  <dd className="chip">内存演示</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-faint">机会来源</dt>
                  <dd className="text-muted">官方核验</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-faint">最后更新</dt>
                  <dd className="num text-muted">{new Date().toISOString().slice(0, 10).replaceAll("-", ".")}</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </aside>
      </div>
    </div>
  );
}
