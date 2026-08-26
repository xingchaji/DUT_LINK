"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ClipboardCheck, LoaderCircle, X } from "lucide-react";
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
  if (forbidden) return <div className="mx-auto max-w-3xl px-5 py-16 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--ink)] text-[var(--lime)]"><ClipboardCheck className="size-5" /></div><h1 className="mt-6 text-2xl font-bold">需要管理员权限</h1><p className="mt-3 text-sm text-[var(--muted)]">当前账号不是管理员，无法访问内容审核。</p></div>;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <PageHeader eyebrow="Content Review" title="内容审核" />
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">审核学生与校内组织发布的比赛和文章，通过后内容进入公开目录。</p>

      <section className="card mt-8 p-6 sm:p-8">
        <h2 className="text-xl font-bold">待审核比赛</h2>
        {opportunities.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">暂无待审核的比赛。</p>
        ) : (
          <ul className="mt-5 space-y-4">
            {opportunities.map((item) => (
              <li key={item.id} className="rounded-2xl bg-[var(--paper)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{item.organizer} · {item.type} · 发布者 {item.publisherName ?? "未知"}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
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

      <section className="card mt-7 p-6 sm:p-8">
        <h2 className="text-xl font-bold">待审核文章</h2>
        {articles.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">暂无待审核的文章。</p>
        ) : (
          <ul className="mt-5 space-y-4">
            {articles.map((item) => (
              <li key={item.id} className="rounded-2xl bg-[var(--paper)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{item.authorName} · {item.authorMajor} · {item.bridge}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.summary}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
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
