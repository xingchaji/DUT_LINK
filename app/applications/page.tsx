"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Clock3, Inbox, LoaderCircle, Send, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import type { RecruitmentApplication } from "@/lib/types";

type ApplicationView = RecruitmentApplication & { teamName: string; opportunityTitle: string };

export default function ApplicationsPage() {
  const [sent, setSent] = useState<ApplicationView[]>([]);
  const [received, setReceived] = useState<ApplicationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/applications", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) { setNotice(data.message); setLoading(false); return; }
    setSent(data.sent ?? []); setReceived(data.received ?? []); setLoading(false);
  }, []);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function decide(id: string, status: "accepted" | "rejected") {
    const response = await fetch(`/api/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await response.json();
    setNotice(response.ok ? (status === "accepted" ? "已接受申请，队伍人数已更新" : "已拒绝申请") : data.message);
    if (response.ok) await load();
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <PageHeader eyebrow="Application Center" title="让每一次申请都有结果" />
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">这里不是选手统计名单，只处理 DUT Link 内的组队意向。队长接受申请后，系统会更新队伍人数。</p>
      {notice && <div className="mt-5 rounded-2xl bg-[var(--lime)]/45 px-4 py-3 text-sm">{notice}{notice.includes("登录") && <Link href="/login?next=/applications" className="ml-2 font-bold underline">去登录</Link>}</div>}
      {loading ? <div className="flex items-center justify-center gap-2 py-20 text-sm text-[var(--muted)]"><LoaderCircle className="size-4 animate-spin" /> 加载申请</div> : <div className="mt-8 grid gap-7 lg:grid-cols-2">
        <section><div className="flex items-center gap-3"><Inbox className="size-5 text-[var(--coral)]" /><div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold">收到的申请</h2><p className="text-xs text-[var(--muted)]">你发布的队伍收到 {received.length} 条申请</p></div></div><div className="mt-5 space-y-4">{received.map((item) => <article key={item.id} className="card p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold text-[var(--violet)]">{item.opportunityTitle}</p><h3 className="mt-2 font-bold">{item.applicantName} · {item.applicantMajor}</h3><p className="mt-1 text-xs text-[var(--muted)]">申请加入 {item.teamName}</p></div><Status value={item.status} /></div><p className="mt-4 rounded-2xl bg-[var(--paper)] p-4 text-sm leading-6 text-[var(--muted)]">{item.message}</p>{item.status === "pending" && <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => decide(item.id, "accepted")} className="flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-xs font-bold text-white"><Check className="size-4" /> 接受</button><button onClick={() => decide(item.id, "rejected")} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-xs font-bold"><X className="size-4" /> 拒绝</button></div>}</article>)}{received.length === 0 && <Empty text="还没有收到申请" />}</div></section>
        <section><div className="flex items-center gap-3"><Send className="size-5 text-[var(--violet)]" /><div><h2 className="font-[family-name:var(--font-display)] text-xl font-bold">我发出的申请</h2><p className="text-xs text-[var(--muted)]">查看队长的处理结果</p></div></div><div className="mt-5 space-y-4">{sent.map((item) => <article key={item.id} className="card p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold text-[var(--violet)]">{item.opportunityTitle}</p><h3 className="mt-2 font-bold">{item.teamName}</h3></div><Status value={item.status} /></div><p className="mt-4 text-sm leading-6 text-[var(--muted)]">{item.message}</p></article>)}{sent.length === 0 && <Empty text="你还没有申请任何队伍" />}</div></section>
      </div>}
    </div>
  );
}

function Status({ value }: { value: RecruitmentApplication["status"] }) {
  const labels = { pending: "待处理", accepted: "已接受", rejected: "已拒绝" };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${value === "accepted" ? "bg-emerald-50 text-emerald-700" : value === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}><Clock3 className="size-3" /> {labels[value]}</span>;
}
function Empty({ text }: { text: string }) { return <div className="rounded-3xl border border-dashed border-black/10 p-8 text-center text-sm text-[var(--muted)]">{text}</div>; }
