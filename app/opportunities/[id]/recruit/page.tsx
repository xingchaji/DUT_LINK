import { OpportunityDetail } from "@/components/opportunity-detail";

export default async function RecruitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OpportunityDetail opportunityId={id} mode="recruit" />;
}
