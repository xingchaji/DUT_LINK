import { matches } from "@/lib/mock-data";
import { store } from "@/lib/store";
import type { PersonProfile, TeamMemberSummary } from "@/lib/types";

export function findPersonProfile(userId: string): PersonProfile | undefined {
  const candidate = matches.find((item) => item.id === userId);
  if (candidate) return candidate;

  const account = store.accountProfiles.find((item) => item.userId === userId);
  if (!account) return undefined;
  return {
    id: account.userId,
    name: account.nickname,
    major: account.major,
    grade: account.grade,
    avatar: account.nickname.slice(0, 1) || "同",
    match: 0,
    tags: account.skills,
    reason: "个人主页公开资料",
    status: "DUT Link 用户",
    bio: account.bio || "这位同学还没有填写个人介绍。",
    contact: account.contact || "暂未公开联系方式",
    availability: "可在组队邀请中进一步沟通",
  };
}

export function getTeamMemberSummary(userId: string, fallback: { name: string; major?: string }): TeamMemberSummary {
  const person = findPersonProfile(userId);
  return person ? {
    userId: person.id,
    name: person.name,
    major: person.major,
    grade: person.grade,
    skills: person.tags,
  } : {
    userId,
    name: fallback.name,
    major: fallback.major ?? "专业待补充",
    grade: "年级待补充",
    skills: [],
  };
}
