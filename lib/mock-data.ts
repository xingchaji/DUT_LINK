import type { GeneratedProfile, PersonMatch } from "@/lib/types";

export const demoProfile: GeneratedProfile = {
  summary: "兼具工程实现与创意表达潜力的软件工程学习者，适合从 AI 应用和交互体验切入跨学科项目。",
  skills: [
    { name: "软件开发", score: 82, category: "技术" },
    { name: "游戏开发", score: 74, category: "创意" },
    { name: "数据分析", score: 66, category: "技术" },
    { name: "团队协作", score: 71, category: "协作" },
  ],
  interests: ["独立游戏", "人工智能", "开源社区", "视觉叙事"],
  potentialDirections: ["AI 应用开发", "游戏工具开发", "人机交互"],
};

export const matches: PersonMatch[] = [
  {
    id: "lin-yi",
    name: "林一",
    major: "视觉传达 · 大二",
    avatar: "林",
    match: 94,
    tags: ["UI 设计", "品牌视觉"],
    reason: "你的工程能力与她的视觉设计经验高度互补",
    status: "正在寻找校园产品项目",
  },
  {
    id: "zhou-yu",
    name: "周宇",
    major: "建筑学 · 大三",
    avatar: "周",
    match: 89,
    tags: ["数字建筑", "3D 建模"],
    reason: "游戏世界构建与空间设计存在有趣交叉",
    status: "想尝试虚拟校园项目",
  },
  {
    id: "chen-xi",
    name: "陈曦",
    major: "数字媒体 · 大二",
    avatar: "陈",
    match: 86,
    tags: ["Unity", "交互装置"],
    reason: "你们都对游戏与智能交互感兴趣",
    status: "本周可参与新项目",
  },
];

export const opportunities = [
  {
    title: "校园 AI 创新挑战赛",
    type: "竞赛",
    deadline: "14 天后截止",
    fit: 91,
    tags: ["AI 应用", "产品创新", "3–5 人"],
    accent: "violet",
  },
  {
    title: "数字孪生校园共创计划",
    type: "项目",
    deadline: "长期招募",
    fit: 87,
    tags: ["Unity", "3D 建模", "校园服务"],
    accent: "cyan",
  },
  {
    title: "开源社区新星计划",
    type: "社区",
    deadline: "7 天后截止",
    fit: 83,
    tags: ["开源", "协作", "工程实践"],
    accent: "amber",
  },
];

export const discoveries = [
  {
    eyebrow: "今日知识盲盒",
    title: "为什么程序员应该了解建筑学？",
    description: "从模块、动线与尺度出发，看看软件架构和真实空间如何用相似的方法组织复杂性。",
    bridge: "软件架构 × 空间设计",
    readTime: "6 分钟",
  },
  {
    eyebrow: "跨领域灵感",
    title: "用游戏设计重新想象校园导览",
    description: "任务、反馈与叙事不仅属于游戏，也能让新生探索校园的过程更自然。",
    bridge: "游戏机制 × 校园服务",
    readTime: "4 分钟",
  },
];

