"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, FileText, LoaderCircle, ShieldAlert, Trophy, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import type { CommunityArticle, Opportunity } from "@/lib/types";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [articles, setArticles] = useState<CommunityArticle[]>([]);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/review", { cache: "no-store" });
    if (response.status === 401 || response.status === 403) { setForbidden(true); setLoading(false); return; }
    const data = await response.json();
    setOpportunities(data.pendingOpportunities ?? []);
    setArticles(data.pendingArticles ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function reviewOpportunity(id: string, decision: "approved" | "rejected") {
    setBusyId(`opportunity-${id}`);
    await fetch(`/api/admin/opportunities/${id}/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision }) });
    setBusyId("");
    setOpportunities((current) => current.filter((item) => item.id !== id));
  }

  async function reviewArticle(id: string, decision: "approved" | "rejected") {
    setBusyId(`article-${id}`);
    await fetch(`/api/admin/articles/${id}/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision }) });
    setBusyId("");
    setArticles((current) => current.filter((item) => item.id !== id));
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-[var(--muted)]"><LoaderCircle className="size-4 animate-spin" /> 加载待审内容</div>;
  if (forbidden) return <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-12"><section className="card w-full overflow-hidden"><div className="dot-grid relative bg-[var(--ink)] p-8 text-center text-white sm:p-12"><div className="absolute -right-12 -top-16 size-44 rounded-full bg-[var(--violet)]/65 blur-3xl" /><div className="relative"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--lime)] text-[var(--ink)]"><ShieldAlert className="size-6" /></div><p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Protected workspace</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.04em]">需要管理员权限</h1><p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/60">当前账号无法访问内容审核。审核操作只对管理员开放，并由服务端再次验证权限。</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-xs font-bold"><ArrowLeft className="size-4" /> 返回首页</Link><Link href="/login?next=/admin" className="rounded-full bg-[var(--lime)] px-5 py-3 text-xs font-bold text-[var(--ink)]">切换管理员账号</Link></div></div></div></section></div>;

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9 xl:px-12">
      <PageHeader eyebrow="Content Review" title="内容审核" />
      <div className="mt-4 flex max-w-4xl items-start gap-3 text-sm leading-7 text-[var(--muted)]"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-[var(--coral)]" /><p>审核学生与校内组织发布的比赛和文章。通过后内容进入公开目录，驳回后不会向普通用户展示。</p></div>

      <section className="relative mt-7 overflow-hidden rounded-[28px] bg-[var(--ink)] p-5 text-white shadow-[0_24px_60px_rgba(23,32,51,0.14)] sm:p-6"><div className="absolute -right-16 -top-20 size-56 rounded-full bg-[var(--violet)]/55 blur-3xl" /><div className="relative grid gap-3 sm:grid-cols-2"><ReviewStat icon={<Trophy className="size-5" />} value={opportunities.length} label="待审核比赛" /><ReviewStat icon={<FileText className="size-5" />} value={articles.length} label="待审核文章" /></div></section>

      <section className="card mt-5 p-6 sm:p-8">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#fff2e3] text-[#bd792a]"><Trophy className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">Opportunity queue</p><h2 className="text-xl font-extrabold">待审核比赛</h2></div><span className="ml-auto grid size-8 place-items-center rounded-full bg-black/[0.04] text-xs font-bold">{opportunities.length}</span></div>
        {opportunities.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">暂无待审核的比赛。</p>
        ) : (
          <ul className="mt-5 space-y-4">
            {opportunities.map((item) => (
              <li key={item.id} className="rounded-[20px] border border-black/[0.06] bg-[var(--paper)]/65 p-5">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                  <div className="min-w-0">
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{item.organizer} · {item.type} · 发布者 {item.publisherName ?? "未知"}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-2 self-stretch sm:self-auto">
                    {busyId === `opportunity-${item.id}` ? <LoaderCircle className="size-4 animate-spin" /> : (
                      <>
                        <button onClick={() => reviewOpportunity(item.id, "approved")} className="inline-flex items-center gap-1 rounded-xl bg-[var(--ink)] px-3 py-2 text-xs font-bold text-white"><Check className="size-3.5 text-[var(--lime)]" /> 通过</button>
                        <button onClick={() => reviewOpportunity(item.id, "rejected")} className="inline-flex items-center gap-1 rounded-xl border border-black/10 px-3 py-2 text-xs font-bold text-red-600"><X className="size-3.5" /> 驳回</button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card mt-5 p-6 sm:p-8">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#eeebff] text-[var(--violet)]"><FileText className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">Article queue</p><h2 className="text-xl font-extrabold">待审核文章</h2></div><span className="ml-auto grid size-8 place-items-center rounded-full bg-black/[0.04] text-xs font-bold">{articles.length}</span></div>
        {articles.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">暂无待审核的文章。</p>
        ) : (
          <ul className="mt-5 space-y-4">
            {articles.map((item) => (
              <li key={item.id} className="rounded-[20px] border border-black/[0.06] bg-[var(--paper)]/65 p-5">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                  <div className="min-w-0">
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{item.authorName} · {item.authorMajor} · {item.bridge}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.summary}</p>
                  </div>
                  <div className="flex shrink-0 gap-2 self-stretch sm:self-auto">
                    {busyId === `article-${item.id}` ? <LoaderCircle className="size-4 animate-spin" /> : (
                      <>
                        <button onClick={() => reviewArticle(item.id, "approved")} className="inline-flex items-center gap-1 rounded-xl bg-[var(--ink)] px-3 py-2 text-xs font-bold text-white"><Check className="size-3.5 text-[var(--lime)]" /> 通过</button>
                        <button onClick={() => reviewArticle(item.id, "rejected")} className="inline-flex items-center gap-1 rounded-xl border border-black/10 px-3 py-2 text-xs font-bold text-red-600"><X className="size-3.5" /> 驳回</button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ReviewStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.065] p-4"><span className="grid size-10 place-items-center rounded-xl bg-white/10 text-[var(--lime)]">{icon}</span><div><p className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.05em]">{value}</p><p className="text-[10px] text-white/45">{label}</p></div></div>;
}
