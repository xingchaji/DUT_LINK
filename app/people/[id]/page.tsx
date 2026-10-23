import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3, ExternalLink, GraduationCap, Mail, Target, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { findPublicPersonProfile } from "@/lib/people";
import { listOpportunities } from "@/lib/repositories/opportunity-repository";
import type { Opportunity } from "@/lib/types";

const BREAKDOWN = [
  { key: "complementarity", label: "能力互补" },
  { key: "sharedInterests", label: "共同兴趣" },
  { key: "crossDiscipline", label: "跨专业跨度" },
] as const;

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [person, opportunityCatalog] = await Promise.all([findPublicPersonProfile(id), listOpportunities()]);
  if (!person) notFound();

  const sharedDirections = (person.interestedOpportunityIds ?? [])
    .map((opportunityId) => opportunityCatalog.find((item) => item.id === opportunityId))
    .filter((item): item is Opportunity => Boolean(item));
  const breakdown = person.scoreBreakdown;

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="人物主页"
        title={person.name}
        lede="公开资料页，展示本人愿意公开的联系方式与可投入时间。"
        icon={<UserRound className="size-5" strokeWidth={1.8} />}
      >
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="size-3.5 text-faint" strokeWidth={1.8} />
              <dt className="text-faint">专业</dt>
              <dd className="font-medium text-ink-soft">
                {person.major} · {person.grade}
              </dd>
            </div>
            <span aria-hidden="true" className="h-3 w-px bg-line" />
            <div className="flex items-center gap-1.5">
              <Target className="size-3.5 text-faint" strokeWidth={1.8} />
              <dt className="text-faint">匹配度</dt>
              <dd>
                {person.match > 0 ? (
                  <span className="num font-medium text-ink-soft">{person.match}%</span>
                ) : (
                  <span className="text-faint">暂无数据</span>
                )}
              </dd>
            </div>
          </dl>
          <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-[11.5px] text-muted transition hover:text-ink">
            <ArrowLeft className="size-3.5" strokeWidth={1.9} /> 返回组队中心
          </Link>
        </div>
      </PageHeader>

      <div className="mt-9 grid gap-9 xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-10">
        <div className="min-w-0 space-y-8">
          {/* 画像解读 */}
          <section className="reveal" style={{ ["--i" as string]: 0 }}>
            <p className="section-label">Profile</p>
            <h2 className="section-title mt-1.5">画像解读</h2>
            <p className="mt-2.5 max-w-2xl text-[13.5px] leading-7 text-ink-soft">{person.bio}</p>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="panel px-3.5 py-3">
                <dt className="text-[10.5px] text-faint">当前状态</dt>
                <dd className="mt-1 text-[12.5px] leading-6 text-ink-soft">{person.status}</dd>
              </div>
              <div className="panel px-3.5 py-3">
                <dt className="text-[10.5px] text-faint">推荐理由</dt>
                <dd className="mt-1 text-[12.5px] leading-6 text-ink-soft">{person.reason}</dd>
              </div>
            </dl>
          </section>

          {/* 技能与方向 */}
          <section className="reveal" style={{ ["--i" as string]: 1 }}>
            <p className="section-label">Skills</p>
            <h2 className="section-title mt-1.5">技能与方向</h2>
            {person.tags.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {person.tags.map((tag) => (
                  <li key={tag}>
                    <span className="chip">{tag}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2.5 text-[12px] text-faint">这位同学还没有公开技能标签。</p>
            )}

            {person.portfolio && (
              <a
                href={person.portfolio}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline hover:decoration-line-strong hover:underline-offset-2"
              >
                查看作品链接 <ExternalLink className="size-3.5" strokeWidth={1.9} />
              </a>
            )}
          </section>

          {/* 联系方式与时间安排 */}
          <section className="reveal" style={{ ["--i" as string]: 2 }}>
            <p className="section-label">Contact</p>
            <h2 className="section-title mt-1.5">联系方式与时间安排</h2>

            <dl className="mt-3 divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
              <div className="flex items-start gap-3 px-4 py-3.5">
                <Mail className="mt-0.5 size-3.5 shrink-0 text-faint" strokeWidth={1.8} />
                <dt className="w-24 shrink-0 pt-px text-[11.5px] text-faint">公开联系方式</dt>
                <dd className="min-w-0 flex-1 break-words text-[13px] leading-6 text-ink">{person.contact}</dd>
              </div>
              <div className="flex items-start gap-3 px-4 py-3.5">
                <Clock3 className="mt-0.5 size-3.5 shrink-0 text-faint" strokeWidth={1.8} />
                <dt className="w-24 shrink-0 pt-px text-[11.5px] text-faint">可投入时间</dt>
                <dd className="min-w-0 flex-1 text-[13px] leading-6 text-ink">{person.availability}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="reveal card p-4" style={{ ["--i" as string]: 1 }}>
            <p className="section-label">Complementarity</p>
            <h2 className="mt-1.5 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">互补性拆解</h2>

            {breakdown ? (
              <div className="mt-3 space-y-3">
                {BREAKDOWN.map(({ key, label }) => {
                  const value = breakdown[key];
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between gap-2 text-[11.5px]">
                        <span className="text-muted">{label}</span>
                        <span className="num text-ink-soft">{value}</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-raise">
                        <div className="h-full rounded-full bg-ink/70" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2.5 text-[11.5px] leading-6 text-muted">这位同学还没有公开的匹配拆解。</p>
            )}
          </section>

          <section className="reveal card p-4" style={{ ["--i" as string]: 2 }}>
            <p className="section-label">Shared ground</p>
            <h2 className="mt-1.5 text-[13.5px] font-semibold tracking-[-0.01em] text-ink">共同方向</h2>

            {sharedDirections.length > 0 ? (
              <ul className="mt-2 divide-y divide-line">
                {sharedDirections.map((opportunity) => (
                  <li key={opportunity.id}>
                    <Link href={`/opportunities/${opportunity.id}`} className="row-hover group -mx-2 flex items-start gap-2 rounded-[6px] px-2 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-medium text-ink group-hover:underline">{opportunity.title}</span>
                        <span className="mt-1 block truncate text-[10.5px] text-faint">
                          {opportunity.type}
                          {opportunity.scope ? ` · ${opportunity.scope}` : ""}
                        </span>
                      </span>
                      <ArrowUpRight className="mt-0.5 size-3 shrink-0 text-faint transition group-hover:text-ink" strokeWidth={1.9} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2.5 text-[11.5px] leading-6 text-muted">这位同学暂未公开关注的机会。</p>
            )}
          </section>

          <div className="reveal rounded-[14px] border border-line bg-raise px-4 py-3.5" style={{ ["--i" as string]: 3 }}>
            <p className="font-editorial text-[17px] leading-tight text-ink-soft">Complement, not mirror.</p>
            <p className="mt-1.5 text-[11px] leading-5 text-muted">组队的价值来自差异，而不是相似。</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
