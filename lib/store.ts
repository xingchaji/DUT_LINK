import { demoProfile, opportunities as seedOpportunities } from "@/lib/mock-data";
import type { CommunityArticle, GeneratedProfile, Notification, Opportunity, OpportunityInterest, RecruitmentApplication, RecruitmentPost, TeamInvitation, UserAccountProfile } from "@/lib/types";

type Store = {
  schemaVersion: 11;
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
  schemaVersion: 11,
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
    {
      id: "seed-article-3",
      title: "空间调研里的观察法，怎么搬到需求访谈",
      summary: "把建筑调研的记录方式用在用户访谈里，才发现人说的需求和真正做的事经常是两套。",
      authorName: "周宇",
      authorMajor: "建筑学",
      bridge: "空间调研 × 需求分析",
      status: "approved",
      createdAt: "2026-08-22T14:00:00.000Z",
    },
    {
      id: "seed-article-4",
      title: "做海报和做仪表盘，其实都在控制信息密度",
      summary: "视觉传达训练里的版面层级，几乎可以直接解释为什么很多数据看板让人看不下去。",
      authorName: "林一",
      authorMajor: "视觉传达",
      bridge: "版式设计 × 数据可视化",
      status: "approved",
      createdAt: "2026-08-20T09:30:00.000Z",
    },
    {
      id: "seed-article-5",
      title: "从分镜脚本到状态机：叙事结构的一个练习",
      summary: "把交互叙事拆成分镜之后，我发现它和状态机是同一件事的两种画法，只是给不同专业的人看。",
      authorName: "陈曦",
      authorMajor: "数字媒体",
      bridge: "叙事设计 × 软件建模",
      status: "approved",
      createdAt: "2026-08-19T16:20:00.000Z",
    },
    {
      id: "seed-article-6",
      title: "给跨专业队友写接口文档的三条经验",
      summary: "接口文档不是写给编译器看的，是写给不懂你专业的队友看的：说清输入、输出和失败时该做什么。",
      authorName: "陆同学",
      authorMajor: "软件工程",
      bridge: "软件工程 × 跨专业协作",
      status: "approved",
      createdAt: "2026-08-17T11:10:00.000Z",
    },
    {
      id: "seed-article-7",
      title: "把被动房的三条约束写进方案之后",
      summary: "参加绿色建筑赛题时，我先列约束再列功能，方案第一次被老师评价为「像个工程方案」。",
      authorName: "周宇",
      authorMajor: "建筑学",
      bridge: "建筑物理 × 方案设计",
      status: "approved",
      createdAt: "2026-08-15T10:00:00.000Z",
    },
    {
      id: "seed-article-8",
      title: "我用一张关系图说服了队友改需求",
      summary: "把访谈记录画成一张关系图之后，争了半小时的需求优先级十分钟就定下来了。",
      authorName: "林一",
      authorMajor: "视觉传达",
      bridge: "信息图 × 团队决策",
      status: "approved",
      createdAt: "2026-08-12T15:40:00.000Z",
    },
  ],
  accountProfiles: [
    {
      userId: "demo-user", nickname: "陆同学", email: "student@dlut.edu.cn", major: "软件工程", grade: "大一",
      contact: "dut-link-demo（微信）", bio: "正在探索 AI 应用、校园产品和跨专业竞赛合作。", skills: ["TypeScript", "React", "产品原型"],
      updatedAt: "2026-08-23T08:00:00.000Z",
    },
    {
      userId: "zhou-yu", nickname: "周宇", email: "zhouyu@dlut.edu.cn", major: "建筑学", grade: "大三",
      contact: "zhouyu-demo（微信）", bio: "关注空间调研、数字建模与跨专业项目协作。", skills: ["空间调研", "3D 建模", "方案表达"],
      updatedAt: "2026-08-23T08:00:00.000Z",
    },
    {
      userId: "lin-yi", nickname: "林一", email: "linyi@dlut.edu.cn", major: "视觉传达", grade: "大二",
      contact: "linyi_design（微信）", bio: "关注校园产品、品牌视觉和用户体验，希望与技术方向的同学共同完成可落地作品。", skills: ["UI 设计", "品牌视觉", "用户研究"],
      updatedAt: "2026-08-21T09:30:00.000Z",
    },
    {
      userId: "chen-xi", nickname: "陈曦", email: "chenxi@dlut.edu.cn", major: "数字媒体", grade: "大二",
      contact: "chenxi_media（微信）", bio: "数字媒体方向，持续学习 Unity 与交互装置。", skills: ["Unity", "交互装置", "游戏开发"],
      updatedAt: "2026-08-19T16:20:00.000Z",
    },
    {
      userId: "liu-shuran", nickname: "刘姝然", email: "liushuran@dlut.edu.cn", major: "化学工程与工艺", grade: "大三",
      contact: "liushuran_lab（微信）", bio: "做过催化剂性能评价与流程模拟，希望找到能把实验室结果做成可演示系统的人。", skills: ["催化实验", "流程模拟", "数据分析"],
      updatedAt: "2026-08-22T10:00:00.000Z",
    },
    {
      userId: "han-zhuo", nickname: "韩卓", email: "hanzhuo@dlut.edu.cn", major: "机械设计制造及其自动化", grade: "大二",
      contact: "hanzhuo_mec（微信）", bio: "做过小型机构设计与加工，缺一个能写控制与界面的队友。", skills: ["三维建模", "机构设计", "数控加工"],
      updatedAt: "2026-08-22T11:20:00.000Z",
    },
    {
      userId: "sun-ke", nickname: "孙可", email: "sunke@dlut.edu.cn", major: "能源与动力工程", grade: "大三",
      contact: "sunke_energy（微信）", bio: "关注储能与热管理，做过 CFD 仿真与台架测试。", skills: ["热流仿真", "CFD", "实验测试"],
      updatedAt: "2026-08-21T15:00:00.000Z",
    },
    {
      userId: "xu-jiahang", nickname: "徐嘉航", email: "xujiahang@dlut.edu.cn", major: "电子信息工程", grade: "大二",
      contact: "xujiahang_ee（微信）", bio: "做过单片机最小系统与传感器采集，希望补齐上位机与算法部分。", skills: ["单片机", "模拟电路", "信号处理"],
      updatedAt: "2026-08-20T19:10:00.000Z",
    },
    {
      userId: "gao-wenqi", nickname: "高文琪", email: "gaowenqi@dlut.edu.cn", major: "环境工程", grade: "大四",
      contact: "gaowenqi_env（微信）", bio: "做过校园与近岸水质监测，会用 GIS 做空间分析。", skills: ["水质检测", "GIS", "环境评价"],
      updatedAt: "2026-08-18T14:40:00.000Z",
    },
    {
      userId: "tang-yuxin", nickname: "唐雨欣", email: "tangyuxin@dlut.edu.cn", major: "数学与应用数学", grade: "大二",
      contact: "tangyuxin_math（微信）", bio: "熟悉数学建模流程与常见优化方法，希望参与有真实数据支撑的赛题。", skills: ["数学建模", "优化算法", "Python"],
      updatedAt: "2026-08-20T08:50:00.000Z",
    },
    {
      userId: "wei-ziqi", nickname: "魏子琪", email: "weiziqi@dlut.edu.cn", major: "计算机科学与技术", grade: "大三",
      contact: "weiziqi_dev（微信）", bio: "做过接口与数据库设计，喜欢把想法真正部署出来。", skills: ["后端开发", "数据库", "系统设计"],
      updatedAt: "2026-08-23T07:30:00.000Z",
    },
    {
      userId: "ding-ruoxi", nickname: "丁若曦", email: "dingruoxi@dlut.edu.cn", major: "工业设计", grade: "大二",
      contact: "dingruoxi_design（微信）", bio: "关注产品造型、色彩与材料工艺，做过从草图到模型的完整方案。", skills: ["产品造型", "手绘", "CMF"],
      updatedAt: "2026-08-21T13:20:00.000Z",
    },
    {
      userId: "shen-yifan", nickname: "沈一帆", email: "shenyifan@dlut.edu.cn", major: "工商管理", grade: "大三",
      contact: "shenyifan_biz（微信）", bio: "做过市场调研与财务测算，负责过路演材料。", skills: ["商业分析", "财务测算", "路演"],
      updatedAt: "2026-08-19T09:00:00.000Z",
    },
    {
      userId: "weng-jia", nickname: "翁佳", email: "wengjia@dlut.edu.cn", major: "英语（翻译）", grade: "大二",
      contact: "wengjia_trans（微信）", bio: "做过双语采访与内容编辑，关注如何把专业内容讲给非专业读者听。", skills: ["双语写作", "跨文化沟通", "内容编辑"],
      updatedAt: "2026-08-17T17:00:00.000Z",
    },
    {
      userId: "bai-mingyuan", nickname: "白明远", email: "baimingyuan@dlut.edu.cn", major: "材料科学与工程", grade: "大三",
      contact: "baimingyuan_mat（微信）", bio: "熟悉常见表征手段与实验设计，希望参与有明确性能指标的作品。", skills: ["材料表征", "实验设计", "SEM"],
      updatedAt: "2026-08-22T16:30:00.000Z",
    },
    {
      userId: "qiu-yanan", nickname: "邱雅楠", email: "qiuyanan@dlut.edu.cn", major: "生物工程", grade: "大四",
      contact: "qiuyanan_bio（微信）", bio: "做过细胞实验与数据整理，正在接触生物信息与医学影像分析。", skills: ["细胞实验", "生物信息入门", "实验记录"],
      updatedAt: "2026-08-18T10:20:00.000Z",
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
export const store = globalStore.__dutLinkStore?.schemaVersion === 11 ? globalStore.__dutLinkStore : initialStore;
if (process.env.NODE_ENV !== "production") globalStore.__dutLinkStore = store;
