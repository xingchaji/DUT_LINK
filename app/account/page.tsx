"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { BrainCircuit, KeyRound, Layers3, LoaderCircle, Mail, Monitor, Pencil, PencilLine, Save, ShieldCheck, UserRound } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { PageHeader } from "@/components/page-header";
import { SkillBars } from "@/components/skill-bars";
import { TagEditor } from "@/components/tag-editor";
import { demoProfile } from "@/lib/mock-data";
import type { AISettingsView, GeneratedProfile, UserAccountProfile } from "@/lib/types";

const emptyProfile: UserAccountProfile = { userId: "", nickname: "", email: "", major: "", grade: "", contact: "", bio: "", skills: [], updatedAt: "" };
const emptyAISettings: AISettingsView = { enabled: false, hasApiKey: false, keyHint: null, baseUrl: "", model: "" };

type SessionDevice = { id: string; createdAt: string; expiresAt: string; userAgent: string | null; isCurrent: boolean };

export default function AccountPage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [serverAbilityProfile, setServerAbilityProfile] = useState<GeneratedProfile | null>(null);
  const [sessions, setSessions] = useState<SessionDevice[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [aiSettings, setAISettings] = useState(emptyAISettings);
  const [apiKey, setApiKey] = useState("");
  const [aiSaving, setAISaving] = useState(false);
  const [aiNotice, setAINotice] = useState("");
  const storedAbilityProfile = useSyncExternalStore(subscribeToAbilityProfile, readStoredAbilityProfile, () => null);
  const abilityProfile = useMemo<GeneratedProfile>(() => {
    if (serverAbilityProfile) return serverAbilityProfile;
    if (!storedAbilityProfile) return demoProfile;
    try { return JSON.parse(storedAbilityProfile); } catch { return demoProfile; }
  }, [serverAbilityProfile, storedAbilityProfile]);

  const load = useCallback(async () => {
    const [response, aiResponse] = await Promise.all([
      fetch("/api/account", { cache: "no-store" }),
      fetch("/api/account/ai-settings", { cache: "no-store" }),
    ]);
    const [data, aiData] = await Promise.all([response.json(), aiResponse.json()]);
    if (!response.ok) { setNotice(data.message); setLoading(false); return; }
    if (aiResponse.ok) setAISettings(aiData.settings);
    setProfile(data.profile); setServerAbilityProfile(data.abilityProfile ?? null); setLoading(false);
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function loadSessions() {
    const response = await fetch("/api/auth/sessions", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) setSessions(data.sessions ?? []);
    setSessionsLoaded(true);
  }
  useEffect(() => { void Promise.resolve().then(loadSessions); }, []);

  async function revokeSession(id: string) {
    const response = await fetch(`/api/auth/sessions/${id}`, { method: "DELETE" });
    if (response.ok) setSessions((current) => current.filter((session) => session.id !== id));
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setNotice("");
    const response = await fetch("/api/account", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
    const data = await response.json(); setSaving(false);
    if (!response.ok) { setNotice(data.message); return; }
    setProfile(data.profile); window.dispatchEvent(new Event("dut-link-account-updated")); setNotice("个人主页已更新，队伍成员资料也已同步");
  }

  async function saveAISettings(event: FormEvent) {
    event.preventDefault(); setAISaving(true); setAINotice("");
    const response = await fetch("/api/account/ai-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...aiSettings, apiKey }),
    });
    const data = await response.json(); setAISaving(false);
    if (!response.ok) { setAINotice(data.message); return; }
    setAISettings(data.settings); setApiKey(""); setAINotice(data.message);
  }

  async function clearAIKey() {
    setAISaving(true); setAINotice("");
    const response = await fetch("/api/account/ai-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...aiSettings, enabled: false, clearApiKey: true }),
    });
    const data = await response.json(); setAISaving(false);
    if (!response.ok) { setAINotice(data.message); return; }
    setAISettings(data.settings); setApiKey(""); setAINotice("API Key 已清除，AI 功能已关闭");
  }

  if (loading) {
    return (
      <div className="page-shell">
        <p className="flex items-center gap-1.5 text-[13px] text-muted">
          <LoaderCircle className="size-3.5 animate-spin" /> 加载个人主页
        </p>
        <div className="mt-6 space-y-3">
          <div className="h-7 w-52 animate-pulse rounded bg-raise" />
          <div className="h-3 w-full max-w-md animate-pulse rounded bg-raise" />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
          <div className="h-56 animate-pulse rounded-[14px] border border-line bg-surface" />
          <div className="h-80 animate-pulse rounded-[14px] border border-line bg-surface" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="个人主页"
        title="个人主页"
        lede="账户资料、技能标签和竞赛能力画像属于同一位用户，并在组队、推荐和探索场景中复用。"
        icon={<UserRound className="size-5" strokeWidth={1.8} />}
      />

      {notice && (
        <p role="status" className="callout mt-6 px-4 py-3 text-[12.5px] text-ink-soft">
          {notice}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* 左侧资料卡：指针 3D 倾斜 + 光照高光 */}
        <Reveal as="aside" className="lg:sticky lg:top-6">
          <TiltCard max={4} lift={3}>
            <div className="card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-5">
                <span className="glyph size-12 shrink-0 rounded-full text-[17px] font-semibold text-ink-soft shadow-[0_1px_1px_rgba(60,48,30,0.06),0_6px_14px_-6px_rgba(60,48,30,0.32),inset_0_1px_0_#fff,inset_0_-3px_6px_rgba(60,48,30,0.05)]">
                  {profile.nickname.slice(0, 1) || "同"}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">{profile.nickname || "未设置昵称"}</h2>
                  <p className="mt-0.5 truncate text-[12px] text-muted">
                    {[profile.major, profile.grade].filter(Boolean).join(" · ") || "专业与年级未填写"}
                  </p>
                </div>
              </div>

              <div className="border-t border-line px-5 py-4">
                <p className="section-label">About</p>
                <p className="mt-2 text-[12.5px] leading-6 text-muted">{profile.bio || "还没有个人介绍"}</p>
              </div>

              <dl className="divide-y divide-line border-t border-line">
                <div className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <dt className="flex shrink-0 items-center gap-1.5 text-[11.5px] text-faint">
                    <Mail className="size-3" strokeWidth={1.9} /> 校园邮箱
                  </dt>
                  <dd className="min-w-0 truncate text-[12px] text-ink-soft" title={profile.email || undefined}>{profile.email || "未填写"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <dt className="flex shrink-0 items-center gap-1.5 text-[11.5px] text-faint">
                    <UserRound className="size-3" strokeWidth={1.9} /> 联系方式
                  </dt>
                  <dd className="min-w-0 truncate text-[12px] text-ink-soft">{profile.contact || "未公开"}</dd>
                </div>
              </dl>

              <div className="border-t border-line px-5 py-4">
                <p className="section-label">Skills</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.skills.length ? (
                    profile.skills.map((skill) => (
                      <span key={skill} className="chip">{skill}</span>
                    ))
                  ) : (
                    <span className="text-[11.5px] text-faint">还没有技能标签</span>
                  )}
                </div>
              </div>
            </div>
          </TiltCard>
        </Reveal>

        {/* 右侧编辑表单 */}
        <Reveal as="form" onSubmit={save} delay={60} className="card min-w-0">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div>
              <p className="section-label flex items-center gap-1.5">
                <PencilLine className="size-3" strokeWidth={2} /> Public profile
              </p>
              <h2 className="section-title mt-1.5">编辑公开资料</h2>
              <p className="section-desc mt-1">邮箱由登录账户确定，暂不支持修改。</p>
            </div>
          </div>

          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
            <Field label="昵称 *" value={profile.nickname} onChange={(value) => setProfile((current) => ({ ...current, nickname: value }))} />
            <Field label="校园邮箱" value={profile.email} disabled onChange={() => {}} />
            <Field label="专业 *" value={profile.major} onChange={(value) => setProfile((current) => ({ ...current, major: value }))} />
            <label className="block">
              <span className="field-label">年级</span>
              <select value={profile.grade} onChange={(event) => setProfile((current) => ({ ...current, grade: event.target.value }))} className="field">
                <option>大一</option>
                <option>大二</option>
                <option>大三</option>
                <option>大四</option>
                <option>研究生</option>
              </select>
            </label>
            <div className="sm:col-span-2">
              <Field label="公开联系方式" value={profile.contact} placeholder="微信、QQ 或邮箱" onChange={(value) => setProfile((current) => ({ ...current, contact: value }))} />
            </div>
            <TagEditor className="sm:col-span-2 block" label="技能标签" tags={profile.skills} onChange={(skills) => setProfile((current) => ({ ...current, skills }))} placeholder="输入“React”后按回车" />
            <label className="block sm:col-span-2">
              <span className="field-label">个人介绍</span>
              <textarea value={profile.bio} onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))} rows={5} className="field" />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-6">
            <p className="text-[11.5px] text-faint">保存后会同步队伍成员资料。</p>
            <button type="submit" disabled={saving} className="btn btn-primary pressable">
              {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? "保存中…" : "保存个人资料"}
            </button>
          </div>
        </Reveal>
      </div>

      {/* AI 功能设置 */}
      <Reveal as="section" delay={120} className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-3xl">
            <p className="section-label flex items-center gap-1.5">
              <KeyRound className="size-3" strokeWidth={2} /> AI settings
            </p>
            <h2 className="section-title mt-1.5">AI 功能设置</h2>
            <p className="section-desc mt-1">个人密钥仅在服务端加密保存。开启后，问卷能力画像、队长智能推荐和探索盲盒会使用这里配置的兼容 Chat Completions 服务；关闭后全部回退到本地规则和人工策展内容。</p>
          </div>
          <label className="pressable flex h-8 cursor-pointer items-center gap-2.5 rounded-[8px] border border-line bg-surface px-3 shadow-[0_1px_1px_rgba(60,48,30,0.05),0_3px_8px_-4px_rgba(60,48,30,0.14),inset_0_1px_0_#fff] hover:border-line-strong">
            <input
              type="checkbox"
              role="switch"
              aria-checked={aiSettings.enabled}
              checked={aiSettings.enabled}
              onChange={(event) => setAISettings((current) => ({ ...current, enabled: event.target.checked }))}
              className="peer sr-only"
            />
            <span className="relative h-[18px] w-[32px] shrink-0 rounded-full bg-line-strong shadow-[inset_0_1px_2px_rgba(60,48,30,0.2)] transition-colors peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 peer-focus-visible:ring-offset-1 after:absolute after:left-[2px] after:top-[2px] after:size-[14px] after:rounded-full after:bg-surface after:shadow-[0_1px_1px_rgba(60,48,30,0.22),0_1px_3px_rgba(60,48,30,0.24),inset_0_1px_0_#fff] after:transition-transform peer-checked:after:translate-x-[14px]" />
            <span className="text-[12px] font-medium text-ink-soft">{aiSettings.enabled ? "已开启" : "已关闭"}</span>
          </label>
        </div>

        <form onSubmit={saveAISettings} className="card mt-3.5 grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
          <label className="block sm:col-span-2">
            <span className="field-label flex items-center gap-2">
              API Key
              {aiSettings.hasApiKey && <span className="font-normal text-faint">已保存 <span className="num text-muted">{aiSettings.keyHint}</span></span>}
            </span>
            <input
              type="password"
              value={apiKey}
              autoComplete="new-password"
              placeholder={aiSettings.hasApiKey ? "留空则继续使用已保存的密钥" : "输入服务商提供的 API Key"}
              onChange={(event) => setApiKey(event.target.value)}
              className="field"
            />
          </label>
          <Field label="API 根地址" value={aiSettings.baseUrl} placeholder="https://api.example.com/v1" onChange={(baseUrl) => setAISettings((current) => ({ ...current, baseUrl }))} />
          <Field label="模型名称" value={aiSettings.model} placeholder="模型 ID" onChange={(model) => setAISettings((current) => ({ ...current, model }))} />
          {aiNotice && <p className="callout sm:col-span-2 px-4 py-2.5 text-[12px]">{aiNotice}</p>}
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <button type="submit" disabled={aiSaving} className="btn btn-primary pressable">
              {aiSaving ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              {aiSaving ? "保存中…" : "保存 AI 设置"}
            </button>
            {aiSettings.hasApiKey && (
              <button type="button" disabled={aiSaving} onClick={clearAIKey} className="btn btn-secondary text-clay hover:border-clay hover:bg-clay-soft">
                清除密钥
              </button>
            )}
          </div>
        </form>
      </Reveal>

      {/* 竞赛能力画像 */}
      <Reveal as="section" delay={180} className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-label flex items-center gap-1.5">
              <BrainCircuit className="size-3" strokeWidth={2} /> Ability profile
            </p>
            <h2 className="section-title mt-1.5">竞赛能力画像</h2>
            <p className="section-desc mt-1">标准化竞赛调查结果，分数由规则计算。</p>
          </div>
          <Link href="/onboarding" className="btn btn-secondary">
            <Pencil className="size-3.5" /> 重新测评
          </Link>
        </div>

        <div className="card mt-3.5 px-5 py-5 sm:px-6">
          <p className="max-w-3xl text-[13px] leading-7 text-muted">{abilityProfile.summary}</p>
          <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:gap-8">
            <SkillBars skills={abilityProfile.skills} />
            <div className="divide-y divide-line border-t border-line sm:border-t-0">
              {abilityProfile.skills.map((skill) => (
                <div key={skill.name} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12.5px] font-medium text-ink-soft">{skill.name}</span>
                    {typeof skill.confidence === "number" && <span className="num text-[11px] text-faint">置信度 {skill.confidence}%</span>}
                  </div>
                  <p className="mt-1 text-[11.5px] leading-6 text-muted">依据：{skill.evidence?.join("；") ?? "暂无补充证据"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* 兴趣与潜在方向 */}
      <Reveal as="section" delay={240} className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-label flex items-center gap-1.5">
              <Layers3 className="size-3" strokeWidth={2} /> Interests
            </p>
            <h2 className="section-title mt-1.5">兴趣与潜在方向</h2>
            <p className="section-desc mt-1">兴趣与能力综合，不是职业定论。</p>
          </div>
        </div>

        <div className="card mt-3.5 divide-y divide-line">
          <div className="px-5 py-4 sm:px-6">
            <p className="text-[11px] text-faint">兴趣标签</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {abilityProfile.interests.length ? (
                abilityProfile.interests.map((item) => (
                  <span key={item} className="chip">{item}</span>
                ))
              ) : (
                <span className="text-[11.5px] text-faint">还没有完成兴趣选择</span>
              )}
            </div>
          </div>
          <div className="px-5 py-4 sm:px-6">
            <p className="text-[11px] text-faint">潜在方向</p>
            <ol className="mt-1.5 divide-y divide-line">
              {abilityProfile.potentialDirections.map((item, index) => (
                <li key={item} className="flex items-center gap-3 py-2.5 text-[13px] text-ink-soft last:pb-0">
                  <span className="num shrink-0 text-[10.5px] text-faint">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Reveal>

      {/* 登录设备 */}
      <Reveal as="section" delay={300} className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-label flex items-center gap-1.5">
              <Monitor className="size-3" strokeWidth={2} /> Sessions
            </p>
            <h2 className="section-title mt-1.5">登录设备</h2>
            <p className="section-desc mt-1">当前账号的登录会话。</p>
          </div>
        </div>

        <div className="card mt-3.5">
          {!sessionsLoaded ? (
            <p className="flex items-center gap-1.5 px-5 py-4 text-[12px] text-muted">
              <LoaderCircle className="size-3.5 animate-spin" /> 正在加载登录会话…
            </p>
          ) : sessions.length === 0 ? (
            <p className="px-5 py-6 text-center text-[12px] text-muted">当前登录模式不提供会话列表，或暂无其他登录设备。</p>
          ) : (
            <ul className="divide-y divide-line">
              {sessions.map((session) => (
                <li key={session.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-[12.5px] font-medium text-ink">
                      <span className="truncate">{session.userAgent || "未知设备"}</span>
                      {session.isCurrent && <span className="status status-ok shrink-0">当前设备</span>}
                    </p>
                    <p className="mt-1 text-[11.5px] text-faint">
                      登录于 <span className="num">{new Date(session.createdAt).toLocaleString()}</span>
                    </p>
                  </div>
                  {!session.isCurrent && (
                    <button type="button" onClick={() => revokeSession(session.id)} className="btn btn-secondary shrink-0 text-clay hover:border-clay hover:bg-clay-soft">
                      注销
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "", disabled = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="field disabled:cursor-not-allowed disabled:bg-raise disabled:text-muted"
      />
    </label>
  );
}
function subscribeToAbilityProfile(callback: () => void) { window.addEventListener("storage", callback); return () => window.removeEventListener("storage", callback); }
function readStoredAbilityProfile() { return localStorage.getItem("dut-link-profile"); }
