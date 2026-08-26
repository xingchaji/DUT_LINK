import { describe, expect, it } from "vitest";
import { rankWinningWorkEvidence, toCuratedWinningWork, winningWorkEvidenceCatalog } from "@/lib/winning-works";

describe("winning work evidence catalog", () => {
  it("keeps unique works backed by official https sources", () => {
    expect(new Set(winningWorkEvidenceCatalog.map((item) => item.id)).size).toBe(winningWorkEvidenceCatalog.length);
    expect(winningWorkEvidenceCatalog.length).toBeGreaterThanOrEqual(3);
    for (const item of winningWorkEvidenceCatalog) {
      expect(item.source.url.startsWith("https://")).toBe(true);
      expect(item.evidence.length).toBeGreaterThan(30);
      expect(item.fallbackDomains.length).toBeGreaterThanOrEqual(3);
      expect(item.fallbackSections.length).toBeGreaterThanOrEqual(5);
      expect(item.fallbackSections.reduce((total, section) => total + section.body.length, 0)).toBeGreaterThan(500);
    }
  });

  it("preserves verified facts when producing a curated fallback", () => {
    const evidence = winningWorkEvidenceCatalog[0];
    const insight = toCuratedWinningWork(evidence, { major: "软件工程" });
    expect(insight.workTitle).toBe(evidence.workTitle);
    expect(insight.award).toBe(evidence.award);
    expect(insight.source.url).toBe(evidence.source.url);
    expect(insight.recommendedFor).toBe("软件工程");
    expect(insight.mode).toBe("curated");
    expect(insight.articleSections.length).toBeGreaterThanOrEqual(5);
    expect(insight.knowledgeDomains.every((item) => item.integration.length > 20)).toBe(true);
  });

  it("ranks works by the reader's major and ability signals", () => {
    expect(rankWinningWorkEvidence(winningWorkEvidenceCatalog, { major: "软件工程", interests: ["人工智能"] })[0].id).toBe("ccdc-2021-smart-logistics");
    expect(rankWinningWorkEvidence(winningWorkEvidenceCatalog, { major: "建筑学" })[0].id).toBe("ccdc-2019-ar-cultural-tools");
  });
});
