import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/domain-error";
import { reviewOpportunity } from "@/lib/repositories/opportunity-repository";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = (await request.json()) as { decision?: "approved" | "rejected" };
    if (body.decision !== "approved" && body.decision !== "rejected") return NextResponse.json({ message: "无效的审核结果" }, { status: 400 });
    return NextResponse.json({ opportunity: await reviewOpportunity(id, body.decision) });
  } catch (error) {
    return errorResponse(error);
  }
}
