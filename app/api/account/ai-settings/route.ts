import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAISettingsView, saveAISettings } from "@/lib/ai-settings";

function normalizeBaseUrl(value: unknown) {
  if (typeof value !== "string") throw new Error("请填写 AI 服务地址");
  const normalized = value.trim().replace(/\/$/, "");
  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error("AI 服务地址格式不正确");
  }
  const localHttp = process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !localHttp) throw new Error("AI 服务地址必须使用 HTTPS（本机调试除外）");
  if (url.pathname.endsWith("/chat/completions")) throw new Error("服务地址请填写到 API 根路径，例如 https://example.com/v1");
  return normalized;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后管理 AI 设置" }, { status: 401 });
  return NextResponse.json({ settings: await getAISettingsView(user.id) });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "请登录后管理 AI 设置" }, { status: 401 });
  try {
    const body = (await request.json()) as { enabled?: unknown; apiKey?: unknown; clearApiKey?: unknown; baseUrl?: unknown; model?: unknown };
    if (typeof body.enabled !== "boolean") return NextResponse.json({ message: "AI 开关状态不正确" }, { status: 400 });
    const current = await getAISettingsView(user.id);
    const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
    const clearApiKey = body.clearApiKey === true;
    if (apiKey && apiKey.length < 8) return NextResponse.json({ message: "API Key 长度不正确" }, { status: 400 });
    if (body.enabled && ((!apiKey && !current.hasApiKey) || clearApiKey)) return NextResponse.json({ message: "开启 AI 前请先填写 API Key" }, { status: 400 });
    const model = typeof body.model === "string" ? body.model.trim() : "";
    if (!model || model.length > 120) return NextResponse.json({ message: "请填写有效的模型名称" }, { status: 400 });
    const settings = await saveAISettings(user, {
      enabled: body.enabled,
      apiKey: apiKey || undefined,
      clearApiKey,
      baseUrl: normalizeBaseUrl(body.baseUrl),
      model,
    });
    return NextResponse.json({ settings, message: body.enabled ? "AI 功能已开启" : "AI 功能已关闭" });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "AI 设置保存失败" }, { status: 400 });
  }
}
