"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, CheckCircle2, Clock3, Inbox, LoaderCircle, MailPlus, Send, UsersRound, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import type { RecruitmentApplication, TeamInvitation } from "@/lib/types";

type ApplicationView = RecruitmentApplication & { teamName: string; opportunityTitle: string };
type InvitationView = TeamInvitation & { teamName: string; opportunityTitle: string };

export default function ApplicationsPage() {
  const [sent, setSent] = useState<ApplicationView[]>([]);
  const [received, setReceived] = useState<ApplicationView[]>([]);
  const [sentInvitations, setSentInvitations] = useState<InvitationView[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<InvitationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const [response, invitationResponse] = await Promise.all([fetch("/api/applications", { cache: "no-store" }), fetch("/api/invitations", { cache: "no-store" })]);
    const [data, invitationData] = await Promise.all([response.json(), invitationResponse.json()]);
    if (!response.ok || !invitationResponse.ok) { setNotice(data.message ?? invitationData.message ?? "加载失败"); setLoading(false); return; }
    setSent(data.sent ?? []); setReceived(data.received ?? []); setSentInvitations(invitationData.sent ?? []); setReceivedInvitations(invitationData.received ?? []); setLoading(false);
  }, []);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function decideApplication(id: string, status: "accepted" | "rejected") {
    const response = await fetch(`/api/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await response.json();
    setNotice(response.ok ? (status === "accepted" ? "已接受申请，队伍人数已更新" : "已拒绝申请") : data.message);
    if (response.ok) await load();
  }

  async function decideInvitation(id: string, status: "accepted" | "rejected") {
    const response = await fetch(`/api/invitations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await response.json();
    setNotice(response.ok ? (status === "accepted" ? "已接受邀请并加入队伍" : "已拒绝邀请") : data.message);
    if (response.ok) await load();
  }

  const pendingApplications = received.filter((item) => item.status === "pending").length;
  const pendingInvitations = receivedInvitations.filter((item) => item.status === "pending").length;
  const pendingTotal = pendingApplications + pendingInvitations;
  const activityTotal = sent.length + received.length + sentInvitations.length + receivedInvitations.length;

  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9 xl:px-12">
    <PageHeader eyebrow="Application Center" title="让每一次组队意向都有结果" />
    <div className="mt-4 flex max-w-4xl items-start gap-3 text-sm leading-7 text-[var(--muted)]"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-[var(--coral)]" /><p>集中处理申请与邀请。接受后，系统会更新队伍成员，并自动关闭同场比赛的其他待处理意向。</p></div>

    <section className="relative mt-7 overflow-hidden rounded-[28px] bg-[var(--ink)] p-5 text-white shadow-[0_24px_60px_rgba(23,32,51,0.14)] sm:p-6"><div className="absolute -right-16 -top-20 size-56 rounded-full bg-[var(--violet)]/55 blur-3xl" /><div className="relative grid gap-3 sm:grid-cols-3"><SummaryStat value={pendingTotal} label="等待你处理" accent /><SummaryStat value={received.length + receivedInvitations.length} label="收到的意向" /><SummaryStat value={activityTotal} label="全部协作记录" /></div></section>

    {notice && <div role="status" className="mt-5 flex items-center gap-3 rounded-2xl border border-[var(--lime)] bg-[var(--lime)]/30 px-4 py-3 text-sm"><CheckCircle2 className="size-4 shrink-0 text-[#57820f]" /><span>{notice}{notice.includes("登录") && <Link href="/login?next=/applications" className="ml-2 font-bold underline">去登录</Link>}</span></div>}
    {loading ? <div className="flex items-center justify-center gap-2 py-20 text-sm text-[var(--muted)]"><LoaderCircle className="size-4 animate-spin" /> 加载申请与邀请</div> : <>
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <ItemSection title="收到的申请" subtitle={`你发布的队伍收到 ${received.length} 条申请`} icon={<Inbox className="size-5 text-[var(--coral)]" />} items={received} empty="还没有收到申请" render={(item) => <ApplicationCard item={item} received onDecide={decideApplication} />} />
        <ItemSection title="我发出的申请" subtitle="查看队长的处理结果" icon={<Send className="size-5 text-[var(--violet)]" />} items={sent} empty="你还没有申请任何队伍" render={(item) => <ApplicationCard item={item} />} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ItemSection title="收到的组队邀请" subtitle="接受后将直接加入对应比赛队伍" icon={<MailPlus className="size-5 text-[var(--cyan)]" />} items={receivedInvitations} empty="你还没有收到组队邀请" render={(item) => <InvitationCard item={item} received onDecide={decideInvitation} />} />
        <ItemSection title="我发出的组队邀请" subtitle="查看候选人的回应结果" icon={<Send className="size-5 text-[var(--cyan)]" />} items={sentInvitations} empty="你还没有发送组队邀请" render={(item) => <InvitationCard item={item} />} />
      </div>
    </>}
  </div>;
}

