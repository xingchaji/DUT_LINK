"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, CheckCircle2, ChevronDown, Inbox, LoaderCircle, MailOpen, MailPlus, Send, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { notify } from "@/components/feedback/toast";
import { CountUp } from "@/components/motion/metric";
import { Reveal } from "@/components/motion/reveal";
import type { RecruitmentApplication, TeamInvitation } from "@/lib/types";

type ApplicationView = RecruitmentApplication & { teamName: string; opportunityTitle: string };
type InvitationView = TeamInvitation & { teamName: string; opportunityTitle: string };
type Decision = "accepted" | "rejected";

/* 行悬停：背景/阴影交给 .row-hover，缓动统一为页面里的 spring 写法 */
const ROW_SURFACE =
  "group relative row-hover px-3 py-3.5 transition duration-300 [transition-timing-function:var(--spring)] hover:-translate-y-px sm:px-4";
const ROW_HIGHLIGHT =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0)_58%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100";

export default function ApplicationsPage() {
  const [sent, setSent] = useState<ApplicationView[]>([]);
  const [received, setReceived] = useState<ApplicationView[]>([]);
  const [sentInvitations, setSentInvitations] = useState<InvitationView[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<InvitationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [busyIds, setBusyIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const [response, invitationResponse] = await Promise.all([fetch("/api/applications", { cache: "no-store" }), fetch("/api/invitations", { cache: "no-store" })]);
      const [data, invitationData] = await Promise.all([response.json(), invitationResponse.json()]);
      if (!response.ok || !invitationResponse.ok) { setNotice(data.message ?? invitationData.message ?? "加载失败"); return; }
      setSent(data.sent ?? []); setReceived(data.received ?? []); setSentInvitations(invitationData.sent ?? []); setReceivedInvitations(invitationData.received ?? []);
    } catch {
      setNotice("无法连接服务器，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function decideApplication(id: string, status: Decision) {
    if (busyIds.includes(id)) return;
    setBusyIds((current) => [...current, id]);
    try {
      const response = await fetch(`/api/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await response.json().catch(() => ({}));
      const message = response.ok ? (status === "accepted" ? "已接受申请，队伍人数已更新" : "已拒绝申请") : data.message ?? "操作失败，请稍后重试";
      setNotice(message);
      notify(message, response.ok ? "success" : "error");
      if (response.ok) await load();
    } catch {
      const message = "网络异常，申请状态未更新";
      setNotice(message);
      notify(message, "error");
    } finally {
      setBusyIds((current) => current.filter((value) => value !== id));
    }
  }

  async function decideInvitation(id: string, status: Decision) {
    if (busyIds.includes(id)) return;
    setBusyIds((current) => [...current, id]);
    try {
      const response = await fetch(`/api/invitations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await response.json().catch(() => ({}));
      const message = response.ok ? (status === "accepted" ? "已接受邀请并加入队伍" : "已拒绝邀请") : data.message ?? "操作失败，请稍后重试";
      setNotice(message);
      notify(message, response.ok ? "success" : "error");
      if (response.ok) await load();
    } catch {
      const message = "网络异常，邀请状态未更新";
      setNotice(message);
      notify(message, "error");
    } finally {
      setBusyIds((current) => current.filter((value) => value !== id));
    }
  }

  const pendingApplications = received.filter((item) => item.status === "pending").length;
  const pendingInvitations = receivedInvitations.filter((item) => item.status === "pending").length;
  const pendingTotal = pendingApplications + pendingInvitations;
  const activityTotal = sent.length + received.length + sentInvitations.length + receivedInvitations.length;

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="申请管理"
        title="组队申请与邀请"
        lede="接受后系统会自动更新队伍成员，并关闭同场比赛的其他待处理意向。"
        icon={<Inbox className="size-5" strokeWidth={1.8} />}
      />

      <dl className="e1 mt-8 grid grid-cols-2 divide-x divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
        <div className="px-4 py-3.5">
          <dt className="text-[10.5px] text-faint">等待你处理</dt>
          <dd className="mt-1">
            <CountUp value={pendingTotal} className="num text-[22px] font-semibold leading-none text-ink" />
          </dd>
        </div>
        <div className="px-4 py-3.5">
          <dt className="text-[10.5px] text-faint">全部协作记录</dt>
          <dd className="mt-1">
            <CountUp value={activityTotal} className="num text-[22px] font-semibold leading-none text-ink" />
          </dd>
        </div>
      </dl>

      {notice && (
        <div role="status" className="callout callout-marker mt-5 items-center">
          <CheckCircle2 className="size-4 shrink-0 text-ochre" strokeWidth={1.9} />
          <span>
            {notice}
            {notice.includes("登录") && (
              <Link href="/login?next=/applications" className="ml-2 font-medium text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink">
                去登录
              </Link>
            )}
          </span>
        </div>
      )}

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 py-16 text-[12.5px] text-muted">
          <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2} /> 加载申请与邀请
        </div>
      ) : (
        <div className="mt-9 grid gap-x-6 gap-y-9 lg:grid-cols-2">
          <ListSection
            index={0}
            title="收到的申请"
            count={received.length}
            icon={<Inbox className="size-3.5" strokeWidth={1.9} />}
            items={received}
            empty="还没有收到申请，发布招募后申请会出现在这里。"
            action={{ href: "/opportunities", label: "去组队中心" }}
            render={(item) => <ApplicationRow key={item.id} item={item} received busy={busyIds.includes(item.id)} onDecide={decideApplication} />}
          />
          <ListSection
            index={1}
            title="我发出的申请"
            count={sent.length}
            icon={<Send className="size-3.5" strokeWidth={1.9} />}
            items={sent}
            empty="你还没有申请任何队伍。"
            action={{ href: "/opportunities", label: "查看正在招募的队伍" }}
            render={(item) => <ApplicationRow key={item.id} item={item} />}
          />
          <ListSection
            index={2}
            title="收到的组队邀请"
            count={receivedInvitations.length}
            icon={<MailOpen className="size-3.5" strokeWidth={1.9} />}
            items={receivedInvitations}
            empty="你还没有收到组队邀请。"
            render={(item) => <InvitationRow key={item.id} item={item} received busy={busyIds.includes(item.id)} onDecide={decideInvitation} />}
          />
          <ListSection
            index={3}
            title="我发出的组队邀请"
            count={sentInvitations.length}
            icon={<MailPlus className="size-3.5" strokeWidth={1.9} />}
            items={sentInvitations}
            empty="你还没有发送组队邀请。"
            action={{ href: "/explore", label: "浏览值得认识的人" }}
            render={(item) => <InvitationRow key={item.id} item={item} />}
          />
        </div>
      )}
    </div>
  );
}

