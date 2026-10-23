import type { Metadata } from "next";
import { OpportunityDetail } from "@/components/opportunity-detail";

export const metadata: Metadata = { title: "比赛文档 · DUT Link" };

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OpportunityDetail opportunityId={id} mode="overview" />;
}
