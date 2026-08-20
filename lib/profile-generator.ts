import type { GeneratedProfile, ProfileInput, Skill } from "@/lib/types";

type Rule = {
  keywords: string[];
  skill: string;
  category: Skill["category"];
  direction: string;
};

const rules: Rule[] = [
  { keywords: ["c++", "java", "后端", "编程", "软件"], skill: "软件开发", category: "技术", direction: "AI 应用开发" },
  { keywords: ["python", "数据", "机器学习", "ai"], skill: "数据与 AI", category: "技术", direction: "智能产品设计" },
  { keywords: ["unity", "easyx", "游戏"], skill: "游戏开发", category: "创意", direction: "游戏工具开发" },
  { keywords: ["视觉设计", "ui", "摄影", "绘画", "插画"], skill: "视觉表达", category: "创意", direction: "人机交互" },
  { keywords: ["社团", "队长", "团队", "组织"], skill: "团队协作", category: "协作", direction: "技术社区运营" },
  { keywords: ["竞赛", "比赛", "挑战杯", "大创"], skill: "项目实践", category: "探索", direction: "创新创业项目" },
];

export function generateProfile(input: ProfileInput): GeneratedProfile {
  const corpus = `${input.major} ${input.bio} ${input.experiences} ${input.interests} ${input.awards} ${input.achievements} ${input.githubRepos}`.toLowerCase();
  const detected = rules.filter((rule) => rule.keywords.some((keyword) => corpus.includes(keyword)));
  const selected = detected.length > 0 ? detected : [rules[0], rules[4]];

  const evidenceSources = [input.experiences, input.awards, input.achievements, input.githubRepos].filter(Boolean);
  const skills = selected.slice(0, 4).map((rule, index) => {
    const evidence = evidenceSources.filter((source) => rule.keywords.some((keyword) => source.toLowerCase().includes(keyword))).slice(0, 3);
    return {
      name: rule.skill,
      category: rule.category,
      score: Math.min(92, 60 + index * 4 + evidence.length * 8 + rule.keywords.filter((keyword) => corpus.includes(keyword)).length * 4),
      confidence: Math.min(95, 48 + evidence.length * 14 + (input.awards ? 8 : 0) + (input.githubRepos ? 8 : 0)),
      evidence: evidence.length ? evidence : ["目前证据较少，建议补充项目成果或仓库"],
    };
  });

  const interests = input.interests
    .split(/[，,、\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);

  return {
    summary: `${input.major || "跨学科"}背景的行动型探索者，已经展现出${skills.map((skill) => skill.name).join("、")}方面的潜力。`,
    skills,
    interests: interests.length ? interests : ["校园创新", "跨学科合作"],
    potentialDirections: [...new Set(selected.map((rule) => rule.direction))].slice(0, 3),
    analysisMode: "rules",
    evidenceCount: evidenceSources.length,
  };
}
