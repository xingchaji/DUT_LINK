import { PageHeader } from "@/components/page-header";
import { OpportunityCenter } from "@/components/opportunity-center";

export default function OpportunitiesPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9 xl:px-12">
      <PageHeader eyebrow="Team Center" title="组队中心" />
      <div className="mt-4 flex max-w-4xl items-start gap-3 text-sm leading-7 text-[var(--muted)]"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-[var(--cyan)]" /><p>从可信比赛进入组队流程。比赛事实必须带来源，AI 只负责筛选候选人、排序并解释匹配原因。</p></div>
      <div className="mt-7"><OpportunityCenter /></div>
    </div>
  );
}
