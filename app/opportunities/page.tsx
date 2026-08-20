import { PageHeader } from "@/components/page-header";
import { OpportunityCenter } from "@/components/opportunity-center";

export default function OpportunitiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <PageHeader eyebrow="Opportunity Center" title="机会、组队与报名" />
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">机会信息与招募信息分层管理：官方事实必须带来源，AI 只负责筛选、排序与解释匹配原因。</p>
      <div className="mt-8"><OpportunityCenter /></div>
    </div>
  );
}
