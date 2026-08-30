import { demoProfile, opportunities as seedOpportunities } from "@/lib/mock-data";
import type { CommunityArticle, GeneratedProfile, Notification, Opportunity, OpportunityInterest, RecruitmentApplication, RecruitmentPost, TeamInvitation, UserAccountProfile } from "@/lib/types";

type Store = {
  schemaVersion: 9;
  authUsers: Array<{ id: string; name: string; email: string; passwordHash: string; major: string; role: "student" | "admin" }>;
  opportunities: Opportunity[];
  recruitments: RecruitmentPost[];
  applications: RecruitmentApplication[];
  opportunityInterests: OpportunityInterest[];
  invitations: TeamInvitation[];
  articles: CommunityArticle[];
  accountProfiles: UserAccountProfile[];
  abilityProfiles: Record<string, GeneratedProfile>;
  notifications: Notification[];
  aiSettings: Record<string, { enabled: boolean; apiKeyEncrypted: string | null; baseUrl: string; model: string; createdAt: string; updatedAt: string }>;
};

const initialStore: Store = {
  schemaVersion: 9,
  authUsers: [],
  opportunities: [...seedOpportunities, {
    id: "campus-ai-hackathon",
    title: "校园 AI 创新挑战赛",
    organizer: "软件学院学生会",
    type: "学术竞赛",
    status: "校内用户发布 · 待核验",
    deadline: "2026-09-30 报名截止",
    fit: 0,
    description: "面向全校的 AI 应用创意赛，鼓励跨专业组队，用可演示作品解决校园真实问题。",
    tags: ["人工智能", "跨专业"],
    sourceName: "软件学院学生会 发布",
    sourceUrl: "#",
    verifiedAt: "待校内组织核验",
    bonusPolicy: "用户发布活动不默认关联综测加分",
    accent: "cyan",
    registrationStart: "2026-09-01",
    registrationEnd: "2026-09-30",
    eventDate: null,
    scope: "校内",
    verification: "pending",
    publisherId: "lin-yi",
    publisherName: "林一",
  }],
  recruitments: [
    {
      id: "seed-recruitment-1",
      opportunityId: "ccdc-2026",
      opportunityTitle: "2026 中国大学生计算机设计大赛",
      teamName: "Link Builders",
      ownerName: "林一",
      ownerId: "lin-yi",
      description: "正在做校园机会聚合与智能组队原型，需要一名熟悉前端交互的同学。",
      projectDirection: "校园机会聚合与智能组队",
      expectedAvailability: "周末、工作日晚间",
      requirements: "能够独立完成 React 页面，并参与每周一次方案讨论。",
      neededSkills: ["React", "交互设计"],
      currentSize: 2,
      capacity: 4,
      contact: "link-builders（微信）",
      members: [
        { userId: "lin-yi", name: "林一", major: "视觉传达", grade: "大二", skills: ["UI 设计", "品牌视觉"] },
        { userId: "chen-xi", name: "陈曦", major: "数字媒体", grade: "大二", skills: ["Unity", "交互装置"] },
      ],
      recruitmentDeadline: "2026-12-15",
      createdAt: "2026-08-20T08:00:00.000Z",
      applicants: 1,
    },
    {
      id: "seed-recruitment-2",
      opportunityId: "innovation-2026",
      opportunityTitle: "中国国际大学生创新大赛（2026）",
      teamName: "校园同行者",
      ownerName: "陆同学",
      ownerId: "demo-user",
      description: "从校园服务场景出发打磨产品方案，正在寻找调研和视觉方向的队友。",
      projectDirection: "校园服务产品创新",
      expectedAvailability: "周末",
      requirements: "愿意参与用户访谈，并能将调研结论转成方案。",
      neededSkills: ["用户调研", "视觉设计"],
      currentSize: 2,
      capacity: 5,
      contact: "dut-campus-team（微信）",
      members: [
        { userId: "demo-user", name: "陆同学", major: "软件工程", grade: "大一", skills: ["TypeScript", "React", "产品原型"] },
        { userId: "lin-yi", name: "林一", major: "视觉传达", grade: "大二", skills: ["UI 设计", "品牌视觉"] },
      ],
      recruitmentDeadline: "2026-12-20",
      createdAt: "2026-08-20T09:00:00.000Z",
      applicants: 1,
    },
  ],
  applications: [
    {
      id: "seed-application-1",
      recruitmentId: "seed-recruitment-2",
      applicantId: "zhou-yu",
      applicantName: "周宇",
      applicantMajor: "建筑学",
      message: "有空间调研与 3D 建模经验，希望负责场景研究。",
      status: "pending",
      createdAt: "2026-08-20T10:00:00.000Z",
    },
  ],
  opportunityInterests: [
    { userId: "demo-user", opportunityId: "ccdc-2026", createdAt: "2026-08-20T10:30:00.000Z" },
    { userId: "zhou-yu", opportunityId: "service-outsourcing-2026", createdAt: "2026-08-20T10:35:00.000Z" },
  ],
  invitations: [],
  articles: [
    {
      id: "seed-article-1",
      title: "为什么程序员应该了解建筑？",
      summary: "从空间动线、模块边界与人的尺度出发，重新理解软件架构。",
      authorName: "周宇",
      authorMajor: "建筑学",
      bridge: "建筑 × 软件工程",
      status: "approved",
      createdAt: "2026-08-18T09:00:00.000Z",
    },
    {
      id: "seed-article-2",
      title: "从竞赛答辩看工程表达",
      summary: "把技术方案讲清楚，是每个参赛者都需要补的一课。",
      authorName: "陈曦",
      authorMajor: "数字媒体",
      bridge: "表达 × 工程",
      status: "pending",
      createdAt: "2026-08-24T10:00:00.000Z",
    },
  ],
  accountProfiles: [
    {
      userId: "demo-user", nickname: "陆同学", email: "student@dlut.edu.cn", major: "软件工程", grade: "大一",
      contact: "dut-link-demo（微信）", bio: "正在探索 AI 应用、校园产品和跨专业竞赛合作。", skills: ["TypeScript", "React", "产品原型"],
      updatedAt: "2026-08-23T08:00:00.000Z",
    },
    {
      userId: "zhou-yu", nickname: "周宇", email: "zhouyu@dlut.edu.cn", major: "建筑学", grade: "大二",
      contact: "zhouyu-demo（微信）", bio: "关注空间调研、数字建模与跨专业项目协作。", skills: ["空间调研", "3D 建模", "方案表达"],
      updatedAt: "2026-08-23T08:00:00.000Z",
    },
  ],
  abilityProfiles: { "demo-user": demoProfile },
  notifications: [
    {
      id: "seed-notification-1",
      userId: "demo-user",
      type: "application_received",
      title: "收到新申请",
      body: "周宇 申请加入「校园同行者」",
      relatedId: "seed-application-1",
      read: false,
      createdAt: "2026-08-20T10:00:00.000Z",
    },
  ],
  aiSettings: {},
};

const globalStore = globalThis as typeof globalThis & { __dutLinkStore?: Store };
export const store = globalStore.__dutLinkStore?.schemaVersion === 9 ? globalStore.__dutLinkStore : initialStore;
if (process.env.NODE_ENV !== "production") globalStore.__dutLinkStore = store;
