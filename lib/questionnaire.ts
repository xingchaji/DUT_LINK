import type { GeneratedProfile, QuestionnaireDimension, QuestionnaireInput, Skill } from "@/lib/types";

export type ProfileQuestion = { id: string; dimension: QuestionnaireDimension; text: string; options: readonly [string, string, string, string, string] };

const ability = ["没有相关经历", "了解基本方法", "能在指导下完成", "能独立完成", "能指导他人或处理复杂情况"] as const;
const frequency = ["从未", "偶尔一次", "完成过 2–3 次", "完成过 4–6 次", "完成过 7 次以上"] as const;

export const profileQuestions: ProfileQuestion[] = [
  { id: "problem_breakdown", dimension: "问题解决", text: "你把比赛题目或目标拆解成具体任务的能力如何？", options: ability },
  { id: "problem_research", dimension: "问题解决", text: "你查找并核验专业资料、政策或案例的能力如何？", options: ability },
  { id: "problem_evidence", dimension: "问题解决", text: "你使用数据、事实或实验结果支持结论的能力如何？", options: ability },
  { id: "problem_tools", dimension: "问题解决", text: "你为完成比赛任务快速学习新工具或方法的能力如何？", options: ability },
  { id: "research_definition", dimension: "调研表达", text: "你识别真实需求并清晰定义核心问题的能力如何？", options: ability },
  { id: "research_fieldwork", dimension: "调研表达", text: "你通过访谈、问卷、观察或田野调查收集信息的能力如何？", options: ability },
  { id: "expression_writing", dimension: "调研表达", text: "你撰写项目书、研究报告或作品说明的能力如何？", options: ability },
  { id: "expression_presentation", dimension: "调研表达", text: "你用答辩、演示或视觉材料清晰表达方案的能力如何？", options: ability },
  { id: "competition_count", dimension: "竞赛经验", text: "你完整参加过多少次校级及以上竞赛？", options: ["0 次", "1 次", "2–3 次", "4–6 次", "7 次以上"] },
  { id: "competition_award", dimension: "竞赛经验", text: "你在竞赛中获得过的最高奖项是？", options: ["暂无奖项", "校级奖项", "省级奖项", "国家级入围或三等奖", "国家级二等奖及以上"] },
  { id: "competition_role", dimension: "竞赛经验", text: "你在竞赛队伍中承担过的最高角色是？", options: ["尚未参赛", "普通成员", "核心模块成员", "模块负责人", "队长或项目负责人"] },
  { id: "competition_defense", dimension: "竞赛经验", text: "你参加过多少次正式路演、答辩或作品评审？", options: frequency },
  { id: "delivery_projects", dimension: "项目交付", text: "你完整交付过多少个可演示的课程或实践项目？", options: ["0 个", "1 个", "2–3 个", "4–6 个", "7 个以上"] },
  { id: "delivery_collaboration", dimension: "项目交付", text: "你完成过多少次多人协作项目？", options: frequency },
  { id: "delivery_artifacts", dimension: "项目交付", text: "你的项目通常能保留哪些可验证成果？", options: ["没有留存", "过程笔记", "完整文档", "可运行作品或公开仓库", "作品、数据指标及完整复盘"] },
  { id: "delivery_time", dimension: "项目交付", text: "竞赛期间你每周通常能稳定投入多少时间？", options: ["少于 2 小时", "2–4 小时", "5–7 小时", "8–12 小时", "12 小时以上"] },
];

export const profileInterestOptions = ["人工智能", "软件开发", "视觉设计", "游戏与交互", "创新创业", "社会调研", "体育运动", "文艺表达", "校园服务", "开源社区"];

const dimensionMeta: Record<QuestionnaireDimension, { category: Skill["category"]; direction: string }> = {
  问题解决: { category: "探索", direction: "分析、求证与问题解决" },
  调研表达: { category: "创意", direction: "调研、写作与方案表达" },
  竞赛经验: { category: "探索", direction: "竞赛策划与答辩" },
  项目交付: { category: "协作", direction: "项目管理与成果交付" },
};

export function generateQuestionnaireProfile(input: QuestionnaireInput): GeneratedProfile {
  const skills = (Object.keys(dimensionMeta) as QuestionnaireDimension[]).map((dimension) => {
    const questions = profileQuestions.filter((item) => item.dimension === dimension);
    const average = questions.reduce((sum, question) => sum + (input.answers[question.id] ?? 1), 0) / questions.length;
    const score = Math.round(10 + average * 18);
    const evidence = questions.map((question) => `${question.text.replace(/[？?]$/, "")}：${question.options[(input.answers[question.id] ?? 1) - 1]}`);
    return { name: dimension, score, category: dimensionMeta[dimension].category, confidence: input.evidence?.trim() ? 94 : 90, evidence: [...evidence.slice(0, 2), input.evidence?.trim() || "未补充额外作品说明"] } satisfies Skill;
  }).sort((a, b) => b.score - a.score);
  const strongest = skills.slice(0, 2).map((item) => item.name).join("、");
  return {
    summary: `${input.major}背景；当前调查中相对突出的维度是${strongest}。结果来自跨专业通用的问题解决、调研表达、竞赛经历和项目交付问题，不进行性格类型判断。`,
    skills,
    interests: input.interests.slice(0, 6),
    potentialDirections: skills.slice(0, 3).map((item) => dimensionMeta[item.name as QuestionnaireDimension].direction),
    analysisMode: "questionnaire",
    evidenceCount: profileQuestions.length + (input.evidence?.trim() ? 1 : 0),
  };
}
