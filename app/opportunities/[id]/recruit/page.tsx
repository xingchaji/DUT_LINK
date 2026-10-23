import type { Metadata } from "next";
import { OpportunityDetail } from "@/components/opportunity-detail";

export const metadata: Metadata = { title: "队长工作台 · DUT Link" };

export default async function RecruitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OpportunityDetail opportunityId={id} mode="recruit" />;
}
