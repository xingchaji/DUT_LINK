import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import type { CommunityArticle } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ articles: store.articles });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后投稿" }, { status: 401 });
  const body = (await request.json()) as Partial<CommunityArticle>;
  if (!body.title?.trim() || !body.summary?.trim() || !body.bridge?.trim()) {
    return NextResponse.json({ message: "标题、摘要和跨域连接不能为空" }, { status: 400 });
  }
  const article: CommunityArticle = {
    id: crypto.randomUUID(),
    title: body.title.trim(),
    summary: body.summary.trim(),
    bridge: body.bridge.trim(),
    authorName: user.name,
    authorMajor: user.major,
    createdAt: new Date().toISOString(),
  };
  store.articles.unshift(article);
  return NextResponse.json({ article }, { status: 201 });
}
