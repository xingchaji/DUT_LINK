import type { CommunityArticle, RecruitmentPost } from "@/lib/types";

type Store = {
  recruitments: RecruitmentPost[];
  applications: Array<{ id: string; recruitmentId: string; userId: string; message: string; createdAt: string }>;
  articles: CommunityArticle[];
};

const initialStore: Store = {
  recruitments: [
    {
      id: "seed-recruitment-1",
      opportunityId: "ccdc-2026",
      opportunityTitle: "2026 中国大学生计算机设计大赛",
      teamName: "Link Builders",
      ownerName: "林一",
      description: "正在做校园机会聚合与智能组队原型，需要一名熟悉前端交互的同学。",
      neededSkills: ["React", "交互设计"],
      currentSize: 2,
      capacity: 4,
      contact: "站内联系",
      createdAt: "2026-08-20T08:00:00.000Z",
      applicants: 1,
    },
  ],
  applications: [],
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
};

const globalStore = globalThis as typeof globalThis & { __dutLinkStore?: Store };
export const store = globalStore.__dutLinkStore ?? initialStore;
if (process.env.NODE_ENV !== "production") globalStore.__dutLinkStore = store;