function ItemSection<T extends { id: string }>({ title, subtitle, icon, items, empty, render }: { title: string; subtitle: string; icon: ReactNode; items: T[]; empty: string; render: (item: T) => ReactNode }) {
  return <section className="card p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[var(--paper)]">{icon}</span><div className="min-w-0 flex-1"><h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.02em]">{title}</h2><p className="text-xs text-[var(--muted)]">{subtitle}</p></div><span className="grid size-7 place-items-center rounded-full bg-black/[0.04] text-[10px] font-bold text-[var(--muted)]">{items.length}</span></div><div className="mt-5 space-y-3">{items.map((item) => <div key={item.id}>{render(item)}</div>)}{items.length === 0 && <Empty text={empty} />}</div></section>;
}

function ApplicationCard({ item, received = false, onDecide }: { item: ApplicationView; received?: boolean; onDecide?: (id: string, status: "accepted" | "rejected") => void }) {
  return <article className="rounded-[20px] border border-black/[0.06] bg-white p-4 transition hover:border-[var(--violet)]/15 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--violet)]">{item.opportunityTitle}</p><h3 className="mt-2 font-bold">{received ? `${item.applicantName} · ${item.applicantMajor}` : item.teamName}</h3>{received && <p className="mt-1 text-xs text-[var(--muted)]">申请加入 {item.teamName}</p>}</div><Status value={item.status} /></div><p className="mt-4 rounded-2xl bg-[var(--paper)] p-4 text-sm leading-6 text-[var(--muted)]">{item.message}</p>{received && item.status === "pending" && onDecide && <DecisionButtons onAccept={() => onDecide(item.id, "accepted")} onReject={() => onDecide(item.id, "rejected")} />}</article>;
}

function InvitationCard({ item, received = false, onDecide }: { item: InvitationView; received?: boolean; onDecide?: (id: string, status: "accepted" | "rejected") => void }) {
  return <article className="rounded-[20px] border border-black/[0.06] bg-white p-4 transition hover:border-[var(--cyan)]/20 hover:shadow-md"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--violet)]">{item.opportunityTitle}</p><div className="mt-2 flex items-start justify-between gap-3"><div><h3 className="font-bold">{received ? `${item.senderName} 邀请你` : `邀请 ${item.recipientName}`}</h3><p className="mt-1 text-xs text-[var(--muted)]">加入 {item.teamName}</p></div><Status value={item.status} /></div><p className="mt-4 text-sm leading-6 text-[var(--muted)]">{item.message}</p>{received && item.status === "pending" && onDecide && <DecisionButtons onAccept={() => onDecide(item.id, "accepted")} onReject={() => onDecide(item.id, "rejected")} />}</article>;
}

function DecisionButtons({ onAccept, onReject }: { onAccept: () => void; onReject: () => void }) {
  return <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={onAccept} className="flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5"><Check className="size-4 text-[var(--lime)]" /> 接受</button><button onClick={onReject} className="flex items-center justify-center gap-2 rounded-xl border border-black/[0.08] px-4 py-3 text-xs font-bold transition hover:border-red-200 hover:text-red-600"><X className="size-4" /> 拒绝</button></div>;
}

function Status({ value }: { value: "pending" | "accepted" | "rejected" }) {
  const labels = { pending: "待处理", accepted: "已接受", rejected: "已拒绝" };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${value === "accepted" ? "bg-emerald-50 text-emerald-700" : value === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}><Clock3 className="size-3" /> {labels[value]}</span>;
}

function Empty({ text }: { text: string }) { return <div className="rounded-[20px] border border-dashed border-black/10 bg-[var(--paper)]/50 p-8 text-center"><UsersRound className="mx-auto size-5 text-[var(--muted)]" /><p className="mt-3 text-sm text-[var(--muted)]">{text}</p></div>; }

function SummaryStat({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) { return <div className={`rounded-2xl border p-4 ${accent ? "border-[var(--lime)]/25 bg-[var(--lime)]/10" : "border-white/8 bg-white/[0.065]"}`}><p className={`font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.05em] ${accent ? "text-[var(--lime)]" : ""}`}>{value}</p><p className="mt-1 text-[10px] text-white/45">{label}</p></div>; }
