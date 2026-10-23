import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../generated/prisma/client";
import { demoProfile, opportunities } from "../lib/mock-data";
import { hashPassword } from "../lib/password";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL 未配置，无法执行种子脚本");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

function date(value?: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

async function main() {
  const seedUsers = [
    { id: "demo-user", email: "student@dlut.edu.cn", name: "陆同学", major: "软件工程", grade: "大一", contact: "dut-link-demo（微信）", bio: "正在探索 AI 应用、校园产品和跨专业竞赛合作。", skillTags: ["TypeScript", "React", "产品原型"] },
    { id: "lin-yi", email: "linyi@dlut.edu.cn", name: "林一", major: "视觉传达", grade: "大二", contact: "linyi_design（微信）", bio: "关注校园产品、品牌视觉和用户体验，希望与技术方向的同学共同完成可落地作品。", skillTags: ["UI 设计", "品牌视觉", "用户研究"] },
    { id: "chen-xi", email: "chenxi@dlut.edu.cn", name: "陈曦", major: "数字媒体", grade: "大二", contact: "chenxi_media（微信）", bio: "数字媒体方向，持续学习 Unity 与交互装置。", skillTags: ["Unity", "交互装置", "游戏开发"] },
    { id: "zhou-yu", email: "zhouyu@dlut.edu.cn", name: "周宇", major: "建筑学", grade: "大三", contact: "zhouyu_space（微信）", bio: "关注空间调研、数字建模与跨专业项目协作。", skillTags: ["空间调研", "3D 建模", "方案表达"] },
    { id: "liu-shuran", email: "liushuran@dlut.edu.cn", name: "刘姝然", major: "化学工程与工艺", grade: "大三", contact: "liushuran_lab（微信）", bio: "做过催化剂性能评价与流程模拟，希望找到能把实验室结果做成可演示系统的人。", skillTags: ["催化实验", "流程模拟", "数据分析"] },
    { id: "han-zhuo", email: "hanzhuo@dlut.edu.cn", name: "韩卓", major: "机械设计制造及其自动化", grade: "大二", contact: "hanzhuo_mec（微信）", bio: "做过小型机构设计与加工，缺一个能写控制与界面的队友。", skillTags: ["三维建模", "机构设计", "数控加工"] },
    { id: "sun-ke", email: "sunke@dlut.edu.cn", name: "孙可", major: "能源与动力工程", grade: "大三", contact: "sunke_energy（微信）", bio: "关注储能与热管理，做过 CFD 仿真与台架测试。", skillTags: ["热流仿真", "CFD", "实验测试"] },
    { id: "xu-jiahang", email: "xujiahang@dlut.edu.cn", name: "徐嘉航", major: "电子信息工程", grade: "大二", contact: "xujiahang_ee（微信）", bio: "做过单片机最小系统与传感器采集，希望补齐上位机与算法部分。", skillTags: ["单片机", "模拟电路", "信号处理"] },
    { id: "gao-wenqi", email: "gaowenqi@dlut.edu.cn", name: "高文琪", major: "环境工程", grade: "大四", contact: "gaowenqi_env（微信）", bio: "做过校园与近岸水质监测，会用 GIS 做空间分析。", skillTags: ["水质检测", "GIS", "环境评价"] },
    { id: "tang-yuxin", email: "tangyuxin@dlut.edu.cn", name: "唐雨欣", major: "数学与应用数学", grade: "大二", contact: "tangyuxin_math（微信）", bio: "熟悉数学建模流程与常见优化方法。", skillTags: ["数学建模", "优化算法", "Python"] },
    { id: "wei-ziqi", email: "weiziqi@dlut.edu.cn", name: "魏子琪", major: "计算机科学与技术", grade: "大三", contact: "weiziqi_dev（微信）", bio: "做过接口与数据库设计，喜欢把想法真正部署出来。", skillTags: ["后端开发", "数据库", "系统设计"] },
    { id: "ding-ruoxi", email: "dingruoxi@dlut.edu.cn", name: "丁若曦", major: "工业设计", grade: "大二", contact: "dingruoxi_design（微信）", bio: "关注产品造型、色彩与材料工艺。", skillTags: ["产品造型", "手绘", "CMF"] },
    { id: "shen-yifan", email: "shenyifan@dlut.edu.cn", name: "沈一帆", major: "工商管理", grade: "大三", contact: "shenyifan_biz（微信）", bio: "做过市场调研与财务测算，负责过路演材料。", skillTags: ["商业分析", "财务测算", "路演"] },
    { id: "weng-jia", email: "wengjia@dlut.edu.cn", name: "翁佳", major: "英语（翻译）", grade: "大二", contact: "wengjia_trans（微信）", bio: "做过双语采访与内容编辑。", skillTags: ["双语写作", "跨文化沟通", "内容编辑"] },
    { id: "bai-mingyuan", email: "baimingyuan@dlut.edu.cn", name: "白明远", major: "材料科学与工程", grade: "大三", contact: "baimingyuan_mat（微信）", bio: "熟悉常见表征手段与实验设计。", skillTags: ["材料表征", "实验设计", "SEM"] },
    { id: "qiu-yanan", email: "qiuyanan@dlut.edu.cn", name: "邱雅楠", major: "生物工程", grade: "大四", contact: "qiuyanan_bio（微信）", bio: "做过细胞实验与数据整理，正在接触生物信息与医学影像分析。", skillTags: ["细胞实验", "生物信息入门", "实验记录"] },
    { id: "admin-user", email: "admin@dlut.edu.cn", name: "平台管理员", major: "平台运营", grade: null, contact: null, bio: "DUT Link 内容审核管理员。", skillTags: [], role: "admin" as const },
  ];
  const demoPasswordHashes = await Promise.all(seedUsers.map(() => hashPassword("demo1234")));
  const users = seedUsers.map((user, index) => ({ ...user, passwordHash: demoPasswordHashes[index] }));
  for (const user of users) await prisma.user.upsert({ where: { id: user.id }, update: user, create: user });

  for (const opportunity of opportunities) {
    const data = {
      title: opportunity.title, organizer: opportunity.organizer, type: opportunity.type, description: opportunity.description,
      sourceName: opportunity.sourceName, sourceUrl: opportunity.sourceUrl, status: opportunity.status, deadline: opportunity.deadline,
      registrationStart: date(opportunity.registrationStart), registrationEnd: date(opportunity.registrationEnd), eventDate: date(opportunity.eventDate),
      scope: opportunity.scope ?? "全国", verification: opportunity.verification ?? "official", tags: opportunity.tags, fit: opportunity.fit,
      accent: opportunity.accent, bonusPolicy: opportunity.bonusPolicy, verifiedAt: /^\d{4}-\d{2}-\d{2}$/.test(opportunity.verifiedAt) ? date(opportunity.verifiedAt) : null,
    };
    await prisma.opportunity.upsert({ where: { id: opportunity.id }, update: data, create: { id: opportunity.id, ...data } });
  }

  await prisma.opportunity.upsert({
    where: { id: "campus-ai-hackathon" },
    update: {},
    create: {
      id: "campus-ai-hackathon", title: "校园 AI 创新挑战赛", organizer: "软件学院学生会", type: "学术竞赛",
      description: "面向全校的 AI 应用创意赛，鼓励跨专业组队，用可演示作品解决校园真实问题。",
      sourceName: "软件学院学生会 发布", sourceUrl: "#", status: "校内用户发布 · 待核验", deadline: "2026-09-30 报名截止",
      registrationStart: date("2026-09-01"), registrationEnd: date("2026-09-30"), eventDate: null,
      scope: "校内", verification: "pending", tags: ["人工智能", "跨专业"], fit: 0,
      accent: "cyan", bonusPolicy: "用户发布活动不默认关联综测加分", verifiedAt: null,
      publisherId: "lin-yi",
    },
  });

  const recruitment1 = await prisma.recruitmentPost.upsert({
    where: { id: "seed-recruitment-1" },
    update: {},
    create: { id: "seed-recruitment-1", opportunityId: "ccdc-2026", ownerId: "lin-yi", teamName: "Link Builders", projectDirection: "校园机会聚合与智能组队", expectedAvailability: "周末、工作日晚间", description: "正在做校园机会聚合与智能组队原型，需要一名熟悉前端交互的同学。", requirements: "能够独立完成 React 页面，并参与每周一次方案讨论。", neededSkills: ["React", "交互设计"], capacity: 4, currentSize: 2, contact: "link-builders（微信）", recruitmentDeadline: new Date("2026-12-15T23:59:59.000Z") },
  });
  const recruitment2 = await prisma.recruitmentPost.upsert({
    where: { id: "seed-recruitment-2" },
    update: {},
    create: { id: "seed-recruitment-2", opportunityId: "innovation-2026", ownerId: "demo-user", teamName: "校园同行者", projectDirection: "校园服务产品创新", expectedAvailability: "周末", description: "从校园服务场景出发打磨产品方案，正在寻找调研和视觉方向的队友。", requirements: "愿意参与用户访谈，并能将调研结论转成方案。", neededSkills: ["用户调研", "视觉设计"], capacity: 5, currentSize: 2, contact: "dut-campus-team（微信）", recruitmentDeadline: new Date("2026-12-20T23:59:59.000Z") },
  });

  const memberships = [
    { id: "membership-lin-ccdc", userId: "lin-yi", opportunityId: "ccdc-2026", recruitmentId: recruitment1.id, role: "captain" },
    { id: "membership-chen-ccdc", userId: "chen-xi", opportunityId: "ccdc-2026", recruitmentId: recruitment1.id, role: "member" },
    { id: "membership-demo-innovation", userId: "demo-user", opportunityId: "innovation-2026", recruitmentId: recruitment2.id, role: "captain" },
    { id: "membership-lin-innovation", userId: "lin-yi", opportunityId: "innovation-2026", recruitmentId: recruitment2.id, role: "member" },
  ];
  for (const membership of memberships) await prisma.competitionMembership.upsert({ where: { userId_opportunityId: { userId: membership.userId, opportunityId: membership.opportunityId } }, update: membership, create: membership });

  const application = await prisma.recruitmentApplication.upsert({ where: { recruitmentId_applicantId: { recruitmentId: recruitment2.id, applicantId: "zhou-yu" } }, update: {}, create: { id: "seed-application-1", recruitmentId: recruitment2.id, applicantId: "zhou-yu", message: "有空间调研与 3D 建模经验，希望负责场景研究。" } });
  const seedInterests: Array<[string, string]> = [
    ["demo-user", "ccdc-2026"],
    ["zhou-yu", "service-outsourcing-2026"],
    ["lin-yi", "ccdc-2026"],
    ["chen-xi", "ccdc-2026"],
    ["liu-shuran", "innovation-2026"],
    ["sun-ke", "innovation-2026"],
    ["bai-mingyuan", "challenge-cup"],
    ["gao-wenqi", "challenge-cup"],
    ["han-zhuo", "umic-2026"],
    ["han-zhuo", "smart-car-2026"],
    ["xu-jiahang", "nuedc-2026"],
    ["xu-jiahang", "smart-car-2026"],
    ["tang-yuxin", "cumcm-2026"],
    ["tang-yuxin", "innovation-2026"],
    ["wei-ziqi", "ccdc-2026"],
    ["wei-ziqi", "service-outsourcing-2026"],
    ["ding-ruoxi", "sun-ada-2026"],
    ["ding-ruoxi", "ccdc-2026"],
    ["shen-yifan", "innovation-2026"],
    ["shen-yifan", "challenge-cup"],
    ["weng-jia", "sun-ada-2026"],
    ["qiu-yanan", "ccdc-2026"],
  ];
  for (const [userId, opportunityId] of seedInterests) {
    await prisma.opportunityInterest.upsert({ where: { userId_opportunityId: { userId, opportunityId } }, update: {}, create: { userId, opportunityId } });
  }
  const seedArticles: Array<{ id: string; authorId: string; title: string; summary: string; bridge: string; status: "approved" | "pending" }> = [
    { id: "seed-article-1", authorId: "zhou-yu", title: "为什么程序员应该了解建筑？", summary: "从空间动线、模块边界与人的尺度出发，重新理解软件架构。", bridge: "建筑 × 软件工程", status: "approved" },
    { id: "seed-article-2", authorId: "chen-xi", title: "从竞赛答辩看工程表达", summary: "把技术方案讲清楚，是每个参赛者都需要补的一课。", bridge: "表达 × 工程", status: "pending" },
    { id: "seed-article-3", authorId: "zhou-yu", title: "空间调研里的观察法，怎么搬到需求访谈", summary: "把建筑调研的记录方式用在用户访谈里，才发现人说的需求和真正做的事经常是两套。", bridge: "空间调研 × 需求分析", status: "approved" },
    { id: "seed-article-4", authorId: "lin-yi", title: "做海报和做仪表盘，其实都在控制信息密度", summary: "视觉传达训练里的版面层级，几乎可以直接解释为什么很多数据看板让人看不下去。", bridge: "版式设计 × 数据可视化", status: "approved" },
    { id: "seed-article-5", authorId: "chen-xi", title: "从分镜脚本到状态机：叙事结构的一个练习", summary: "把交互叙事拆成分镜之后，我发现它和状态机是同一件事的两种画法，只是给不同专业的人看。", bridge: "叙事设计 × 软件建模", status: "approved" },
    { id: "seed-article-6", authorId: "demo-user", title: "给跨专业队友写接口文档的三条经验", summary: "接口文档不是写给编译器看的，是写给不懂你专业的队友看的：说清输入、输出和失败时该做什么。", bridge: "软件工程 × 跨专业协作", status: "approved" },
    { id: "seed-article-7", authorId: "zhou-yu", title: "把被动房的三条约束写进方案之后", summary: "参加绿色建筑赛题时，我先列约束再列功能，方案第一次被老师评价为「像个工程方案」。", bridge: "建筑物理 × 方案设计", status: "approved" },
    { id: "seed-article-8", authorId: "lin-yi", title: "我用一张关系图说服了队友改需求", summary: "把访谈记录画成一张关系图之后，争了半小时的需求优先级十分钟就定下来了。", bridge: "信息图 × 团队决策", status: "approved" },
  ];
  for (const article of seedArticles) {
    await prisma.article.upsert({ where: { id: article.id }, update: {}, create: article });
  }
  await prisma.notification.upsert({ where: { id: "seed-notification-1" }, update: {}, create: { id: "seed-notification-1", userId: "demo-user", type: "application_received", title: "收到新申请", body: "周宇 申请加入「校园同行者」", relatedId: application.id } });
  await prisma.profile.upsert({
    where: { userId: "demo-user" },
    update: {},
    create: { userId: "demo-user", summary: demoProfile.summary, skills: demoProfile.skills as unknown as Prisma.InputJsonValue, interests: demoProfile.interests, potentialDirections: demoProfile.potentialDirections, analysisMode: demoProfile.analysisMode ?? "rules", evidenceCount: demoProfile.evidenceCount ?? 0 },
  });
  const candidateProfiles: Array<{ userId: string; summary: string; skills: Prisma.InputJsonValue; interests: string[]; potentialDirections: string[]; evidenceCount: number }> = [
    {
      userId: "lin-yi",
      summary: "具备视觉表达、界面设计与用户研究能力，适合在跨专业团队中承担体验设计与方案呈现。",
      skills: [
        { name: "UI 设计", score: 88, category: "创意", confidence: 84, evidence: ["校园产品界面设计", "品牌视觉练习"] },
        { name: "用户研究", score: 76, category: "探索", confidence: 72, evidence: ["用户访谈与体验复盘"] },
        { name: "团队协作", score: 79, category: "协作", confidence: 74, evidence: ["跨专业校园产品合作"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["校园创新", "人工智能", "视觉叙事"],
      potentialDirections: ["产品体验设计", "竞赛视觉表达", "用户研究"],
      evidenceCount: 4,
    },
    {
      userId: "zhou-yu",
      summary: "擅长空间调研、三维建模和方案表达，能够为产品创新与虚拟场景类项目补充空间视角。",
      skills: [
        { name: "空间调研", score: 84, category: "探索", confidence: 82, evidence: ["建筑场地调研"] },
        { name: "3D 建模", score: 86, category: "技术", confidence: 85, evidence: ["建筑数字模型"] },
        { name: "方案表达", score: 78, category: "协作", confidence: 76, evidence: ["课程设计汇报"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["独立游戏", "数字建筑", "人工智能"],
      potentialDirections: ["虚拟校园", "空间交互", "场景研究"],
      evidenceCount: 3,
    },
    {
      userId: "chen-xi",
      summary: "具备 Unity 开发、交互设计与数字叙事经验，适合参与游戏、交互装置和智能体验项目。",
      skills: [
        { name: "Unity 开发", score: 83, category: "技术", confidence: 81, evidence: ["Unity 交互原型"] },
        { name: "交互设计", score: 82, category: "创意", confidence: 78, evidence: ["交互装置课程项目"] },
        { name: "视觉表达", score: 74, category: "创意", confidence: 72, evidence: ["数字媒体作品"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["独立游戏", "人工智能", "交互装置"],
      potentialDirections: ["游戏开发", "智能交互", "数字叙事"],
      evidenceCount: 3,
    },
    {
      userId: "liu-shuran",
      summary: "具备化工实验、流程模拟与数据处理能力，适合承担需要实验验证与工程计算的赛题。",
      skills: [
        { name: "催化实验", score: 84, category: "技术", confidence: 82, evidence: ["催化剂性能评价实验"] },
        { name: "流程模拟", score: 78, category: "技术", confidence: 75, evidence: ["化工流程仿真练习"] },
        { name: "数据分析", score: 80, category: "分析", confidence: 78, evidence: ["实验数据整理与图表"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["绿色化工", "能源", "人工智能"],
      potentialDirections: ["绿色工艺", "过程优化", "实验数据可视化"],
      evidenceCount: 3,
    },
    {
      userId: "han-zhuo",
      summary: "具备三维建模、机构设计与加工经验，能把结构方案从图纸做到实物。",
      skills: [
        { name: "三维建模", score: 86, category: "技术", confidence: 84, evidence: ["机构课程设计建模"] },
        { name: "机构设计", score: 80, category: "技术", confidence: 78, evidence: ["小型传动机构设计"] },
        { name: "数控加工", score: 74, category: "技术", confidence: 72, evidence: ["零件加工与装配"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["机器人", "智能装备", "大学生竞赛"],
      potentialDirections: ["机械创新设计", "智能装备", "结构轻量化"],
      evidenceCount: 3,
    },
    {
      userId: "sun-ke",
      summary: "具备热流仿真与实验测试能力，适合储能、热管理与双碳方向的赛题。",
      skills: [
        { name: "热流仿真", score: 83, category: "技术", confidence: 80, evidence: ["换热器 CFD 仿真"] },
        { name: "CFD", score: 79, category: "技术", confidence: 77, evidence: ["流场网格与后处理"] },
        { name: "实验测试", score: 76, category: "探索", confidence: 74, evidence: ["台架温度采集"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["储能", "双碳", "数据可视化"],
      potentialDirections: ["储能热管理", "能效优化", "碳排分析"],
      evidenceCount: 3,
    },
    {
      userId: "xu-jiahang",
      summary: "具备单片机与模拟电路基础，能承担传感采集与硬件调试部分。",
      skills: [
        { name: "单片机", score: 80, category: "技术", confidence: 78, evidence: ["单片机最小系统"] },
        { name: "模拟电路", score: 74, category: "技术", confidence: 72, evidence: ["放大与滤波电路实验"] },
        { name: "信号处理", score: 72, category: "分析", confidence: 70, evidence: ["传感器数据滤波"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["嵌入式", "智能硬件", "电子设计"],
      potentialDirections: ["嵌入式开发", "传感系统", "硬件与软件联调"],
      evidenceCount: 3,
    },
    {
      userId: "gao-wenqi",
      summary: "具备水质检测、GIS 与环评经验，适合需要真实场景数据的调研与监测作品。",
      skills: [
        { name: "水质检测", score: 82, category: "探索", confidence: 80, evidence: ["校园水体监测项目"] },
        { name: "GIS", score: 78, category: "技术", confidence: 76, evidence: ["空间数据制图与叠加"] },
        { name: "环境评价", score: 76, category: "分析", confidence: 74, evidence: ["环评报告撰写"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["环境监测", "公共政策", "数据"],
      potentialDirections: ["环境监测平台", "空间数据分析", "环境政策研究"],
      evidenceCount: 3,
    },
    {
      userId: "tang-yuxin",
      summary: "具备数学建模与优化算法能力，可以为方案提供量化论证。",
      skills: [
        { name: "数学建模", score: 85, category: "分析", confidence: 82, evidence: ["校内数学建模竞赛"] },
        { name: "优化算法", score: 80, category: "技术", confidence: 78, evidence: ["调度问题求解练习"] },
        { name: "Python", score: 78, category: "技术", confidence: 76, evidence: ["数据分析脚本"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["运筹优化", "算法", "竞赛"],
      potentialDirections: ["数学建模", "运筹优化", "数据建模"],
      evidenceCount: 3,
    },
    {
      userId: "wei-ziqi",
      summary: "具备后端开发与系统设计经验，能把产品原型变成可上线的服务。",
      skills: [
        { name: "后端开发", score: 84, category: "技术", confidence: 82, evidence: ["校园接口服务开发"] },
        { name: "数据库", score: 80, category: "技术", confidence: 78, evidence: ["表结构与索引设计"] },
        { name: "系统设计", score: 76, category: "分析", confidence: 74, evidence: ["小组项目架构文档"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["人工智能", "校园产品", "开源"],
      potentialDirections: ["全栈开发", "系统架构", "数据服务"],
      evidenceCount: 3,
    },
    {
      userId: "ding-ruoxi",
      summary: "具备产品造型、手绘与材料工艺基础，能完成从草图到模型的表达。",
      skills: [
        { name: "产品造型", score: 82, category: "创意", confidence: 80, evidence: ["产品设计课程作业"] },
        { name: "手绘", score: 85, category: "创意", confidence: 82, evidence: ["方案草图与效果图"] },
        { name: "CMF", score: 74, category: "技术", confidence: 72, evidence: ["色彩与材料样本方案"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["产品创新", "可持续设计", "交互"],
      potentialDirections: ["产品设计", "可持续设计", "广告创意"],
      evidenceCount: 3,
    },
    {
      userId: "shen-yifan",
      summary: "具备商业分析与路演能力，能把技术方案转化为项目叙事。",
      skills: [
        { name: "商业分析", score: 83, category: "分析", confidence: 80, evidence: ["市场调研与竞品分析"] },
        { name: "财务测算", score: 78, category: "分析", confidence: 76, evidence: ["项目成本模型"] },
        { name: "路演", score: 84, category: "协作", confidence: 82, evidence: ["创新创业竞赛答辩"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["创新创业", "公益", "数据分析"],
      potentialDirections: ["商业计划", "项目运营", "社会创新"],
      evidenceCount: 3,
    },
    {
      userId: "weng-jia",
      summary: "具备双语写作与跨文化沟通能力，适合国际化、科普与传播类作品。",
      skills: [
        { name: "双语写作", score: 85, category: "创意", confidence: 82, evidence: ["中英双语采访稿"] },
        { name: "跨文化沟通", score: 80, category: "协作", confidence: 78, evidence: ["国际交流志愿经历"] },
        { name: "内容编辑", score: 78, category: "创意", confidence: 76, evidence: ["校园媒体编辑"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["国际传播", "教育", "播客"],
      potentialDirections: ["内容策划", "科普传播", "国际项目协调"],
      evidenceCount: 3,
    },
    {
      userId: "bai-mingyuan",
      summary: "具备材料表征与实验设计能力，适合有明确性能指标的新材料赛题。",
      skills: [
        { name: "材料表征", score: 84, category: "技术", confidence: 82, evidence: ["SEM 与 XRD 样品分析"] },
        { name: "实验设计", score: 80, category: "分析", confidence: 78, evidence: ["对照与重复实验设计"] },
        { name: "SEM", score: 76, category: "技术", confidence: 74, evidence: ["微观形貌成像"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["新能源材料", "仿生材料", "竞赛"],
      potentialDirections: ["材料研发", "失效分析", "实验数据管理"],
      evidenceCount: 3,
    },
    {
      userId: "qiu-yanan",
      summary: "具备细胞实验与数据整理经验，正在转向生物信息与医学影像方向。",
      skills: [
        { name: "细胞实验", score: 82, category: "技术", confidence: 80, evidence: ["细胞培养与观察"] },
        { name: "生物信息入门", score: 72, category: "探索", confidence: 70, evidence: ["课程数据练习"] },
        { name: "实验记录", score: 84, category: "协作", confidence: 80, evidence: ["实验记录与复现"] },
      ] as unknown as Prisma.InputJsonValue,
      interests: ["医学影像", "合成生物", "数据"],
      potentialDirections: ["医学影像分析", "实验数据管理", "生物信息"],
      evidenceCount: 3,
    },
  ];
  for (const profile of candidateProfiles) {
    const { userId, ...profileData } = profile;
    await prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: { userId, ...profileData, analysisMode: "rules" },
    });
  }
}

main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
