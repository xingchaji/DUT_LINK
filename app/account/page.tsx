"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { BrainCircuit, KeyRound, Layers3, LoaderCircle, Mail, Monitor, Pencil, PencilLine, Save, ShieldCheck, UserRound } from "lucide-react";
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

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-[var(--muted)]"><LoaderCircle className="size-4 animate-spin" /> 加载个人主页</div>;
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9 xl:px-12">
    <PageHeader eyebrow="Personal Homepage" title="个人主页" />
    <div className="mt-4 flex max-w-4xl items-start gap-3 text-sm leading-7 text-[var(--muted)]"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-[var(--coral)]" /><p>账户资料、技能标签和竞赛能力画像归属于同一位用户，并在组队、推荐和探索场景中复用。</p></div>
    {notice && <div role="status" className="mt-5 rounded-2xl border border-[var(--lime)] bg-[var(--lime)]/30 px-4 py-3 text-sm">{notice}</div>}
    <div className="mt-7 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
      <aside className="card overflow-hidden p-5"><div className="dot-grid relative overflow-hidden rounded-[24px] bg-[var(--ink)] p-6 text-white"><div className="absolute -right-10 -top-10 size-32 rounded-full bg-[var(--violet)]/60 blur-2xl" /><div className="relative"><div className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-[var(--coral)] to-[var(--amber)] text-2xl font-bold shadow-lg">{profile.nickname.slice(0, 1) || "同"}</div><h2 className="mt-5 text-2xl font-extrabold tracking-[-0.025em]">{profile.nickname || "未设置昵称"}</h2><p className="mt-1 text-sm text-white/55">{profile.major} · {profile.grade}</p><p className="mt-5 text-sm leading-7 text-white/70">{profile.bio || "还没有个人介绍"}</p><div className="mt-5 space-y-2 text-xs text-white/65"><p className="flex items-center gap-2"><Mail className="size-3.5" /> {profile.email}</p><p className="flex items-center gap-2"><UserRound className="size-3.5" /> {profile.contact || "联系方式未公开"}</p></div></div></div><div className="mt-5 flex flex-wrap gap-2">{profile.skills.map((skill) => <span key={skill} className="rounded-full bg-[#eeebff] px-3 py-1.5 text-xs font-semibold text-[var(--violet)]">{skill}</span>)}</div></aside>
      <form onSubmit={save} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-7"><div className="sm:col-span-2 flex items-center gap-3"><PencilLine className="size-5 text-[var(--violet)]" /><div><h2 className="text-xl font-bold">编辑公开资料</h2><p className="text-xs text-[var(--muted)]">邮箱由登录账户确定，暂不支持修改</p></div></div><Field label="昵称 *" value={profile.nickname} onChange={(value) => setProfile((current) => ({ ...current, nickname: value }))} /><Field label="校园邮箱" value={profile.email} disabled onChange={() => {}} /><Field label="专业 *" value={profile.major} onChange={(value) => setProfile((current) => ({ ...current, major: value }))} /><label><span className="mb-2 block text-xs font-bold">年级</span><select value={profile.grade} onChange={(event) => setProfile((current) => ({ ...current, grade: event.target.value }))} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm"><option>大一</option><option>大二</option><option>大三</option><option>大四</option><option>研究生</option></select></label><Field label="公开联系方式" value={profile.contact} placeholder="微信、QQ 或邮箱" onChange={(value) => setProfile((current) => ({ ...current, contact: value }))} /><TagEditor label="技能标签" tags={profile.skills} onChange={(skills) => setProfile((current) => ({ ...current, skills }))} placeholder="输入“React”后按回车" /><label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold">个人介绍</span><textarea value={profile.bio} onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))} rows={5} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm leading-6 outline-none focus:border-[var(--violet)]" /></label><button disabled={saving} className="sm:col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-4 text-sm font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4 text-[var(--lime)]" />}{saving ? "保存中…" : "保存个人资料"}</button></form>
    </div>
    <section className="card mt-7 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-[#ebe8ff] text-[var(--violet)]"><KeyRound className="size-5" /></div><div><p className="text-xs text-[var(--muted)]">个人密钥仅在服务端加密保存</p><h2 className="text-xl font-bold">AI 功能设置</h2></div></div>
        <label className="flex cursor-pointer items-center gap-3 rounded-full border border-black/10 bg-[var(--paper)] px-4 py-2.5 text-sm font-bold"><span>{aiSettings.enabled ? "已开启" : "已关闭"}</span><input type="checkbox" checked={aiSettings.enabled} onChange={(event) => setAISettings((current) => ({ ...current, enabled: event.target.checked }))} className="size-4 accent-[var(--violet)]" /></label>
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">开启后，问卷能力画像、队长智能推荐和探索盲盒会使用这里配置的兼容 Chat Completions 服务；关闭后全部回退到本地规则和人工策展内容。</p>
      <form onSubmit={saveAISettings} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className="mb-2 flex items-center gap-2 text-xs font-bold">API Key {aiSettings.hasApiKey && <span className="font-normal text-[var(--muted)]">已保存 {aiSettings.keyHint}</span>}</span><input type="password" value={apiKey} autoComplete="new-password" placeholder={aiSettings.hasApiKey ? "留空则继续使用已保存的密钥" : "输入服务商提供的 API Key"} onChange={(event) => setApiKey(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--violet)]" /></label>
        <Field label="API 根地址" value={aiSettings.baseUrl} placeholder="https://api.example.com/v1" onChange={(baseUrl) => setAISettings((current) => ({ ...current, baseUrl }))} />
        <Field label="模型名称" value={aiSettings.model} placeholder="模型 ID" onChange={(model) => setAISettings((current) => ({ ...current, model }))} />
        {aiNotice && <p className="sm:col-span-2 rounded-2xl bg-[var(--lime)]/45 px-4 py-3 text-sm">{aiNotice}</p>}
        <div className="sm:col-span-2 flex flex-wrap gap-3"><button disabled={aiSaving} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-4 text-sm font-bold text-white disabled:opacity-60">{aiSaving ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4 text-[var(--lime)]" />}{aiSaving ? "保存中…" : "保存 AI 设置"}</button>{aiSettings.hasApiKey && <button type="button" disabled={aiSaving} onClick={clearAIKey} className="rounded-2xl border border-red-200 px-5 py-4 text-sm font-bold text-red-600 disabled:opacity-60">清除密钥</button>}</div>
      </form>
    </section>
    <section className="card mt-7 p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-[#ebe8ff] text-[var(--violet)]"><BrainCircuit className="size-5" /></div><div><p className="text-xs text-[var(--muted)]">标准化竞赛调查结果</p><h2 className="text-xl font-bold">竞赛能力画像</h2></div></div><Link href="/onboarding" className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-xs font-bold"><Pencil className="size-3.5" /> 重新测评</Link></div><p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--muted)]">{abilityProfile.summary}</p><div className="mt-7"><SkillBars skills={abilityProfile.skills} /></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{abilityProfile.skills.map((skill) => <div key={skill.name} className="rounded-2xl bg-[var(--paper)] p-4"><div className="flex justify-between text-xs"><strong>{skill.name}</strong><span>置信度 {skill.confidence}%</span></div><p className="mt-2 text-xs leading-5 text-[var(--muted)]">依据：{skill.evidence?.join("；")}</p></div>)}</div></section>
    <section className="card mt-7 p-6 sm:p-8"><div className="flex items-center gap-3"><Layers3 className="size-5 text-[#bd792a]" /><div><p className="text-xs text-[var(--muted)]">兴趣与能力综合，不是职业定论</p><h2 className="text-xl font-bold">兴趣与潜在方向</h2></div></div><div className="mt-5 flex flex-wrap gap-2">{abilityProfile.interests.map((item) => <span key={item} className="rounded-full bg-[var(--lime)]/60 px-3 py-1.5 text-xs font-semibold">{item}</span>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-3">{abilityProfile.potentialDirections.map((item) => <div key={item} className="rounded-2xl border border-black/[0.06] p-4 text-sm font-bold">{item}</div>)}</div></section>
    <section className="card mt-7 p-6 sm:p-8"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-[#ebe8ff] text-[var(--violet)]"><Monitor className="size-5" /></div><div><p className="text-xs text-[var(--muted)]">当前账号的登录会话</p><h2 className="text-xl font-bold">登录设备</h2></div></div>{!sessionsLoaded ? <p className="mt-5 text-sm text-[var(--muted)]">正在加载登录会话…</p> : sessions.length === 0 ? <p className="mt-5 text-sm text-[var(--muted)]">当前登录模式不提供会话列表，或暂无其他登录设备。</p> : <div className="mt-5 space-y-3">{sessions.map((session) => <div key={session.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--paper)] p-4"><div className="min-w-0"><p className="truncate text-sm font-bold">{session.userAgent || "未知设备"}{session.isCurrent && <span className="ml-2 rounded-full bg-[var(--lime)]/60 px-2 py-0.5 text-[11px]">当前设备</span>}</p><p className="mt-1 text-xs text-[var(--muted)]">登录于 {new Date(session.createdAt).toLocaleString()}</p></div>{!session.isCurrent && <button onClick={() => revokeSession(session.id)} className="shrink-0 rounded-xl border border-black/10 px-3 py-2 text-xs font-bold text-red-600">注销</button>}</div>)}</div>}</section>
  </div>;
}

function Field({ label, value, onChange, placeholder = "", disabled = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) { return <label><span className="mb-2 block text-xs font-bold">{label}</span><input value={value} disabled={disabled} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-[var(--paper)] px-4 py-3 text-sm outline-none disabled:opacity-55 focus:border-[var(--violet)]" /></label>; }
function subscribeToAbilityProfile(callback: () => void) { window.addEventListener("storage", callback); return () => window.removeEventListener("storage", callback); }
function readStoredAbilityProfile() { return localStorage.getItem("dut-link-profile"); }
