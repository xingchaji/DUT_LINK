import { generateProfile } from "@/lib/profile-generator";
import { rankPeopleForRecruitment } from "@/lib/matching";
import { discoveries } from "@/lib/mock-data";
import { generateQuestionnaireProfile } from "@/lib/questionnaire";
import type { Discovery, GeneratedProfile, Opportunity, PersonMatch, ProfileInput, QuestionnaireInput, RecruitmentPost, Skill, UserAccountProfile } from "@/lib/types";

type ChatCompletion = {
  choices?: Array<{ message?: { content?: string } }>;
};

function aiConfigured() {
  return Boolean(process.env.AI_API_KEY && process.env.AI_BASE_URL && process.env.AI_MODEL);
}

async function requestJson<T>(system: string, user: string): Promise<T> {
  const baseUrl = process.env.AI_BASE_URL?.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) throw new Error(`AI service returned ${response.status}`);
  const data = (await response.json()) as ChatCompletion;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI service returned an empty response");
  return JSON.parse(content) as T;
}

function validSkill(value: unknown): value is Skill {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Skill>;
  return typeof item.name === "string" && typeof item.score === "number" && ["技术", "创意", "协作", "探索"].includes(item.category ?? "");
}

function validateProfile(value: unknown): GeneratedProfile | null {
  if (!value || typeof value !== "object") return null;
  const profile = value as Partial<GeneratedProfile>;
  if (typeof profile.summary !== "string" || !Array.isArray(profile.skills) || !profile.skills.every(validSkill)) return null;
  if (!Array.isArray(profile.interests) || !Array.isArray(profile.potentialDirections)) return null;
  return {
    summary: profile.summary,
    skills: profile.skills.slice(0, 6).map((skill) => ({
      ...skill,
      score: Math.max(0, Math.min(100, skill.score)),
      confidence: Math.max(0, Math.min(100, skill.confidence ?? 60)),
      evidence: skill.evidence?.slice(0, 4) ?? [],
    })),
    interests: profile.interests.slice(0, 8),
    potentialDirections: profile.potentialDirections.slice(0, 4),
    analysisMode: "ai",
    evidenceCount: profile.skills.reduce((total, skill) => total + (skill.evidence?.length ?? 0), 0),
  };
}

export async function analyzeProfile(input: ProfileInput): Promise<GeneratedProfile> {
  if (!aiConfigured()) return generateProfile(input);

  try {
    const raw = await requestJson<unknown>(
      "你是校园能力评估助手。只依据用户提供的可验证证据评分，不得根据专业刻板推断。返回 JSON，包含 summary、skills、interests、potentialDirections。skills 每项包含 name、score(0-100)、category(技术/创意/协作/探索)、confidence(0-100)、evidence(原始证据摘要数组)。证据不足时降低 confidence。",
      JSON.stringify(input),
    );
    return validateProfile(raw) ?? generateProfile(input);
  } catch {
    return generateProfile(input);
  }
}

export function getAIStatus() {
  return {
    configured: aiConfigured(),
    provider: aiConfigured() ? "OpenAI-compatible" : "local-rules",
    capabilities: ["ability-profile", "team-recommendation", "discovery-box"],
    fallback: "AI 未配置或调用失败时自动使用可解释规则与人工核验内容",
  };
}

export async function analyzeQuestionnaireProfile(input: QuestionnaireInput): Promise<GeneratedProfile> {
  const scored = generateQuestionnaireProfile(input);
  if (!aiConfigured()) return scored;

  try {
    const raw = await requestJson<{ summary?: string; potentialDirections?: string[]; dimensionInsights?: Record<string, string> }>(
      "你是跨专业竞赛能力画像解释助手。量化分数已经由统一问卷公式确定，严禁修改或重新评分。只能依据输入答案与补充证据，返回 JSON：{summary,potentialDirections,dimensionInsights}。summary 不超过 140 字；potentialDirections 为 2-4 个具体竞赛协作方向；dimensionInsights 的键必须来自给定维度，内容不得编造经历或根据专业做刻板推断。",
      JSON.stringify({
        student: { major: input.major, grade: input.grade, interests: input.interests, extraEvidence: input.evidence },
        fixedScores: scored.skills.map((skill) => ({ dimension: skill.name, score: skill.score, evidence: skill.evidence })),
      }),
    );
    if (typeof raw.summary !== "string" || !Array.isArray(raw.potentialDirections)) return scored;
    const directions = raw.potentialDirections.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 4);
    if (!directions.length) return scored;
    return {
      ...scored,
      summary: raw.summary.trim().slice(0, 180),
      potentialDirections: directions.map((item) => item.trim().slice(0, 40)),
      skills: scored.skills.map((skill) => {
        const insight = raw.dimensionInsights?.[skill.name];
        return typeof insight === "string" && insight.trim() ? { ...skill, evidence: [...(skill.evidence ?? []), `AI 解释：${insight.trim().slice(0, 120)}`].slice(0, 4) } : skill;
      }),
      analysisMode: "questionnaire-ai",
    };
  } catch {
    return scored;
  }
}

export type RecruitmentRecommendationResult = {
  people: PersonMatch[];
  mode: "ai" | "rules" | "profile-fallback";
  policy: string;
};

