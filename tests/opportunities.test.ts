import { describe, expect, it } from "vitest";
import { opportunities } from "@/lib/mock-data";

describe("official opportunity catalog", () => {
  it("covers multiple disciplines with unique official sources", () => {
    expect(opportunities.length).toBeGreaterThanOrEqual(10);
    expect(new Set(opportunities.map((item) => item.id)).size).toBe(opportunities.length);
    expect(new Set(opportunities.flatMap((item) => item.tags)).size).toBeGreaterThanOrEqual(20);
    for (const opportunity of opportunities) {
      expect(opportunity.verification).toBe("official");
      expect(opportunity.sourceUrl.startsWith("https://")).toBe(true);
      expect(opportunity.description.length).toBeGreaterThan(25);
    }
  });

  it("keeps researched 2026 competitions in the catalog", () => {
    expect(opportunities.map((item) => item.id)).toEqual(expect.arrayContaining([
      "cumcm-2026",
      "nuedc-2026",
      "c4-network-2026",
      "service-outsourcing-2026",
      "umic-2026",
      "smart-car-2026",
      "sun-ada-2026",
    ]));
  });
});
