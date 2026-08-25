import { describe, expect, it } from "vitest";
import { generateQuestionnaireProfile, profileQuestions } from "@/lib/questionnaire";
import type { QuestionnaireDimension } from "@/lib/types";

const dimensions: QuestionnaireDimension[] = ["问题解决", "调研表达", "竞赛经验", "项目交付"];

function answersWith(value: number) {
  const answers: Record<string, number> = {};
  for (const question of profileQuestions) answers[question.id] = value;
  return answers;
}

describe("generateQuestionnaireProfile", () => {
  it("为四个维度各生成一项技能", () => {
    const profile = generateQuestionnaireProfile({ name: "测试", major: "软件工程", grade: "大二", answers: answersWith(3), interests: ["人工智能"] });
    expect(profile.skills).toHaveLength(4);
    for (const dimension of dimensions) {
      expect(profile.skills.some((skill) => skill.name === dimension)).toBe(true);
    }
  });

  it("分数落在 10–100 区间", () => {
    const profile = generateQuestionnaireProfile({ name: "测试", major: "软件工程", grade: "大二", answers: answersWith(3), interests: [] });
    for (const skill of profile.skills) {
      expect(skill.score).toBeGreaterThanOrEqual(10);
      expect(skill.score).toBeLessThanOrEqual(100);
    }
  });

  it("答案越高得分越高", () => {
    const low = generateQuestionnaireProfile({ name: "测试", major: "软件工程", grade: "大二", answers: answersWith(1), interests: [] });
    const high = generateQuestionnaireProfile({ name: "测试", major: "软件工程", grade: "大二", answers: answersWith(5), interests: [] });
    for (const dimension of dimensions) {
      const lowScore = low.skills.find((skill) => skill.name === dimension)!.score;
      const highScore = high.skills.find((skill) => skill.name === dimension)!.score;
      expect(highScore).toBeGreaterThan(lowScore);
    }
  });

  it("缺少答案时默认按最低档计算", () => {
    const empty = generateQuestionnaireProfile({ name: "测试", major: "软件工程", grade: "大二", answers: {}, interests: [] });
    const allLow = generateQuestionnaireProfile({ name: "测试", major: "软件工程", grade: "大二", answers: answersWith(1), interests: [] });
    expect(empty.skills).toEqual(allLow.skills);
  });

  it("summary 包含专业和最强的两个维度", () => {
    const profile = generateQuestionnaireProfile({ name: "测试", major: "软件工程", grade: "大二", answers: answersWith(4), interests: [] });
    expect(profile.summary).toContain("软件工程");
    const strongest = [...profile.skills].sort((a, b) => b.score - a.score).slice(0, 2).map((skill) => skill.name);
    for (const name of strongest) expect(profile.summary).toContain(name);
  });

  it("补充证据会提高置信度并计入证据数", () => {
    const without = generateQuestionnaireProfile({ name: "测试", major: "软件工程", grade: "大二", answers: answersWith(3), interests: [] });
    const withEvidence = generateQuestionnaireProfile({ name: "测试", major: "软件工程", grade: "大二", answers: answersWith(3), interests: [], evidence: "一篇完整项目复盘" });
    expect(withEvidence.evidenceCount).toBe((without.evidenceCount ?? 0) + 1);
    expect(withEvidence.skills[0].confidence).toBeGreaterThan(without.skills[0].confidence!);
  });
});