export async function recommendPeopleForRecruitment(opportunity: Opportunity, recruitment: RecruitmentPost): Promise<RecruitmentRecommendationResult> {
  const localRanking = rankPeopleForRecruitment(opportunity, recruitment);
  const hasDetailedNeeds = recruitment.neededSkills.length > 0 && recruitment.requirements.trim().length >= 8;
  const fallback: RecruitmentRecommendationResult = {
    people: localRanking,
    mode: hasDetailedNeeds ? "rules" : "profile-fallback",
    policy: hasDetailedNeeds
      ? "综合参赛意向、候选人能力画像、队伍技能标签和招募要求生成"
      : "队伍需求信息较少，暂按参赛意向与能力画像生成基础推荐",
  };
  if (!aiConfigured() || !hasDetailedNeeds || localRanking.length === 0) return fallback;

  try {
    const raw = await requestJson<{ recommendations?: Array<{ id?: string; match?: number; reason?: string }> }>(
      "你是校园竞赛组队匹配助手。只依据输入中的参赛意向、候选人能力画像、队伍技能标签和招募要求排序。返回 JSON：{recommendations:[{id,match,reason}]}。reason 必须具体说明命中的标签或要求，不得推断人格或编造经历。",
      JSON.stringify({
        opportunity: { id: opportunity.id, title: opportunity.title, tags: opportunity.tags },
        teamNeeds: { projectDirection: recruitment.projectDirection, neededSkills: recruitment.neededSkills, requirements: recruitment.requirements },
        candidates: localRanking.map((person) => ({ id: person.id, major: person.major, grade: person.grade, tags: person.tags, interested: person.interestedOpportunityIds?.includes(opportunity.id), localReason: person.reason })),
      }),
    );
    const ranked = (raw.recommendations ?? []).flatMap((item) => {
      const person = localRanking.find((candidate) => candidate.id === item.id);
      if (!person || typeof item.match !== "number" || typeof item.reason !== "string") return [];
      return [{ ...person, match: Math.max(0, Math.min(100, Math.round(item.match))), reason: item.reason.trim().slice(0, 180) }];
    });
    if (!ranked.length) return fallback;
    return { people: ranked, mode: "ai", policy: "AI 综合参赛意向、能力画像、队伍技能标签和招募要求生成" };
  } catch {
    return fallback;
  }
}

export type DiscoveryGenerationResult = { discovery: Discovery; mode: "ai" | "curated" };

export async function generateDiscoveryBox(previousId: string | null, profile?: UserAccountProfile): Promise<DiscoveryGenerationResult> {
  const candidates = discoveries.filter((item) => item.id !== previousId);
  const fallback = candidates[Math.floor(Math.random() * candidates.length)] ?? discoveries[0];
  if (!aiConfigured()) return { discovery: { ...fallback, generationMode: "curated" }, mode: "curated" };

  const sourceCatalog = discoveries.flatMap((topic) => topic.sources.map((source, index) => ({
    id: `${topic.id}:${index}`,
    topic: topic.title,
    context: topic.description,
    ...source,
  })));
  try {
    const raw = await requestJson<{ eyebrow?: string; title?: string; description?: string; bridge?: string; readTime?: string; why?: string; sourceIds?: string[] }>(
      "你是校园跨领域探索编辑。根据用户公开资料，从给定可信来源目录中生成一个意外但可解释的知识连接。不得创造新来源、URL、论文或事实。只返回 JSON：{eyebrow,title,description,bridge,readTime,why,sourceIds}；sourceIds 必须从目录选择 1-2 个；description 和 why 各不超过 120 字。",
      JSON.stringify({
        user: profile ? { major: profile.major, grade: profile.grade, skills: profile.skills, bio: profile.bio } : { major: "未提供", skills: [] },
        avoid: discoveries.find((item) => item.id === previousId) ? { title: discoveries.find((item) => item.id === previousId)?.title, bridge: discoveries.find((item) => item.id === previousId)?.bridge } : null,
        trustedSources: sourceCatalog,
      }),
    );
    const required = [raw.eyebrow, raw.title, raw.description, raw.bridge, raw.readTime, raw.why];
    if (required.some((item) => typeof item !== "string" || !item.trim())) return { discovery: fallback, mode: "curated" };
    const selectedSources = (raw.sourceIds ?? []).flatMap((id) => {
      const source = sourceCatalog.find((item) => item.id === id);
      return source ? [{ title: source.title, url: source.url, type: source.type }] : [];
    }).slice(0, 2);
    if (!selectedSources.length) return { discovery: fallback, mode: "curated" };
    return {
      discovery: {
        id: `ai-${Date.now()}`,
        eyebrow: raw.eyebrow!.trim().slice(0, 24),
        title: raw.title!.trim().slice(0, 80),
        description: raw.description!.trim().slice(0, 160),
        bridge: raw.bridge!.trim().slice(0, 48),
        readTime: raw.readTime!.trim().slice(0, 20),
        why: raw.why!.trim().slice(0, 160),
        sources: selectedSources,
        generationMode: "ai",
      },
      mode: "ai",
    };
  } catch {
    return { discovery: { ...fallback, generationMode: "curated" }, mode: "curated" };
  }
}
