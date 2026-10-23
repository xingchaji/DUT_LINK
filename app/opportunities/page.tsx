import { Trophy } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { OpportunityCenter } from "@/components/opportunity-center";
import { Reveal } from "@/components/motion/reveal";

export default function OpportunitiesPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="组队中心"
        title="从可信的比赛开始组队"
        lede="每场比赛都带来源与核验状态；AI 只负责筛选候选人、排序并解释匹配原因，不替你决定事实。"
        icon={<Trophy className="size-5" strokeWidth={1.8} />}
      />
      <Reveal delay={60} className="mt-8">
        <OpportunityCenter />
      </Reveal>
    </div>
  );
}
