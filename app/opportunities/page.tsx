import { PageHeader } from "@/components/page-header";
import { OpportunityCenter } from "@/components/opportunity-center";

export default function OpportunitiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <PageHeader eyebrow="Team Center" title="组队中心" />
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">从可信比赛进入组队流程：比赛事实必须带来源，AI 只负责筛选候选人、排序并解释匹配原因。</p>
      <div className="mt-8"><OpportunityCenter /></div>
    </div>
  );
}
