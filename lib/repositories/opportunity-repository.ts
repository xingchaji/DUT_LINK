import { getPrisma } from "@/lib/db";
import { DomainError } from "@/lib/domain-error";
import { isRecruitmentActive } from "@/lib/matching";
import { ensureUser } from "@/lib/repositories/account-repository";
import { opportunityInclude, recruitmentInclude, toOpportunity, toRecruitment } from "@/lib/repositories/mappers";
import { store } from "@/lib/store";
import type { Opportunity, SessionUser } from "@/lib/types";

function parseDate(value?: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

export async function listOpportunities() {
  const prisma = getPrisma();
  if (!prisma) return store.opportunities.filter((item) => item.verification !== "pending" && item.verification !== "rejected");
  const rows = await prisma.opportunity.findMany({ where: { verification: { notIn: ["pending", "rejected"] } }, include: opportunityInclude });
  return rows.map(toOpportunity);
}

export async function listPendingOpportunities() {
  const prisma = getPrisma();
  if (!prisma) return store.opportunities.filter((item) => item.verification === "pending");
  const rows = await prisma.opportunity.findMany({ where: { verification: "pending" }, include: opportunityInclude, orderBy: { createdAt: "desc" } });
  return rows.map(toOpportunity);
}

export async function reviewOpportunity(opportunityId: string, decision: "approved" | "rejected") {
  const prisma = getPrisma();
  if (!prisma) {
    const opportunity = store.opportunities.find((item) => item.id === opportunityId);
    if (!opportunity) throw new DomainError("比赛不存在", 404);
    if (decision === "approved") {
      opportunity.verification = "campus-verified";
      opportunity.verifiedAt = new Date().toISOString().slice(0, 10);
      opportunity.status = "校内组织已核验";
    } else {
      opportunity.verification = "rejected";
      opportunity.status = "校内用户发布 · 未通过核验";
    }
    return opportunity;
  }
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) throw new DomainError("比赛不存在", 404);
  const updated = await prisma.opportunity.update({
    where: { id: opportunityId },
    data: decision === "approved"
      ? { verification: "campus-verified", verifiedAt: new Date(), status: "校内组织已核验" }
      : { verification: "rejected", status: "校内用户发布 · 未通过核验" },
    include: opportunityInclude,
  });
  if (opportunity.publisherId) {
    await prisma.notification.create({ data: { userId: opportunity.publisherId, type: decision === "approved" ? "opportunity_approved" : "opportunity_rejected", title: decision === "approved" ? "比赛已通过审核" : "比赛未通过审核", body: decision === "approved" ? `「${opportunity.title}」已公开发布` : `「${opportunity.title}」未通过核验`, relatedId: opportunityId } });
  }
  return toOpportunity(updated);
}

export async function findOpportunity(id: string) {
  const prisma = getPrisma();
  if (!prisma) return store.opportunities.find((item) => item.id === id);
  const row = await prisma.opportunity.findUnique({ where: { id }, include: opportunityInclude });
  return row ? toOpportunity(row) : undefined;
}

export async function createOpportunity(opportunity: Opportunity, publisher: SessionUser) {
  const prisma = getPrisma();
  if (!prisma) { store.opportunities.push(opportunity); return opportunity; }
  await ensureUser(publisher);
  const row = await prisma.opportunity.create({
    data: {
      id: opportunity.id,
      title: opportunity.title,
      organizer: opportunity.organizer,
      type: opportunity.type,
      description: opportunity.description,
      sourceName: opportunity.sourceName,
      sourceUrl: opportunity.sourceUrl,
      status: opportunity.status,
      deadline: opportunity.deadline,
      registrationStart: parseDate(opportunity.registrationStart),
      registrationEnd: parseDate(opportunity.registrationEnd),
      eventDate: parseDate(opportunity.eventDate),
      scope: opportunity.scope ?? "全国",
      verification: opportunity.verification ?? "pending",
      tags: opportunity.tags,
      fit: opportunity.fit,
      accent: opportunity.accent,
      bonusPolicy: opportunity.bonusPolicy,
      verifiedAt: opportunity.verifiedAt && /^\d{4}-\d{2}-\d{2}$/.test(opportunity.verifiedAt) ? parseDate(opportunity.verifiedAt) : null,
      publisherId: publisher.id,
    },
    include: opportunityInclude,
  });
  return toOpportunity(row);
}

export async function listActiveRecruitments(opportunityId?: string) {
  const prisma = getPrisma();
  if (!prisma) return store.recruitments.filter((post) => (!opportunityId || post.opportunityId === opportunityId) && isRecruitmentActive(post));
  const rows = await prisma.recruitmentPost.findMany({
    where: { opportunityId, recruitmentDeadline: { gte: new Date() } },
    include: recruitmentInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toRecruitment).filter((post) => isRecruitmentActive(post));
}

export async function findRecruitment(id: string) {
  const prisma = getPrisma();
  if (!prisma) return store.recruitments.find((item) => item.id === id);
  const row = await prisma.recruitmentPost.findUnique({ where: { id }, include: recruitmentInclude });
  return row ? toRecruitment(row) : undefined;
}

export async function findOwnedRecruitment(ownerId: string, opportunityId: string) {
  const prisma = getPrisma();
  if (!prisma) return store.recruitments.find((item) => item.ownerId === ownerId && item.opportunityId === opportunityId);
  const row = await prisma.recruitmentPost.findUnique({ where: { ownerId_opportunityId: { ownerId, opportunityId } }, include: recruitmentInclude });
  return row ? toRecruitment(row) : undefined;
}

export async function listOpportunityInterests(userId: string) {
  const prisma = getPrisma();
  if (!prisma) return store.opportunityInterests.filter((item) => item.userId === userId).map((item) => item.opportunityId);
  return (await prisma.opportunityInterest.findMany({ where: { userId }, select: { opportunityId: true } })).map((item) => item.opportunityId);
}

export async function setOpportunityInterest(user: SessionUser, opportunityId: string, intended: boolean) {
  const prisma = getPrisma();
  if (!prisma) {
    const index = store.opportunityInterests.findIndex((item) => item.userId === user.id && item.opportunityId === opportunityId);
    if (intended && index < 0) store.opportunityInterests.push({ userId: user.id, opportunityId, createdAt: new Date().toISOString() });
    if (!intended && index >= 0) store.opportunityInterests.splice(index, 1);
    return;
  }
  await ensureUser(user);
  if (intended) await prisma.opportunityInterest.upsert({ where: { userId_opportunityId: { userId: user.id, opportunityId } }, update: {}, create: { userId: user.id, opportunityId } });
  else await prisma.opportunityInterest.deleteMany({ where: { userId: user.id, opportunityId } });
}
