import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { DomainError } from "@/lib/domain-error";
import { isRecruitmentActive } from "@/lib/matching";
import { matches } from "@/lib/mock-data";
import { getTeamMemberSummary } from "@/lib/people";
import { ensureUser } from "@/lib/repositories/account-repository";
import { recruitmentInclude, toApplication, toInvitation, toRecruitment } from "@/lib/repositories/mappers";
import { store } from "@/lib/store";
import type { RecruitmentApplication, RecruitmentPost, SessionUser, TeamInvitation } from "@/lib/types";

export async function findCompetitionMembership(userId: string, opportunityId: string) {
  const prisma = getPrisma();
  if (!prisma) {
    const owned = store.recruitments.find((post) => post.opportunityId === opportunityId && post.ownerId === userId);
    if (owned) return { recruitment: owned, role: "captain" as const };
    const memberOf = store.recruitments.find((post) => post.opportunityId === opportunityId && post.members.some((member) => member.userId === userId));
    return memberOf ? { recruitment: memberOf, role: "member" as const } : null;
  }
  const membership = await prisma.competitionMembership.findUnique({
    where: { userId_opportunityId: { userId, opportunityId } },
    include: { recruitment: { include: recruitmentInclude } },
  });
  return membership ? { recruitment: toRecruitment(membership.recruitment), role: membership.role === "captain" ? "captain" as const : "member" as const } : null;
}

