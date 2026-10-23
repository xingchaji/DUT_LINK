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
          <span className="h-3 w-px bg-line" />
          <div className="flex items-center gap-1.5">
            <Target className="size-3.5 text-faint" strokeWidth={1.8} />
            <dt className="text-faint">方向</dt>
            <dd className="font-medium text-ink-soft">{activeProfile.potentialDirections.slice(0, 2).join(" · ")}</dd>
          </div>
          <span className="h-3 w-px bg-line" />
          <span className="font-mono text-[11px] text-faint">{formatToday(now)}</span>
        </dl>
      </PageHeader>

      <div className="mt-9 grid gap-9 xl:grid-cols-[minmax(0,1fr)_272px] xl:gap-10">
        <div className="min-w-0 space-y-9">
          {/* 今日洞察 */}
          <section className="reveal overflow-hidden rounded-[14px] border border-note-line bg-note" style={{ ["--i" as string]: 0 }}>
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip bg-surface text-ochre">
                  <Sparkles className="size-3" strokeWidth={2.2} /> AI 今日洞察
                </span>
                <span className="text-[11px] text-faint">基于你的能力画像与 {opportunityCatalog.length} 个可信机会</span>
              </div>

              <h2 className="mt-4 max-w-2xl text-[22px] font-semibold leading-[1.42] tracking-[-0.03em] text-ink sm:text-[26px]">
                <span className="block sm:inline">把你的技术能力，</span>
                <span className="block sm:inline">连接到更大的问题上。</span>
              </h2>
              <p className="mt-3 max-w-2xl text-[13.5px] leading-7 text-muted">
                {activeProfile.summary} 现在可以从「{direction}」切入，寻找一次真正能落地的合作。
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link href="/explore" className="btn btn-primary">
                  拆开今日盲盒 <ArrowRight className="size-3.5" />
                </Link>
                <Link href="/onboarding" className="btn btn-secondary">
                  更新我的经历
                </Link>
                <span className="ml-1 hidden items-center gap-1.5 text-[11px] text-faint sm:inline-flex">
                  <span className="size-1.5 rounded-full bg-moss" /> 规则可解释，AI 只做解释
                </span>
              </div>
            </div>

            <dl className="grid grid-cols-3 divide-x divide-note-line border-t border-note-line">
              <div className="px-4 py-3.5 sm:px-5">
                <dt className="text-[10.5px] text-faint">最高能力分</dt>
                <dd className="mt-1 flex items-baseline gap-1.5">
                  <span className="num text-[22px] font-semibold leading-none text-ink">{strongestSkill?.score ?? 0}</span>
                  <span className="truncate text-[11px] text-muted">{strongestSkill?.name ?? "等待分析"}</span>
                </dd>
              </div>
              <div className="px-4 py-3.5 sm:px-5">
                <dt className="text-[10.5px] text-faint">画像证据</dt>
                <dd className="mt-1 flex items-baseline gap-1.5">
                  <span className="num text-[22px] font-semibold leading-none text-ink">{evidenceCount}</span>
                  <span className="text-[11px] text-muted">项</span>
                </dd>
              </div>
              <div className="px-4 py-3.5 sm:px-5">
                <dt className="text-[10.5px] text-faint">可信机会</dt>
                <dd className="mt-1 flex items-baseline gap-1.5">
                  <span className="num text-[22px] font-semibold leading-none text-ink">{opportunityCatalog.length}</span>
                  <span className="text-[11px] text-muted">个</span>
                </dd>
              </div>
            </dl>
          </section>

          {/* 优先关注的机会 */}
          <section className="reveal" style={{ ["--i" as string]: 1 }}>
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

            <div className="mt-3.5 overflow-hidden rounded-[14px] border border-line bg-surface">
              {opportunities.map((item, index) => {
                const visual = OPPORTUNITY_VISUALS[index % OPPORTUNITY_VISUALS.length] ?? OPPORTUNITY_VISUALS[0];
                const Icon = visual.icon;
                return (
                  <Link
                    key={item.id}
                    href={`/opportunities/${item.id}`}
                    className="row-hover group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-line px-3 py-3.5 last:border-b-0 sm:px-4"
                  >
                    <span className={`grid size-8 shrink-0 place-items-center rounded-[8px] ${visual.className}`}>
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
                      <span className="hidden h-1 w-16 overflow-hidden rounded-full bg-raise md:block">
                        <span className="block h-full rounded-full bg-brand/70" style={{ width: `${item.fit}%` }} />
                      </span>
                      <span className="chip chip-brand num">{item.fit}%</span>
                      <ArrowUpRight className="hidden size-3.5 text-faint transition group-hover:text-ink sm:block" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* 能力画像 + 值得认识的人 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="reveal card p-5" style={{ ["--i" as string]: 2 }}>
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

              <div className="mt-4 rounded-[10px] border border-line bg-raise px-3 py-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-ink-soft">画像完成度</span>
                  <span className="num text-muted">{profileCompleteness}%</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-sink">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${profileCompleteness}%` }} />
                </div>
                <p className="mt-2 text-[10.5px] leading-relaxed text-faint">再补充一段团队协作经历，推荐结果会更稳定。</p>
              </div>
            </section>

            <section className="reveal card p-5" style={{ ["--i" as string]: 3 }}>
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

              <div className="mt-2 divide-y divide-line">
                {matches.slice(0, 3).map((person, index) => (
                  <Link key={person.id} href={`/people/${person.id}`} className="row-hover group -mx-2 flex items-center gap-3 rounded-md px-2 py-3">
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[11.5px] font-semibold ${index === 0 ? "bg-brand-soft text-brand" : index === 1 ? "bg-tea-soft text-tea" : "bg-ochre-soft text-ochre"}`}>
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

              <Link href="/explore" className="mt-2 flex items-center justify-between rounded-[10px] border border-line bg-surface px-3 py-2.5 text-[11.5px] font-medium text-muted transition hover:border-line-strong hover:text-ink">
                从跨域案例认识更多人 <ArrowRight className="size-3.5" />
              </Link>
            </section>
          </div>
        </div>

        {/* 右侧栏 */}
        <aside className="reveal hidden xl:block" style={{ ["--i" as string]: 1 }}>
          <div className="sticky top-6 space-y-4">
            <div className="card p-4">
              <p className="section-label">继续处理</p>
              <ul className="mt-2.5 divide-y divide-line">
                {[
                  { href: "/onboarding", text: "补充一段团队协作证据", tag: "画像" },
                  { href: "/opportunities", text: "查看 3 个匹配的机会", tag: "机会" },
                  { href: "/applications", text: "处理待回复的申请", tag: "协作" },
                ].map((task, index) => (
                  <li key={task.text}>
                    <Link href={task.href} className="row-hover group -mx-2 flex items-center gap-2.5 rounded-md px-2 py-2.5 text-[12px] leading-5 text-ink-soft">
                      <span className="num shrink-0 text-[10px] text-faint">{String(index + 1).padStart(2, "0")}</span>
                      <span className="flex-1 group-hover:text-ink">{task.text}</span>
                      <span className="shrink-0 text-[10px] text-faint">{task.tag}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-4">
              <p className="font-editorial text-[20px] leading-tight text-ink">Make the right connection.</p>
              <p className="mt-2 text-[11.5px] leading-6 text-muted">组队不是找最厉害的人，而是找能力互补、目标一致的人。</p>
              <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-[11px] text-faint">
                <Compass className="size-3.5" strokeWidth={1.8} /> 探索盲盒 · 每日一条跨域灵感
              </div>
            </div>

            <div className="card p-4">
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
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
