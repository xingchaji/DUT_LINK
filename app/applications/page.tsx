"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, Clock3, Inbox, LoaderCircle, MailPlus, Send, X } from "lucide-react";
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

  return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
    <PageHeader eyebrow="Application Center" title="让每一次组队意向都有结果" />
    <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">这里处理 DUT Link 内的申请和邀请。接受后系统会在同一事务中写入队伍成员，并关闭同场比赛的其他待处理意向。</p>
    {notice && <div className="mt-5 rounded-2xl bg-[var(--lime)]/45 px-4 py-3 text-sm">{notice}{notice.includes("登录") && <Link href="/login?next=/applications" className="ml-2 font-bold underline">去登录</Link>}</div>}
    {loading ? <div className="flex items-center justify-center gap-2 py-20 text-sm text-[var(--muted)]"><LoaderCircle className="size-4 animate-spin" /> 加载申请与邀请</div> : <>
      <div className="mt-8 grid gap-7 lg:grid-cols-2">
        <ItemSection title="收到的申请" subtitle={`你发布的队伍收到 ${received.length} 条申请`} icon={<Inbox className="size-5 text-[var(--coral)]" />} items={received} empty="还没有收到申请" render={(item) => <ApplicationCard item={item} received onDecide={decideApplication} />} />
        <ItemSection title="我发出的申请" subtitle="查看队长的处理结果" icon={<Send className="size-5 text-[var(--violet)]" />} items={sent} empty="你还没有申请任何队伍" render={(item) => <ApplicationCard item={item} />} />
      </div>
      <div className="mt-9 grid gap-7 lg:grid-cols-2">
        <ItemSection title="收到的组队邀请" subtitle="接受后将直接加入对应比赛队伍" icon={<MailPlus className="size-5 text-[var(--cyan)]" />} items={receivedInvitations} empty="你还没有收到组队邀请" render={(item) => <InvitationCard item={item} received onDecide={decideInvitation} />} />
        <ItemSection title="我发出的组队邀请" subtitle="查看候选人的回应结果" icon={<Send className="size-5 text-[var(--cyan)]" />} items={sentInvitations} empty="你还没有发送组队邀请" render={(item) => <InvitationCard item={item} />} />
      </div>
    </>}
  </div>;
}

function ItemSection<T extends { id: string }>({ title, subtitle, icon, items, empty, render }: { title: string; subtitle: string; icon: ReactNode; items: T[]; empty: string; render: (item: T) => ReactNode }) {
  return <section><div className="flex items-center gap-3">{icon}<div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold">{title}</h2><p className="text-xs text-[var(--muted)]">{subtitle}</p></div></div><div className="mt-5 space-y-4">{items.map((item) => <div key={item.id}>{render(item)}</div>)}{items.length === 0 && <Empty text={empty} />}</div></section>;
}

function ApplicationCard({ item, received = false, onDecide }: { item: ApplicationView; received?: boolean; onDecide?: (id: string, status: "accepted" | "rejected") => void }) {
  return <article className="card p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold text-[var(--violet)]">{item.opportunityTitle}</p><h3 className="mt-2 font-bold">{received ? `${item.applicantName} · ${item.applicantMajor}` : item.teamName}</h3>{received && <p className="mt-1 text-xs text-[var(--muted)]">申请加入 {item.teamName}</p>}</div><Status value={item.status} /></div><p className="mt-4 rounded-2xl bg-[var(--paper)] p-4 text-sm leading-6 text-[var(--muted)]">{item.message}</p>{received && item.status === "pending" && onDecide && <DecisionButtons onAccept={() => onDecide(item.id, "accepted")} onReject={() => onDecide(item.id, "rejected")} />}</article>;
}

function InvitationCard({ item, received = false, onDecide }: { item: InvitationView; received?: boolean; onDecide?: (id: string, status: "accepted" | "rejected") => void }) {
  return <article className="card p-5"><p className="text-xs font-semibold text-[var(--violet)]">{item.opportunityTitle}</p><div className="mt-2 flex items-start justify-between gap-3"><div><h3 className="font-bold">{received ? `${item.senderName} 邀请你` : `邀请 ${item.recipientName}`}</h3><p className="mt-1 text-xs text-[var(--muted)]">加入 {item.teamName}</p></div><Status value={item.status} /></div><p className="mt-4 text-sm leading-6 text-[var(--muted)]">{item.message}</p>{received && item.status === "pending" && onDecide && <DecisionButtons onAccept={() => onDecide(item.id, "accepted")} onReject={() => onDecide(item.id, "rejected")} />}</article>;
}

function DecisionButtons({ onAccept, onReject }: { onAccept: () => void; onReject: () => void }) {
  return <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={onAccept} className="flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-xs font-bold text-white"><Check className="size-4" /> 接受</button><button onClick={onReject} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-xs font-bold"><X className="size-4" /> 拒绝</button></div>;
}

function Status({ value }: { value: "pending" | "accepted" | "rejected" }) {
  const labels = { pending: "待处理", accepted: "已接受", rejected: "已拒绝" };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${value === "accepted" ? "bg-emerald-50 text-emerald-700" : value === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}><Clock3 className="size-3" /> {labels[value]}</span>;
}

function Empty({ text }: { text: string }) { return <div className="rounded-3xl border border-dashed border-black/10 p-8 text-center text-sm text-[var(--muted)]">{text}</div>; }
