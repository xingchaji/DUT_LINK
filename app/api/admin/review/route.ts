import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/domain-error";
import { listPendingOpportunities } from "@/lib/repositories/opportunity-repository";
import { listArticles } from "@/lib/repositories/social-repository";

export async function GET() {
  try {
    await requireAdmin();
    const [pendingOpportunities, pendingArticles] = await Promise.all([listPendingOpportunities(), listArticles("pending")]);
    return NextResponse.json({ pendingOpportunities, pendingArticles });
  } catch (error) {
    return errorResponse(error);
  }
}
