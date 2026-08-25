import { describe, expect, it } from "vitest";
import { isRecruitmentActive, rankPeople, rankPeopleForRecruitment } from "@/lib/matching";
import { opportunities } from "@/lib/mock-data";
import type { RecruitmentPost } from "@/lib/types";

function makePost(overrides: Partial<RecruitmentPost> = {}): RecruitmentPost {
  return {
    id: "post-1",
    opportunityId: "ccdc-2026",
    opportunityTitle: "2026 中国大学生计算机设计大赛",
    teamName: "测试队伍",
    ownerName: "测试队长",
    ownerId: "demo-user",
    description: "",
    requirements: "能够独立完成 React 页面",
    neededSkills: ["React", "交互设计"],
    currentSize: 1,
    capacity: 4,
    contact: "test",
    members: [],
    recruitmentDeadline: "2099-01-01",
    createdAt: new Date().toISOString(),
    applicants: 0,
    ...overrides,
  };
}

describe("rankPeople", () => {
  it("返回按匹配度降序排列的候选列表", () => {
    const people = rankPeople();
    expect(people.length).toBeGreaterThan(0);
    for (let i = 1; i < people.length; i += 1) {
      expect(people[i - 1].match).toBeGreaterThanOrEqual(people[i].match);
    }
  });

  it("匹配分数落在 0–100 区间且带分项拆解", () => {
    for (const person of rankPeople()) {
      expect(person.match).toBeGreaterThanOrEqual(0);
      expect(person.match).toBeLessThanOrEqual(100);
      expect(person.scoreBreakdown).toBeDefined();
      expect(person.scoreBreakdown!.complementarity).toBeGreaterThanOrEqual(0);
      expect(person.scoreBreakdown!.sharedInterests).toBeGreaterThanOrEqual(0);
      expect(person.scoreBreakdown!.crossDiscipline).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("rankPeopleForRecruitment", () => {
  const opportunity = opportunities.find((item) => item.id === "ccdc-2026")!;

  it("返回带命中理由和分项拆解的排序结果", () => {
    const people = rankPeopleForRecruitment(opportunity, makePost());
    expect(people.length).toBeGreaterThan(0);
    for (const person of people) {
      expect(person.reason.length).toBeGreaterThan(0);
      expect(person.scoreBreakdown).toBeDefined();
      expect(person.match).toBeGreaterThanOrEqual(0);
      expect(person.match).toBeLessThanOrEqual(100);
    }
  });

  it("表达意向的候选人优先（意向分数更高）", () => {
    const people = rankPeopleForRecruitment(opportunity, makePost());
    const interested = people.filter((person) => person.interestedOpportunityIds?.includes("ccdc-2026"));
    const notInterested = people.filter((person) => !person.interestedOpportunityIds?.includes("ccdc-2026"));
    for (const a of interested) {
      for (const b of notInterested) {
        expect(a.match).toBeGreaterThanOrEqual(b.match);
      }
    }
  });

  it("填写期望可用时间后，时间契合的候选人获得命中理由", () => {
    const people = rankPeopleForRecruitment(opportunity, makePost({ expectedAvailability: "周末" }));
    const weekendPeople = people.filter((person) => ["lin-yi", "zhou-yu"].includes(person.id));
    expect(weekendPeople.length).toBeGreaterThan(0);
    for (const person of weekendPeople) {
      expect(person.reason).toContain("可用时间契合");
    }
  });
});

describe("isRecruitmentActive", () => {
  it("未过期且未满员时返回 true", () => {
    expect(isRecruitmentActive(makePost())).toBe(true);
  });

  it("超过招募截止日期返回 false", () => {
    expect(isRecruitmentActive(makePost({ recruitmentDeadline: "2000-01-01" }))).toBe(false);
  });

  it("队伍满员返回 false", () => {
    expect(isRecruitmentActive(makePost({ currentSize: 4, capacity: 4 }))).toBe(false);
  });
});
