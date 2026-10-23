import type { Metadata } from "next";
import { OpportunityDetail } from "@/components/opportunity-detail";

export const metadata: Metadata = { title: "正在招募的队伍 · DUT Link" };

export default async function TeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OpportunityDetail opportunityId={id} mode="teams" />;
}
