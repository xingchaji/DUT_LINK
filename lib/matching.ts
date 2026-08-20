import { demoProfile, matches } from "@/lib/mock-data";
import type { GeneratedProfile, PersonMatch } from "@/lib/types";

const candidateSignals: Record<string, { skills: string[]; interests: string[]; majorFamily: string }> = {
  "lin-yi": { skills: ["UI 设计", "视觉表达", "用户研究"], interests: ["校园创新", "人工智能", "视觉叙事"], majorFamily: "设计" },
  "zhou-yu": { skills: ["空间设计", "3D 建模", "项目实践"], interests: ["独立游戏", "数字建筑", "人工智能"], majorFamily: "建筑" },
  "chen-xi": { skills: ["游戏开发", "视觉表达", "交互设计"], interests: ["独立游戏", "人工智能", "交互装置"], majorFamily: "数字媒体" },
};

function overlap(a: string[], b: string[]) {
  const normalized = new Set(a.map((item) => item.toLowerCase()));
  return b.filter((item) => normalized.has(item.toLowerCase())).length;
}

export function rankPeople(profile: GeneratedProfile = demoProfile): PersonMatch[] {
  const userSkills = profile.skills.map((skill) => skill.name);
  return matches
    .map((person) => {
      const signals = candidateSignals[person.id];
      const sharedCount = overlap(profile.interests, signals.interests);
      const skillOverlap = overlap(userSkills, signals.skills);
      const complementarity = Math.min(100, 76 + signals.skills.length * 6 - skillOverlap * 5);
      const sharedInterests = Math.min(100, 58 + sharedCount * 18);
      const crossDiscipline = signals.majorFamily === "软件" ? 60 : 96;
      const match = Math.round(complementarity * 0.5 + sharedInterests * 0.3 + crossDiscipline * 0.2);
      return {
        ...person,
        match,
        reason: `技能互补 ${complementarity}% · 兴趣桥接 ${sharedInterests}% · 跨专业价值 ${crossDiscipline}%`,
        scoreBreakdown: { complementarity, sharedInterests, crossDiscipline },
      };
    })
    .sort((a, b) => b.match - a.match);
}
