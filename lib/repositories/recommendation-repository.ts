import { getPrisma } from "@/lib/db";
import { matches } from "@/lib/mock-data";
import type { GeneratedProfile, RecruitmentCandidateProfile } from "@/lib/types";

export async function listRecruitmentCandidates(opportunityId: string, excludedUserIds: string[]): Promise<RecruitmentCandidateProfile[]> {
  const prisma = getPrisma();
  if (!prisma) return matches.filter((person) => person.interestedOpportunityIds?.includes(opportunityId) && !excludedUserIds.includes(person.id));

  const users = await prisma.user.findMany({
    where: {
      role: "student",
      id: { notIn: excludedUserIds },
      competitionMemberships: { none: { opportunityId } },
      opportunityInterests: { some: { opportunityId } },
    },
    include: {
      profile: true,
      opportunityInterests: { select: { opportunityId: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return users.map((user) => {
    const abilityProfile: GeneratedProfile | null = user.profile && Array.isArray(user.profile.skills)
      ? {
          summary: user.profile.summary,
          skills: user.profile.skills as GeneratedProfile["skills"],
          interests: user.profile.interests,
          potentialDirections: user.profile.potentialDirections,
          analysisMode: user.profile.analysisMode as GeneratedProfile["analysisMode"],
          evidenceCount: user.profile.evidenceCount,
        }
      : null;
    const profileSkillNames = abilityProfile?.skills.map((skill) => skill.name) ?? [];
    return {
      id: user.id,
      name: user.name,
      major: user.major ?? "专业未填写",
      grade: user.grade ?? "年级未填写",
      avatar: user.name.slice(0, 1) || "同",
      match: 0,
      tags: [...new Set([...user.skillTags, ...profileSkillNames])].slice(0, 8),
      reason: "等待匹配分析",
      status: user.bio || "愿意了解合适的竞赛组队机会",
      interestedOpportunityIds: user.opportunityInterests.map((item) => item.opportunityId),
      bio: user.bio ?? "",
      contact: user.contact ?? "通过站内邀请联系",
      availability: "时间待沟通",
      abilityProfile,
    };
  });
}
