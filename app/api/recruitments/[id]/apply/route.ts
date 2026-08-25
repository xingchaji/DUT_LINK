import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { applyToRecruitment } from "@/lib/repositories/team-repository";
import { errorResponse } from "@/lib/domain-error";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后报名" }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json()) as { message?: string };
  try {
    const result = await applyToRecruitment(user, id, body.message);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
