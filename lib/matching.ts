import { demoProfile, matches } from "@/lib/mock-data";
import type { GeneratedProfile, Opportunity, PersonMatch, RecruitmentCandidateProfile, RecruitmentPost } from "@/lib/types";

const candidateSignals: Record<string, { skills: string[]; interests: string[]; majorFamily: string }> = {
  "lin-yi": { skills: ["UI 设计", "视觉表达", "用户研究"], interests: ["校园创新", "人工智能", "视觉叙事"], majorFamily: "设计" },
  "zhou-yu": { skills: ["空间设计", "3D 建模", "项目实践"], interests: ["独立游戏", "数字建筑", "人工智能"], majorFamily: "建筑" },
  "chen-xi": { skills: ["游戏开发", "视觉表达", "交互设计"], interests: ["独立游戏", "人工智能", "交互装置"], majorFamily: "数字媒体" },
};

function overlap(a: string[], b: string[]) {
  const normalized = new Set(a.map((item) => item.toLowerCase()));
  return b.filter((item) => normalized.has(item.toLowerCase())).length;
}

const relatedTerms = [
  ["用户调研", "用户研究", "用户访谈", "问卷", "调研"],
  ["视觉设计", "视觉表达", "UI 设计", "品牌视觉", "排版"],
  ["前端", "React", "TypeScript", "页面", "交互开发"],
  ["三维", "3D 建模", "数字建筑", "空间设计", "建模"],
  ["交互设计", "交互装置", "Unity", "游戏开发"],
];

function isRelated(left: string, right: string) {
  const a = left.toLowerCase();
  const b = right.toLowerCase();
  if (a.includes(b) || b.includes(a)) return true;
  return relatedTerms.some((group) => group.some((term) => a.includes(term.toLowerCase())) && group.some((term) => b.includes(term.toLowerCase())));
}

const timeKeywords = ["工作日", "周中", "晚间", "晚上", "周末", "周六", "周日", "灵活", "随时", "空闲", "假期"];

function availabilityOverlap(candidate?: string, expected?: string) {
  if (!candidate || !expected) return 0;
  const a = candidate.toLowerCase();
  const b = expected.toLowerCase();
  return timeKeywords.filter((keyword) => a.includes(keyword) && b.includes(keyword)).length;
}

export function rankPeople(profile: GeneratedProfile = demoProfile): PersonMatch[] {
  const userSkills = profile.skills.map((skill) => skill.name);
  return matches
    .map((person) => {
      const signals = candidateSignals[person.id];
      const sharedCount = overlap(profile.interests, signals.interests);
      const skillOverlap = overlap(userSkills, signals.skills);
      const complementarity = Math.min(100, 76 + signals.skills.length * 6 - skillOverlap * 5);
      const sharedInterests = Math.min(100, 58 + sharedCount * 18);
      const crossDiscipline = signals.majorFamily === "软件" ? 60 : 96;
      const match = Math.round(complementarity * 0.5 + sharedInterests * 0.3 + crossDiscipline * 0.2);
      return {
        ...person,
        match,
        reason: `技能互补 ${complementarity}% · 兴趣桥接 ${sharedInterests}% · 跨专业价值 ${crossDiscipline}%`,
        scoreBreakdown: { complementarity, sharedInterests, crossDiscipline },
      };
    })
    .sort((a, b) => b.match - a.match);
}

export function rankPeopleForOpportunity(opportunity: Opportunity): PersonMatch[] {
  return matches
    .filter((person) => person.interestedOpportunityIds?.includes(opportunity.id))
    .map((person) => {
      const signals = candidateSignals[person.id];
      const relevant = [...signals.skills, ...signals.interests].filter((signal) => opportunity.tags.some((tag) => signal.includes(tag) || tag.includes(signal)));
      const skillFit = Math.min(100, 66 + relevant.length * 12);
      const teamValue = Math.min(100, 78 + signals.skills.length * 5);
      const crossDiscipline = signals.majorFamily === "软件" ? 62 : 94;
      const match = Math.round(skillFit * 0.5 + teamValue * 0.3 + crossDiscipline * 0.2);
      return {
        ...person,
        match,
        reason: relevant.length ? `已表达参赛意向 · 相关能力：${relevant.slice(0, 3).join("、")}` : `已表达参赛意向，并能提供跨专业视角`,
        scoreBreakdown: { complementarity: teamValue, sharedInterests: skillFit, crossDiscipline },
      };
    })
    .sort((a, b) => b.match - a.match);
}

