import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listApplications } from "@/lib/repositories/team-repository";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后查看申请" }, { status: 401 });

  return NextResponse.json(await listApplications(user.id));
}