function ListSection<T extends { id: string }>({
  index,
  title,
  count,
  icon,
  items,
  empty,
  action,
  render,
}: {
  index: number;
  title: string;
  count: number;
  icon: ReactNode;
  items: T[];
  empty: string;
  action?: { href: string; label: string };
  render: (item: T) => ReactNode;
}) {
  return (
    <Reveal as="section" delay={60 + index * 50} className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
          <span className="text-faint">{icon}</span>
          {title}
        </h2>
        <span className="chip num shrink-0">{count}</span>
      </div>

      {items.length === 0 ? (
        <div className="sunk mt-3.5 rounded-[14px] border border-dashed border-line-strong bg-raise/45 px-4 py-7 text-center">
          <p className="text-[12.5px] leading-6 text-muted">{empty}</p>
          {action && (
            <Link href={action.href} className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-brand hover:underline">
              {action.label} <ArrowUpRight className="size-3" strokeWidth={1.9} />
            </Link>
          )}
        </div>
      ) : (
        <ul className="e1 mt-3.5 overflow-hidden rounded-[14px] border border-line bg-surface">{items.map((item) => render(item))}</ul>
      )}
    </Reveal>
  );
}

function ApplicationRow({
  item,
  received = false,
  busy = false,
  onDecide,
}: {
  item: ApplicationView;
  received?: boolean;
  busy?: boolean;
  onDecide?: (id: string, status: Decision) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `application-message-${item.id}`;
  const title = received ? item.applicantName : item.teamName;
  const canDecide = received && item.status === "pending" && Boolean(onDecide);
  const toggleOpen = () => setOpen((current) => !current);

  return (
    <li className="border-b border-line last:border-b-0">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={panelId}
        className={`${ROW_SURFACE} cursor-pointer`}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("button, a, [data-row-static]")) return;
          toggleOpen();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          if ((event.target as HTMLElement).closest("button, a, [data-row-static]")) return;
          event.preventDefault();
          toggleOpen();
        }}
      >
        <span aria-hidden="true" className={ROW_HIGHLIGHT} />
        <div className="relative flex items-start gap-3">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-raise text-[11px] font-semibold text-ink-soft shadow-[0_1px_1px_rgba(60,48,30,0.06),0_3px_7px_-4px_rgba(60,48,30,0.28),inset_0_1px_0_rgba(255,255,255,0.9)]">
            {title.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="truncate text-[13.5px] font-medium text-ink">{title}</span>
              {received && <span className="text-[11.5px] text-muted">{item.applicantMajor}</span>}
              <StatusChip value={item.status} />
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted">
              <span className="truncate">{item.opportunityTitle}</span>
              <span aria-hidden="true" className="text-line-strong">·</span>
              {received && (
                <>
                  <span className="truncate">申请加入 {item.teamName}</span>
                  <span aria-hidden="true" className="text-line-strong">·</span>
                </>
              )}
              <span className="num text-[11px] text-faint">{formatDate(item.createdAt)}</span>
            </p>

            <MessageBlock id={panelId} open={open} message={item.message} />

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <MessageToggle open={open} onToggle={() => setOpen((current) => !current)} controls={panelId} />
              {canDecide && onDecide && (
                <>
                  <span aria-hidden="true" className="h-3 w-px bg-line" />
                  <DecisionButtons busy={busy} onAccept={() => onDecide(item.id, "accepted")} onReject={() => onDecide(item.id, "rejected")} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function InvitationRow({
  item,
  received = false,
  busy = false,
  onDecide,
}: {
  item: InvitationView;
  received?: boolean;
  busy?: boolean;
  onDecide?: (id: string, status: Decision) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `invitation-message-${item.id}`;
  const title = received ? `${item.senderName} 邀请你` : `邀请 ${item.recipientName}`;
  const canDecide = received && item.status === "pending" && Boolean(onDecide);
  const toggleOpen = () => setOpen((current) => !current);

  return (
    <li className="border-b border-line last:border-b-0">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={panelId}
        className={`${ROW_SURFACE} cursor-pointer`}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("button, a, [data-row-static]")) return;
          toggleOpen();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          if ((event.target as HTMLElement).closest("button, a, [data-row-static]")) return;
          event.preventDefault();
          toggleOpen();
        }}
      >
        <span aria-hidden="true" className={ROW_HIGHLIGHT} />
        <div className="relative flex items-start gap-3">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-raise text-[11px] font-semibold text-ink-soft shadow-[0_1px_1px_rgba(60,48,30,0.06),0_3px_7px_-4px_rgba(60,48,30,0.28),inset_0_1px_0_rgba(255,255,255,0.9)]">
            {(received ? item.senderName : item.recipientName).slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="truncate text-[13.5px] font-medium text-ink">{title}</span>
              <StatusChip value={item.status} />
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted">
              <span className="truncate">{item.opportunityTitle}</span>
              <span aria-hidden="true" className="text-line-strong">·</span>
              <span className="truncate">加入 {item.teamName}</span>
              <span aria-hidden="true" className="text-line-strong">·</span>
              <span className="num text-[11px] text-faint">{formatDate(item.createdAt)}</span>
            </p>

            <MessageBlock id={panelId} open={open} message={item.message} />

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <MessageToggle open={open} onToggle={() => setOpen((current) => !current)} controls={panelId} />
              {canDecide && onDecide && (
                <>
                  <span aria-hidden="true" className="h-3 w-px bg-line" />
                  <DecisionButtons busy={busy} onAccept={() => onDecide(item.id, "accepted")} onReject={() => onDecide(item.id, "rejected")} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function MessageBlock({ id, open, message }: { id: string; open: boolean; message: string }) {
  return (
    <>
      <p hidden={open} data-row-static className="mt-1.5 truncate text-[11.5px] leading-5 text-faint">
        {message}
      </p>
      <div id={id} hidden={!open} data-row-static className="pop panel mt-2.5 px-3 py-2.5 text-[12.5px] leading-6 text-ink-soft">
        {message}
      </div>
    </>
  );
}

function MessageToggle({ open, onToggle, controls }: { open: boolean; onToggle: () => void; controls: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      className="inline-flex h-8 items-center gap-1 rounded-[6px] px-1.5 text-[11.5px] text-muted transition hover:bg-raise hover:text-ink"
    >
      {open ? "收起留言" : "展开留言"}
      <ChevronDown className={`size-3 transition ${open ? "rotate-180" : ""}`} strokeWidth={2} />
    </button>
  );
}

function DecisionButtons({ busy = false, onAccept, onReject }: { busy?: boolean; onAccept: () => void; onReject: () => void }) {
  return (
    <>
      <button type="button" onClick={onAccept} disabled={busy} aria-busy={busy} className="btn btn-primary btn-sm min-h-8 active:brightness-[0.96]">
        {busy ? <LoaderCircle className="size-3 animate-spin" /> : <Check className="size-3" strokeWidth={2.4} />} 接受
      </button>
      <button type="button" onClick={onReject} disabled={busy} aria-busy={busy} className="btn btn-secondary btn-sm min-h-8 active:brightness-[0.97]">
        <X className="size-3" strokeWidth={2.4} /> 拒绝
      </button>
      {busy && <span role="status" className="text-[11px] text-faint">处理中…</span>}
    </>
  );
}

const STATUS_STYLES: Record<"pending" | "accepted" | "rejected", { label: string; className: string }> = {
  pending: { label: "待处理", className: "chip-ochre" },
  accepted: { label: "已接受", className: "chip-moss" },
  rejected: { label: "已拒绝", className: "chip-clay" },
};

function StatusChip({ value }: { value: "pending" | "accepted" | "rejected" }) {
  const status = STATUS_STYLES[value];
  return (
    <span className={`chip ${status.className}`}>
      <span aria-hidden="true" className="size-1 rounded-full bg-current" />
      {status.label}
    </span>
  );
}

function formatDate(value?: string) {
  const text = String(value ?? "").slice(0, 10);
  return text.length === 10 ? text.replaceAll("-", ".") : "—";
}