export async function createRecruitment(user: SessionUser, post: RecruitmentPost) {
  const prisma = getPrisma();
  if (!prisma) { store.recruitments.unshift(post); return post; }
  await ensureUser(user);
  try {
    return await prisma.$transaction(async (tx) => {
      const membership = await tx.competitionMembership.findUnique({ where: { userId_opportunityId: { userId: user.id, opportunityId: post.opportunityId } } });
      if (membership) throw new DomainError(membership.role === "captain" ? "同一场比赛只能发布一个招募队伍" : "你已加入本场比赛的其他队伍，不能再创建队伍", 409);
      const opportunity = await tx.opportunity.findUnique({ where: { id: post.opportunityId } });
      if (!opportunity) throw new DomainError("比赛不存在", 404);
      const created = await tx.recruitmentPost.create({
        data: {
          id: post.id,
          opportunityId: post.opportunityId,
          ownerId: user.id,
          teamName: post.teamName,
          projectDirection: post.projectDirection || null,
          description: post.description || null,
          requirements: post.requirements,
          neededSkills: post.neededSkills,
          capacity: post.capacity,
          currentSize: 1,
          contact: post.contact,
          recruitmentDeadline: new Date(`${post.recruitmentDeadline}T23:59:59.000Z`),
          members: { create: { userId: user.id, opportunityId: post.opportunityId, role: "captain" } },
        },
        include: recruitmentInclude,
      });
      return toRecruitment(created);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof DomainError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new DomainError("同一场比赛只能加入或创建一支队伍", 409);
    throw error;
  }
}

export async function deleteRecruitment(userId: string, recruitmentId: string) {
  const prisma = getPrisma();
  if (!prisma) {
    const index = store.recruitments.findIndex((item) => item.id === recruitmentId);
    if (index < 0) throw new DomainError("队伍不存在", 404);
    if (store.recruitments[index].ownerId !== userId) throw new DomainError("只有队长可以删除队伍", 403);
    store.recruitments.splice(index, 1);
    for (let i = store.applications.length - 1; i >= 0; i -= 1) if (store.applications[i].recruitmentId === recruitmentId) store.applications.splice(i, 1);
    for (let i = store.invitations.length - 1; i >= 0; i -= 1) if (store.invitations[i].recruitmentId === recruitmentId) store.invitations.splice(i, 1);
    return;
  }
  const recruitment = await prisma.recruitmentPost.findUnique({ where: { id: recruitmentId }, select: { ownerId: true } });
  if (!recruitment) throw new DomainError("队伍不存在", 404);
  if (recruitment.ownerId !== userId) throw new DomainError("只有队长可以删除队伍", 403);
  await prisma.recruitmentPost.delete({ where: { id: recruitmentId } });
}

export async function listApplications(userId: string) {
  const prisma = getPrisma();
  if (!prisma) {
    const decorate = (application: RecruitmentApplication) => {
      const recruitment = store.recruitments.find((item) => item.id === application.recruitmentId);
      return { ...application, teamName: recruitment?.teamName ?? "未知队伍", opportunityTitle: recruitment?.opportunityTitle ?? "未知比赛" };
    };
    const ownedIds = new Set(store.recruitments.filter((item) => item.ownerId === userId).map((item) => item.id));
    return { sent: store.applications.filter((item) => item.applicantId === userId).map(decorate), received: store.applications.filter((item) => ownedIds.has(item.recruitmentId)).map(decorate) };
  }
  const include = { applicant: true, recruitment: { include: { opportunity: true } } } as const;
  const [sent, received] = await Promise.all([
    prisma.recruitmentApplication.findMany({ where: { applicantId: userId }, include, orderBy: { createdAt: "desc" } }),
    prisma.recruitmentApplication.findMany({ where: { recruitment: { ownerId: userId } }, include, orderBy: { createdAt: "desc" } }),
  ]);
  return { sent: sent.map(toApplication), received: received.map(toApplication) };
}

export async function applyToRecruitment(user: SessionUser, recruitmentId: string, message?: string) {
  const prisma = getPrisma();
  if (!prisma) {
    const recruitment = store.recruitments.find((item) => item.id === recruitmentId);
    if (!recruitment) throw new DomainError("招募信息不存在", 404);
    const membership = await findCompetitionMembership(user.id, recruitment.opportunityId);
    if (membership) throw new DomainError(membership.role === "captain" ? "你已经是本场比赛另一支队伍的队长" : "你已经加入本场比赛的一支队伍", 409);
    if (recruitment.ownerId === user.id) throw new DomainError("不能申请加入自己发布的队伍");
    if (!isRecruitmentActive(recruitment)) throw new DomainError(recruitment.currentSize >= recruitment.capacity ? "队伍人数已满" : "该队伍招募已经截止", 409);
    if (store.applications.some((item) => item.recruitmentId === recruitmentId && item.applicantId === user.id)) throw new DomainError("你已经报名过该队伍", 409);
    const account = store.accountProfiles.find((item) => item.userId === user.id);
    const application: RecruitmentApplication = { id: crypto.randomUUID(), recruitmentId, applicantId: user.id, applicantName: account?.nickname ?? user.name, applicantMajor: account?.major ?? user.major, message: message?.trim() || "希望加入队伍，一起完成项目。", status: "pending", createdAt: new Date().toISOString() };
    store.applications.push(application); recruitment.applicants += 1;
    store.notifications.push({ id: crypto.randomUUID(), userId: recruitment.ownerId, type: "application_received", title: "收到新申请", body: `${application.applicantName} 申请加入「${recruitment.teamName}」`, relatedId: application.id, read: false, createdAt: application.createdAt });
    return { application, applicants: recruitment.applicants };
  }
  await ensureUser(user);
  try {
    return await prisma.$transaction(async (tx) => {
      const recruitment = await tx.recruitmentPost.findUnique({ where: { id: recruitmentId }, include: { members: true, applications: true } });
      if (!recruitment) throw new DomainError("招募信息不存在", 404);
      if (recruitment.ownerId === user.id) throw new DomainError("不能申请加入自己发布的队伍");
      if (recruitment.recruitmentDeadline < new Date()) throw new DomainError("该队伍招募已经截止", 409);
      if (recruitment.members.length >= recruitment.capacity) throw new DomainError("队伍人数已满", 409);
      if (await tx.competitionMembership.findUnique({ where: { userId_opportunityId: { userId: user.id, opportunityId: recruitment.opportunityId } } })) throw new DomainError("你已经加入本场比赛的一支队伍", 409);
      if (recruitment.applications.some((item) => item.applicantId === user.id)) throw new DomainError("你已经报名过该队伍", 409);
      const application = await tx.recruitmentApplication.create({ data: { recruitmentId, applicantId: user.id, message: message?.trim() || "希望加入队伍，一起完成项目。" } });
      await tx.notification.create({ data: { userId: recruitment.ownerId, type: "application_received", title: "收到新申请", body: `${user.name} 申请加入「${recruitment.teamName}」`, relatedId: application.id } });
      return { application: { id: application.id, recruitmentId, applicantId: user.id, applicantName: user.name, applicantMajor: user.major, message: application.message, status: "pending" as const, createdAt: application.createdAt.toISOString() }, applicants: recruitment.applications.length + 1 };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof DomainError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new DomainError("你已经报名过该队伍", 409);
    throw error;
  }
}

export async function decideApplication(userId: string, applicationId: string, status: "accepted" | "rejected") {
  const prisma = getPrisma();
  if (!prisma) {
    const application = store.applications.find((item) => item.id === applicationId);
    if (!application) throw new DomainError("申请不存在", 404);
    const recruitment = store.recruitments.find((item) => item.id === application.recruitmentId);
    if (!recruitment || recruitment.ownerId !== userId) throw new DomainError("无权处理该申请", 403);
    if (application.status !== "pending") throw new DomainError("该申请已经处理", 409);
    if (status === "accepted" && recruitment.currentSize >= recruitment.capacity) throw new DomainError("队伍人数已满", 409);
    if (status === "accepted") {
      const membership = await findCompetitionMembership(application.applicantId, recruitment.opportunityId);
      if (membership && membership.recruitment.id !== recruitment.id) throw new DomainError("该申请人已经加入本场比赛的其他队伍", 409);
      recruitment.currentSize += 1;
      if (!recruitment.members.some((member) => member.userId === application.applicantId)) recruitment.members.push(getTeamMemberSummary(application.applicantId, { name: application.applicantName, major: application.applicantMajor }));
      for (const invitation of store.invitations) if (invitation.recipientId === application.applicantId && invitation.opportunityId === recruitment.opportunityId && invitation.status === "pending") invitation.status = "rejected";
      for (const other of store.applications) {
        const target = store.recruitments.find((item) => item.id === other.recruitmentId);
        if (other.id !== applicationId && other.applicantId === application.applicantId && other.status === "pending" && target?.opportunityId === recruitment.opportunityId) other.status = "rejected";
      }
    }
    application.status = status;
    store.notifications.push({ id: crypto.randomUUID(), userId: application.applicantId, type: status === "accepted" ? "application_accepted" : "application_rejected", title: status === "accepted" ? "申请已通过" : "申请未通过", body: status === "accepted" ? `你已成功加入「${recruitment.teamName}」` : `「${recruitment.teamName}」暂时没有接受你的申请`, relatedId: application.id, read: false, createdAt: new Date().toISOString() });
    return { application, teamSize: recruitment.currentSize };
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const application = await tx.recruitmentApplication.findUnique({ where: { id: applicationId }, include: { applicant: true, recruitment: { include: { members: true, opportunity: true } } } });
      if (!application) throw new DomainError("申请不存在", 404);
      if (application.recruitment.ownerId !== userId) throw new DomainError("无权处理该申请", 403);
      if (application.status !== "pending") throw new DomainError("该申请已经处理", 409);
      if (status === "accepted" && application.recruitment.members.length >= application.recruitment.capacity) throw new DomainError("队伍人数已满", 409);
      if (status === "accepted") {
        const existing = await tx.competitionMembership.findUnique({ where: { userId_opportunityId: { userId: application.applicantId, opportunityId: application.recruitment.opportunityId } } });
        if (existing && existing.recruitmentId !== application.recruitmentId) throw new DomainError("该申请人已经加入本场比赛的其他队伍", 409);
        if (!existing) await tx.competitionMembership.create({ data: { userId: application.applicantId, opportunityId: application.recruitment.opportunityId, recruitmentId: application.recruitmentId, role: "member" } });
        await tx.recruitmentPost.update({ where: { id: application.recruitmentId }, data: { currentSize: application.recruitment.members.length + 1 } });
        await tx.teamInvitation.updateMany({ where: { recipientId: application.applicantId, opportunityId: application.recruitment.opportunityId, status: "pending" }, data: { status: "rejected" } });
        await tx.recruitmentApplication.updateMany({ where: { id: { not: applicationId }, applicantId: application.applicantId, status: "pending", recruitment: { opportunityId: application.recruitment.opportunityId } }, data: { status: "rejected" } });
      }
      const updated = await tx.recruitmentApplication.update({ where: { id: applicationId }, data: { status } });
      await tx.notification.create({ data: { userId: application.applicantId, type: status === "accepted" ? "application_accepted" : "application_rejected", title: status === "accepted" ? "申请已通过" : "申请未通过", body: status === "accepted" ? `你已成功加入「${application.recruitment.teamName}」` : `「${application.recruitment.teamName}」暂时没有接受你的申请`, relatedId: application.id } });
      return { application: { id: updated.id, recruitmentId: updated.recruitmentId, applicantId: updated.applicantId, applicantName: application.applicant.name, applicantMajor: application.applicant.major ?? "专业待补充", message: updated.message, status: updated.status as RecruitmentApplication["status"], createdAt: updated.createdAt.toISOString() }, teamSize: status === "accepted" ? application.recruitment.members.length + 1 : application.recruitment.members.length };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof DomainError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new DomainError("该申请人已经加入本场比赛的其他队伍", 409);
    throw error;
  }
}

export async function listInvitations(userId: string) {
  const prisma = getPrisma();
  if (!prisma) {
    const decorate = (item: TeamInvitation) => { const recruitment = store.recruitments.find((post) => post.id === item.recruitmentId); return { ...item, teamName: recruitment?.teamName ?? "未知队伍", opportunityTitle: recruitment?.opportunityTitle ?? "未知比赛" }; };
    return { sent: store.invitations.filter((item) => item.senderId === userId).map(decorate), received: store.invitations.filter((item) => item.recipientId === userId).map(decorate) };
  }
  const include = { sender: true, recipient: true, recruitment: { include: { opportunity: true } } } as const;
  const [sent, received] = await Promise.all([
    prisma.teamInvitation.findMany({ where: { senderId: userId }, include, orderBy: { createdAt: "desc" } }),
    prisma.teamInvitation.findMany({ where: { recipientId: userId }, include, orderBy: { createdAt: "desc" } }),
  ]);
  return { sent: sent.map(toInvitation), received: received.map(toInvitation) };
}

export async function createInvitation(user: SessionUser, recipientId: string, opportunityId: string, message?: string) {
  const person = matches.find((item) => item.id === recipientId);
  if (!person) throw new DomainError("推荐用户不存在", 404);
  const prisma = getPrisma();
  if (!prisma) {
    const recruitment = store.recruitments.find((item) => item.ownerId === user.id && item.opportunityId === opportunityId);
    if (!recruitment) throw new DomainError("请先在本场比赛创建队伍，再发送邀请");
    if (!person.interestedOpportunityIds?.includes(recruitment.opportunityId)) throw new DomainError("该同学尚未表达本场比赛意向", 409);
    if (!isRecruitmentActive(recruitment)) throw new DomainError("当前队伍已满员或超过招募截止日期", 409);
    if (store.invitations.some((item) => item.recruitmentId === recruitment.id && item.recipientId === person.id && item.status === "pending")) throw new DomainError("已经向该同学发送过邀请", 409);
    const invitation: TeamInvitation = { id: crypto.randomUUID(), recruitmentId: recruitment.id, opportunityId, senderId: user.id, senderName: user.name, recipientId, recipientName: person.name, message: message?.trim() || `邀请你加入「${recruitment.teamName}」共同参赛。`, status: "pending", createdAt: new Date().toISOString() };
    store.invitations.unshift(invitation);
    store.notifications.push({ id: crypto.randomUUID(), userId: recipientId, type: "invitation_received", title: "收到组队邀请", body: `${user.name} 邀请你加入「${recruitment.teamName}」`, relatedId: invitation.id, read: false, createdAt: invitation.createdAt });
    return invitation;
  }
  await ensureUser(user);
  const recruitment = await prisma.recruitmentPost.findUnique({ where: { ownerId_opportunityId: { ownerId: user.id, opportunityId } }, include: { members: true } });
  if (!recruitment) throw new DomainError("请先在本场比赛创建队伍，再发送邀请");
  if (!person.interestedOpportunityIds?.includes(opportunityId)) throw new DomainError("该同学尚未表达本场比赛意向", 409);
  if (recruitment.recruitmentDeadline < new Date() || recruitment.members.length >= recruitment.capacity) throw new DomainError("当前队伍已满员或超过招募截止日期", 409);
  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  if (!recipient) throw new DomainError("推荐用户尚未同步到数据库，请先运行种子脚本", 409);
  if (await prisma.teamInvitation.findFirst({ where: { recruitmentId: recruitment.id, recipientId, status: "pending" } })) throw new DomainError("已经向该同学发送过邀请", 409);
  const invitation = await prisma.$transaction(async (tx) => {
    const created = await tx.teamInvitation.create({ data: { recruitmentId: recruitment.id, opportunityId, senderId: user.id, recipientId, message: message?.trim() || `邀请你加入「${recruitment.teamName}」共同参赛。` } });
    await tx.notification.create({ data: { userId: recipientId, type: "invitation_received", title: "收到组队邀请", body: `${user.name} 邀请你加入「${recruitment.teamName}」`, relatedId: created.id } });
    return created;
  });
  return { id: invitation.id, recruitmentId: invitation.recruitmentId, opportunityId, senderId: user.id, senderName: user.name, recipientId, recipientName: recipient.name, message: invitation.message, status: "pending" as const, createdAt: invitation.createdAt.toISOString() };
}

export async function decideInvitation(userId: string, invitationId: string, status: "accepted" | "rejected") {
  const prisma = getPrisma();
  if (!prisma) {
    const invitation = store.invitations.find((item) => item.id === invitationId);
    if (!invitation) throw new DomainError("邀请不存在", 404);
    if (invitation.recipientId !== userId) throw new DomainError("只有被邀请人可以处理该邀请", 403);
    if (invitation.status !== "pending") throw new DomainError("该邀请已经处理", 409);
    const recruitment = store.recruitments.find((item) => item.id === invitation.recruitmentId);
    if (!recruitment) throw new DomainError("队伍不存在", 404);
    if (status === "accepted") {
      if (!isRecruitmentActive(recruitment)) throw new DomainError(recruitment.currentSize >= recruitment.capacity ? "队伍人数已满" : "该队伍招募已经截止", 409);
      const membership = await findCompetitionMembership(userId, invitation.opportunityId);
      if (membership && membership.recruitment.id !== recruitment.id) throw new DomainError("你已经加入本场比赛的其他队伍", 409);
      if (!recruitment.members.some((member) => member.userId === userId)) {
        recruitment.members.push(getTeamMemberSummary(userId, { name: invitation.recipientName, major: "专业待补充" }));
        recruitment.currentSize += 1;
      }
      for (const item of store.invitations) if (item.id !== invitationId && item.recipientId === userId && item.opportunityId === invitation.opportunityId && item.status === "pending") item.status = "rejected";
      for (const application of store.applications) {
        const target = store.recruitments.find((item) => item.id === application.recruitmentId);
        if (application.applicantId === userId && application.status === "pending" && target?.opportunityId === invitation.opportunityId) application.status = "rejected";
      }
    }
    invitation.status = status;
    store.notifications.push({ id: crypto.randomUUID(), userId: invitation.senderId, type: status === "accepted" ? "invitation_accepted" : "invitation_rejected", title: status === "accepted" ? "组队邀请已接受" : "组队邀请未接受", body: status === "accepted" ? `${invitation.recipientName} 已加入「${recruitment.teamName}」` : `${invitation.recipientName} 没有接受「${recruitment.teamName}」的邀请`, relatedId: invitation.id, read: false, createdAt: new Date().toISOString() });
    return { invitation, teamSize: recruitment.currentSize };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const invitation = await tx.teamInvitation.findUnique({
        where: { id: invitationId },
        include: { sender: true, recipient: true, recruitment: { include: { members: true, opportunity: true } } },
      });
      if (!invitation) throw new DomainError("邀请不存在", 404);
      if (invitation.recipientId !== userId) throw new DomainError("只有被邀请人可以处理该邀请", 403);
      if (invitation.status !== "pending") throw new DomainError("该邀请已经处理", 409);

      let teamSize = invitation.recruitment.members.length;
      if (status === "accepted") {
        if (invitation.recruitment.recruitmentDeadline < new Date()) throw new DomainError("该队伍招募已经截止", 409);
        if (teamSize >= invitation.recruitment.capacity) throw new DomainError("队伍人数已满", 409);
        const existing = await tx.competitionMembership.findUnique({ where: { userId_opportunityId: { userId, opportunityId: invitation.opportunityId } } });
        if (existing && existing.recruitmentId !== invitation.recruitmentId) throw new DomainError("你已经加入本场比赛的其他队伍", 409);
        if (!existing) {
          await tx.competitionMembership.create({ data: { userId, opportunityId: invitation.opportunityId, recruitmentId: invitation.recruitmentId, role: "member" } });
          teamSize += 1;
          await tx.recruitmentPost.update({ where: { id: invitation.recruitmentId }, data: { currentSize: teamSize } });
        }
        await tx.teamInvitation.updateMany({ where: { id: { not: invitationId }, recipientId: userId, opportunityId: invitation.opportunityId, status: "pending" }, data: { status: "rejected" } });
        await tx.recruitmentApplication.updateMany({ where: { applicantId: userId, status: "pending", recruitment: { opportunityId: invitation.opportunityId } }, data: { status: "rejected" } });
      }

      const updated = await tx.teamInvitation.update({ where: { id: invitationId }, data: { status } });
      await tx.notification.create({
        data: {
          userId: invitation.senderId,
          type: status === "accepted" ? "invitation_accepted" : "invitation_rejected",
          title: status === "accepted" ? "组队邀请已接受" : "组队邀请未接受",
          body: status === "accepted" ? `${invitation.recipient.name} 已加入「${invitation.recruitment.teamName}」` : `${invitation.recipient.name} 没有接受「${invitation.recruitment.teamName}」的邀请`,
          relatedId: invitation.id,
        },
      });
      return {
        invitation: {
          id: updated.id,
          recruitmentId: updated.recruitmentId,
          opportunityId: updated.opportunityId,
          senderId: updated.senderId,
          senderName: invitation.sender.name,
          recipientId: updated.recipientId,
          recipientName: invitation.recipient.name,
          message: updated.message,
          status: updated.status as TeamInvitation["status"],
          createdAt: updated.createdAt.toISOString(),
        },
        teamSize,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof DomainError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new DomainError("你已经加入本场比赛的其他队伍", 409);
    throw error;
  }
}
