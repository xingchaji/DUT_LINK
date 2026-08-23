import { NextResponse } from "next/server";
import { analyzeProfile, analyzeQuestionnaireProfile, getAIStatus } from "@/lib/ai";
import type { ProfileInput } from "@/lib/types";
import type { QuestionnaireInput } from "@/lib/types";
import { profileQuestions } from "@/lib/questionnaire";

export async function GET() {
  return NextResponse.json(getAIStatus());
}

export async function POST(request: Request) {
  const body = (await request.json()) as { mode?: string };

  if (body.mode === "questionnaire") {
    const input = body as Partial<QuestionnaireInput> & { mode: string };
    if (!input.major || !input.answers || !Array.isArray(input.interests) || input.interests.length === 0) {
      return NextResponse.json({ message: "请完成基本信息、全部题目并至少选择一个兴趣" }, { status: 400 });
    }
    const complete = profileQuestions.every((question) => Number.isInteger(input.answers?.[question.id]) && Number(input.answers?.[question.id]) >= 1 && Number(input.answers?.[question.id]) <= 5);
    if (!complete) return NextResponse.json({ message: `请完成全部 ${profileQuestions.length} 道竞赛能力调查题` }, { status: 400 });
    return NextResponse.json(await analyzeQuestionnaireProfile({ name: input.name ?? "新同学", major: input.major, grade: input.grade ?? "", answers: input.answers, interests: input.interests, evidence: input.evidence }));
  }

  const input = body as Partial<ProfileInput>;

  if (!input.major || !input.experiences) {
    return NextResponse.json({ message: "请填写专业和至少一段经历" }, { status: 400 });
  }

  return NextResponse.json(
    await analyzeProfile({
      name: input.name ?? "新同学",
      major: input.major,
      grade: input.grade ?? "",
      bio: input.bio ?? "",
      experiences: input.experiences,
      interests: input.interests ?? "",
      awards: input.awards ?? "",
      achievements: input.achievements ?? "",
      githubRepos: input.githubRepos ?? "",
    }),
  );
}