export function rankPeopleForRecruitment(opportunity: Opportunity, recruitment: RecruitmentPost, candidates: RecruitmentCandidateProfile[] = matches): PersonMatch[] {
  const hasDetailedNeeds = recruitment.neededSkills.length > 0 && recruitment.requirements.trim().length >= 8;
  const interested = candidates.filter((person) => person.interestedOpportunityIds?.includes(opportunity.id));

  return interested
    .map((person) => {
      const fallbackSignals = candidateSignals[person.id] ?? { skills: person.tags, interests: [], majorFamily: person.major };
      const profileSkills = person.abilityProfile?.skills.map((skill) => skill.name) ?? [];
      const profileInterests = person.abilityProfile?.interests ?? [];
      const signals = {
        skills: [...new Set([...fallbackSignals.skills, ...profileSkills])],
        interests: [...new Set([...fallbackSignals.interests, ...profileInterests])],
        majorFamily: fallbackSignals.majorFamily,
      };
      const abilitySignals = [...new Set([...person.tags, ...signals.skills])];
      const matchedSkills = abilitySignals.filter((signal) => recruitment.neededSkills.some((need) => isRelated(signal, need)));
      const requirementMatches = abilitySignals.filter((signal) => isRelated(signal, recruitment.requirements));
      const opportunityMatches = [...abilitySignals, ...signals.interests].filter((signal) => opportunity.tags.some((tag) => isRelated(signal, tag)));
      const intentScore = person.interestedOpportunityIds?.includes(opportunity.id) ? 100 : 45;
      const needScore = hasDetailedNeeds ? Math.min(100, 54 + matchedSkills.length * 24 + requirementMatches.length * 14) : Math.min(90, 58 + opportunityMatches.length * 12);
      const profileScore = Math.min(100, 68 + abilitySignals.length * 4 + opportunityMatches.length * 8);
      const hasExpectedAvailability = Boolean(recruitment.expectedAvailability?.trim());
      const timeOverlap = availabilityOverlap(person.availability, recruitment.expectedAvailability);
      const timeFit = hasExpectedAvailability ? Math.min(100, 55 + timeOverlap * 22) : 70;
      const match = hasExpectedAvailability
        ? Math.round(intentScore * 0.3 + needScore * 0.4 + profileScore * 0.2 + timeFit * 0.1)
        : Math.round(intentScore * 0.3 + needScore * 0.45 + profileScore * 0.25);
      const reasons = ["已表达本场参赛意向"];
      if (matchedSkills.length) reasons.push(`招募技能命中：${matchedSkills.slice(0, 2).join("、")}`);
      if (requirementMatches.length) reasons.push(`招募要求相关：${requirementMatches.slice(0, 2).join("、")}`);
      if (!matchedSkills.length && opportunityMatches.length) reasons.push(`赛事方向相关：${opportunityMatches.slice(0, 2).join("、")}`);
      if (hasExpectedAvailability && timeOverlap > 0) reasons.push(`可用时间契合：${recruitment.expectedAvailability}`);
      if (reasons.length === 1) reasons.push(`能力画像提供${signals.majorFamily}视角`);
      return {
        id: person.id,
        name: person.name,
        major: person.major,
        grade: person.grade,
        avatar: person.avatar,
        tags: person.tags,
        status: person.status,
        interestedOpportunityIds: person.interestedOpportunityIds,
        match,
        reason: reasons.join("；"),
        scoreBreakdown: { complementarity: needScore, sharedInterests: intentScore, crossDiscipline: profileScore },
      };
    })
    .sort((a, b) => b.match - a.match);
}

export function isRecruitmentActive(post: RecruitmentPost, now = new Date()) {
  const end = new Date(`${post.recruitmentDeadline}T23:59:59`);
  return Number.isFinite(end.getTime()) && end >= now && post.currentSize < post.capacity;
}
