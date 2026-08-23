import { opportunities as seedOpportunities } from "@/lib/mock-data";
import type { CommunityArticle, Opportunity, OpportunityInterest, RecruitmentApplication, RecruitmentPost, TeamInvitation, UserAccountProfile } from "@/lib/types";

type Store = {
  schemaVersion: 5;
  opportunities: Opportunity[];
  recruitments: RecruitmentPost[];
  applications: RecruitmentApplication[];
  opportunityInterests: OpportunityInterest[];
  invitations: TeamInvitation[];
  articles: CommunityArticle[];
  accountProfiles: UserAccountProfile[];
};

const initialStore: Store = {
  schemaVersion: 5,
  opportunities: [...seedOpportunities],
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
      createdAt: "2026-08-18T09:00:00.000Z",
    },
  ],
  accountProfiles: [
    {
      userId: "demo-user", nickname: "陆同学", email: "student@dlut.edu.cn", major: "软件工程", grade: "大一",
      contact: "dut-link-demo（微信）", bio: "正在探索 AI 应用、校园产品和跨专业竞赛合作。", skills: ["TypeScript", "React", "产品原型"],
      updatedAt: "2026-08-23T08:00:00.000Z",
    },
  ],
};

const globalStore = globalThis as typeof globalThis & { __dutLinkStore?: Store };
export const store = globalStore.__dutLinkStore?.schemaVersion === 5 ? globalStore.__dutLinkStore : initialStore;
if (process.env.NODE_ENV !== "production") globalStore.__dutLinkStore = store;
