import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { store } from "@/lib/store";
import type { GeneratedProfile, QuestionnaireInput, SessionUser, UserAccountProfile } from "@/lib/types";
import { toAccountProfile } from "@/lib/repositories/mappers";

export async function ensureUser(user: SessionUser) {
  const prisma = getPrisma();
  if (!prisma) return;
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email },
    create: { id: user.id, email: user.email, name: user.name, major: user.major, skillTags: [] },
  });
}

export async function getAccountProfile(user: SessionUser): Promise<UserAccountProfile> {
  const prisma = getPrisma();
  if (!prisma) return store.accountProfiles.find((item) => item.userId === user.id) ?? { userId: user.id, nickname: user.name, email: user.email, major: user.major, grade: "", contact: "", bio: "", skills: [], updatedAt: new Date().toISOString() };
  await ensureUser(user);
  const record = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  return toAccountProfile(record);
}

export async function getAccountProfileById(userId: string) {
  const prisma = getPrisma();
  if (!prisma) return store.accountProfiles.find((item) => item.userId === userId);
  const record = await prisma.user.findUnique({ where: { id: userId } });
  return record ? toAccountProfile(record) : undefined;
}

export async function saveAccountProfile(user: SessionUser, profile: UserAccountProfile) {
  const prisma = getPrisma();
  if (!prisma) {
    const index = store.accountProfiles.findIndex((item) => item.userId === user.id);
    if (index >= 0) store.accountProfiles[index] = profile; else store.accountProfiles.push(profile);
    for (const post of store.recruitments) {
      if (post.ownerId === user.id) post.ownerName = profile.nickname;
      const member = post.members.find((item) => item.userId === user.id);
      if (member) Object.assign(member, { name: profile.nickname, major: profile.major, grade: profile.grade, skills: profile.skills });
    }
    for (const application of store.applications.filter((item) => item.applicantId === user.id)) application.applicantName = profile.nickname;
    for (const invitation of store.invitations) {
      if (invitation.senderId === user.id) invitation.senderName = profile.nickname;
      if (invitation.recipientId === user.id) invitation.recipientName = profile.nickname;
    }
    for (const opportunity of store.opportunities.filter((item) => item.publisherId === user.id)) opportunity.publisherName = profile.nickname;
    return profile;
  }
  const record = await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email, name: profile.nickname, major: profile.major, grade: profile.grade || null, contact: profile.contact || null, bio: profile.bio || null, skillTags: profile.skills },
    create: { id: user.id, email: user.email, name: profile.nickname, major: profile.major, grade: profile.grade || null, contact: profile.contact || null, bio: profile.bio || null, skillTags: profile.skills },
  });
  return toAccountProfile(record);
}

export async function saveAbilityProfile(user: SessionUser, profile: GeneratedProfile, questionnaire?: QuestionnaireInput) {
  const prisma = getPrisma();
  if (!prisma) {
    store.abilityProfiles[user.id] = profile;
    return profile;
  }
  await ensureUser(user);
  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      summary: profile.summary,
      skills: profile.skills as unknown as Prisma.InputJsonValue,
      interests: profile.interests,
      potentialDirections: profile.potentialDirections,
      analysisMode: profile.analysisMode ?? "rules",
      evidenceCount: profile.evidenceCount ?? 0,
      assessmentAnswers: questionnaire ? questionnaire.answers as Prisma.InputJsonValue : undefined,
      version: { increment: 1 },
    },
    create: {
      userId: user.id,
      summary: profile.summary,
      skills: profile.skills as unknown as Prisma.InputJsonValue,
      interests: profile.interests,
      potentialDirections: profile.potentialDirections,
      analysisMode: profile.analysisMode ?? "rules",
      evidenceCount: profile.evidenceCount ?? 0,
      assessmentAnswers: questionnaire ? questionnaire.answers as Prisma.InputJsonValue : undefined,
    },
  });
  return profile;
}

export async function getAbilityProfile(userId: string): Promise<GeneratedProfile | null> {
  const prisma = getPrisma();
  if (!prisma) return store.abilityProfiles[userId] ?? null;
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile || !Array.isArray(profile.skills)) return null;
  return {
    summary: profile.summary,
    skills: profile.skills as GeneratedProfile["skills"],
    interests: profile.interests,
    potentialDirections: profile.potentialDirections,
    analysisMode: profile.analysisMode as GeneratedProfile["analysisMode"],
    evidenceCount: profile.evidenceCount,
  };
}
