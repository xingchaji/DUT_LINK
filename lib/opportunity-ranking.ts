import { demoProfile, opportunities } from "@/lib/mock-data";
import type { GeneratedProfile, Opportunity } from "@/lib/types";

function related(signal: string, target: string) {
  const a = signal.toLowerCase();
  const b = target.toLowerCase();
  return a.includes(b) || b.includes(a) || (a.includes("软件") && b.includes("开发")) || (a.includes("游戏") && b.includes("交互")) || (a.includes("ai") && b.includes("人工智能"));
}

export function rankOpportunities(profile: GeneratedProfile = demoProfile, catalog: Opportunity[] = opportunities): Opportunity[] {
  const signals = [...profile.skills.map((item) => item.name), ...profile.interests, ...profile.potentialDirections];
  return catalog
    .map((opportunity) => {
      const matches = opportunity.tags.filter((tag) => signals.some((signal) => related(signal, tag)));
      const evidenceQuality = profile.skills.reduce((total, skill) => total + (skill.confidence ?? 50), 0) / Math.max(profile.skills.length, 1);
      const fit = Math.round(Math.min(98, 62 + matches.length * 9 + evidenceQuality * 0.12));
      return {
        ...opportunity,
        fit,
        matchReasons: matches.length ? matches.map((item) => `画像证据与「${item}」相关`) : ["具备跨领域探索价值，建议查看具体要求"],
      };
    })
    .sort((a, b) => b.fit - a.fit);
}

export function sortOpportunitiesByRegistration(catalog: Opportunity[]) {
  return [...catalog].sort((a, b) => {
    if (!a.registrationStart && !b.registrationStart) return a.title.localeCompare(b.title, "zh-CN");
    if (!a.registrationStart) return 1;
    if (!b.registrationStart) return -1;
    return new Date(a.registrationStart).getTime() - new Date(b.registrationStart).getTime();
  });
}
