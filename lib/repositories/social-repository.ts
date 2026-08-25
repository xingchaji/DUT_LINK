import { getPrisma } from "@/lib/db";
import { DomainError } from "@/lib/domain-error";
import { ensureUser } from "@/lib/repositories/account-repository";
import { toArticle, toNotification } from "@/lib/repositories/mappers";
import { store } from "@/lib/store";
import type { CommunityArticle, SessionUser } from "@/lib/types";

export async function listArticles(status: "approved" | "pending" | "rejected" = "approved") {
  const prisma = getPrisma();
  if (!prisma) return store.articles.filter((item) => item.status === status);
  return (await prisma.article.findMany({ where: { status }, include: { author: true }, orderBy: { createdAt: "desc" } })).map(toArticle);
}

export async function createArticle(user: SessionUser, article: CommunityArticle) {
  const prisma = getPrisma();
  if (!prisma) { store.articles.unshift(article); return article; }
  await ensureUser(user);
  const row = await prisma.article.create({ data: { id: article.id, authorId: user.id, title: article.title, summary: article.summary, bridge: article.bridge, status: article.status }, include: { author: true } });
  return toArticle(row);
}

export async function reviewArticle(articleId: string, decision: "approved" | "rejected") {
  const prisma = getPrisma();
  if (!prisma) {
    const article = store.articles.find((item) => item.id === articleId);
    if (!article) throw new DomainError("文章不存在", 404);
    article.status = decision;
    return article;
  }
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw new DomainError("文章不存在", 404);
  const updated = await prisma.article.update({ where: { id: articleId }, data: { status: decision }, include: { author: true } });
  await prisma.notification.create({ data: { userId: article.authorId, type: decision === "approved" ? "article_approved" : "article_rejected", title: decision === "approved" ? "文章已通过审核" : "文章未通过审核", body: decision === "approved" ? `「${article.title}」已公开发布` : `「${article.title}」未通过审核`, relatedId: articleId } });
  return toArticle(updated);
}

export async function listNotifications(userId: string) {
  const prisma = getPrisma();
  if (!prisma) return store.notifications.filter((item) => item.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30);
  return (await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 30 })).map(toNotification);
}

export async function markAllNotificationsRead(userId: string) {
  const prisma = getPrisma();
  if (!prisma) { store.notifications.filter((item) => item.userId === userId).forEach((item) => { item.read = true; }); return; }
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const prisma = getPrisma();
  if (!prisma) {
    const item = store.notifications.find((notification) => notification.id === notificationId && notification.userId === userId);
    if (!item) throw new DomainError("通知不存在", 404);
    item.read = true; return;
  }
  const result = await prisma.notification.updateMany({ where: { id: notificationId, userId }, data: { read: true } });
  if (!result.count) throw new DomainError("通知不存在", 404);
}
