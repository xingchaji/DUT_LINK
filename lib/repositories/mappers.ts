import type { Prisma } from "@/generated/prisma/client";
import type { CommunityArticle, Notification, Opportunity, RecruitmentApplication, RecruitmentPost, TeamInvitation, UserAccountProfile } from "@/lib/types";

export const recruitmentInclude = {
  opportunity: true,
  owner: true,
  members: { include: { user: true } },
  _count: { select: { applications: true } },
} satisfies Prisma.RecruitmentPostInclude;

export const opportunityInclude = { publisher: true } satisfies Prisma.OpportunityInclude;

export type RecruitmentRow = Prisma.RecruitmentPostGetPayload<{ include: typeof recruitmentInclude }>;
export type OpportunityRow = Prisma.OpportunityGetPayload<{ include: typeof opportunityInclude }>;
export type ApplicationRow = Prisma.RecruitmentApplicationGetPayload<{ include: { applicant: true; recruitment: { include: { opportunity: true } } } }>;
export type InvitationRow = Prisma.TeamInvitationGetPayload<{ include: { sender: true; recipient: true; recruitment: { include: { opportunity: true } } } }>;
export type ArticleRow = Prisma.ArticleGetPayload<{ include: { author: true } }>;

function dateOnly(value?: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

export function toAccountProfile(user: { id: string; name: string; email: string; major: string | null; grade: string | null; contact: string | null; bio: string | null; skillTags: string[]; updatedAt: Date }): UserAccountProfile {
  return { userId: user.id, nickname: user.name, email: user.email, major: user.major ?? "", grade: user.grade ?? "", contact: user.contact ?? "", bio: user.bio ?? "", skills: user.skillTags, updatedAt: user.updatedAt.toISOString() };
}

export function toOpportunity(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    title: row.title,
    organizer: row.organizer,
    type: row.type as Opportunity["type"],
    status: row.status,
    deadline: row.deadline ?? "报名时间待补充",
    fit: row.fit,
    description: row.description,
    tags: row.tags,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    verifiedAt: dateOnly(row.verifiedAt) ?? "待核验",
    bonusPolicy: typeof row.bonusPolicy === "string" ? row.bonusPolicy : JSON.stringify(row.bonusPolicy ?? "待导入"),
    accent: row.accent,
    registrationStart: dateOnly(row.registrationStart),
    registrationEnd: dateOnly(row.registrationEnd),
    eventDate: dateOnly(row.eventDate),
    scope: row.scope as Opportunity["scope"],
    verification: row.verification as Opportunity["verification"],
    publisherId: row.publisherId,
    publisherName: row.publisher?.name,
  };
}

export function toRecruitment(row: RecruitmentRow): RecruitmentPost {
  return {
    id: row.id,
    opportunityId: row.opportunityId,
    opportunityTitle: row.opportunity.title,
    teamName: row.teamName,
    ownerName: row.owner.name,
    ownerId: row.ownerId,
    description: row.description ?? "",
    projectDirection: row.projectDirection ?? "",
    requirements: row.requirements,
    neededSkills: row.neededSkills,
    currentSize: row.members.length,
    capacity: row.capacity,
    contact: row.contact,
    members: row.members.map(({ user }) => ({ userId: user.id, name: user.name, major: user.major ?? "专业待补充", grade: user.grade ?? "年级待补充", skills: user.skillTags })),
    recruitmentDeadline: dateOnly(row.recruitmentDeadline)!,
    createdAt: row.createdAt.toISOString(),
    applicants: row._count.applications,
  };
}

export function toApplication(row: ApplicationRow): RecruitmentApplication & { teamName: string; opportunityTitle: string } {
  return { id: row.id, recruitmentId: row.recruitmentId, applicantId: row.applicantId, applicantName: row.applicant.name, applicantMajor: row.applicant.major ?? "专业待补充", message: row.message, status: row.status as RecruitmentApplication["status"], createdAt: row.createdAt.toISOString(), teamName: row.recruitment.teamName, opportunityTitle: row.recruitment.opportunity.title };
}

export function toInvitation(row: InvitationRow): TeamInvitation & { teamName: string; opportunityTitle: string } {
  return { id: row.id, recruitmentId: row.recruitmentId, opportunityId: row.opportunityId, senderId: row.senderId, senderName: row.sender.name, recipientId: row.recipientId, recipientName: row.recipient.name, message: row.message, status: row.status as TeamInvitation["status"], createdAt: row.createdAt.toISOString(), teamName: row.recruitment.teamName, opportunityTitle: row.recruitment.opportunity.title };
}

export function toArticle(row: ArticleRow): CommunityArticle {
  return { id: row.id, title: row.title, summary: row.summary, authorName: row.author.name, authorMajor: row.author.major ?? "专业待补充", bridge: row.bridge, createdAt: row.createdAt.toISOString() };
}

export function toNotification(row: { id: string; userId: string; type: string; title: string; body: string; relatedId: string; read: boolean; createdAt: Date }): Notification {
  return { ...row, type: row.type as Notification["type"], createdAt: row.createdAt.toISOString() };
}
