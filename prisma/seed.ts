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
  const demoPasswordHashes = await Promise.all(Array.from({ length: 5 }, () => hashPassword("demo1234")));
  const users = [
    { id: "demo-user", email: "student@dlut.edu.cn", name: "陆同学", major: "软件工程", grade: "大一", contact: "dut-link-demo（微信）", bio: "正在探索 AI 应用、校园产品和跨专业竞赛合作。", skillTags: ["TypeScript", "React", "产品原型"], passwordHash: demoPasswordHashes[0] },
    { id: "lin-yi", email: "linyi@dlut.edu.cn", name: "林一", major: "视觉传达", grade: "大二", contact: "linyi_design（微信）", bio: "关注校园产品、品牌视觉和用户体验。", skillTags: ["UI 设计", "品牌视觉"], passwordHash: demoPasswordHashes[1] },
    { id: "chen-xi", email: "chenxi@dlut.edu.cn", name: "陈曦", major: "数字媒体", grade: "大二", contact: "chenxi_media（微信）", bio: "持续学习 Unity 与交互装置。", skillTags: ["Unity", "交互装置"], passwordHash: demoPasswordHashes[2] },
    { id: "zhou-yu", email: "zhouyu@dlut.edu.cn", name: "周宇", major: "建筑学", grade: "大三", contact: "zhouyu_space（微信）", bio: "擅长调研、建模与方案表达。", skillTags: ["数字建筑", "3D 建模"], passwordHash: demoPasswordHashes[3] },
    { id: "admin-user", email: "admin@dlut.edu.cn", name: "平台管理员", major: "平台运营", grade: null, contact: null, bio: "DUT Link 内容审核管理员。", skillTags: [], passwordHash: demoPasswordHashes[4], role: "admin" },
  ];
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
  await prisma.opportunityInterest.upsert({ where: { userId_opportunityId: { userId: "demo-user", opportunityId: "ccdc-2026" } }, update: {}, create: { userId: "demo-user", opportunityId: "ccdc-2026" } });
  await prisma.opportunityInterest.upsert({ where: { userId_opportunityId: { userId: "zhou-yu", opportunityId: "service-outsourcing-2026" } }, update: {}, create: { userId: "zhou-yu", opportunityId: "service-outsourcing-2026" } });
  await prisma.article.upsert({ where: { id: "seed-article-1" }, update: {}, create: { id: "seed-article-1", authorId: "zhou-yu", title: "为什么程序员应该了解建筑？", summary: "从空间动线、模块边界与人的尺度出发，重新理解软件架构。", bridge: "建筑 × 软件工程", status: "approved" } });
  await prisma.article.upsert({ where: { id: "seed-article-2" }, update: {}, create: { id: "seed-article-2", authorId: "chen-xi", title: "从竞赛答辩看工程表达", summary: "把技术方案讲清楚，是每个参赛者都需要补的一课。", bridge: "表达 × 工程", status: "pending" } });
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
