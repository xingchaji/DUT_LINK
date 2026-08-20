import { generateProfile } from "@/lib/profile-generator";
import type { GeneratedProfile, ProfileInput, Skill } from "@/lib/types";

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
  return { configured: aiConfigured(), provider: aiConfigured() ? "OpenAI-compatible" : "local-rules" };
}
