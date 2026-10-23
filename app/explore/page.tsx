import type { Metadata } from "next";
import { ExploreScreen } from "@/components/explore-screen";
import { generateDiscoveryBox } from "@/lib/ai";

export const metadata: Metadata = { title: "探索 · DUT Link" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  // 每次进入随机开一篇跨域灵感，首次渲染由服务端决定，避免水合不一致
  const { discovery: initialDiscovery } = await generateDiscoveryBox(null);
  return (
    <ExploreScreen
      initialView={params.view === "winning-work" ? "winning-work" : "inspiration"}
      initialDiscovery={initialDiscovery}
    />
  );
}
