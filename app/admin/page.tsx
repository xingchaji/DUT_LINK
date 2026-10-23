"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, FileText, LoaderCircle, ShieldAlert, ShieldCheck, Trophy, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { notify } from "@/components/feedback/toast";
import { CountUp } from "@/components/motion/metric";
import type { CommunityArticle, Opportunity } from "@/lib/types";

type ReviewedEntry = {
  key: string;
  kind: "比赛" | "文章";
  title: string;
  meta: string;
  decision: "approved" | "rejected";
};

const REVIEW_RESULT: Record<ReviewedEntry["decision"], { label: string; className: string }> = {
  approved: { label: "已通过", className: "chip-moss" },
  rejected: { label: "已驳回", className: "chip-clay" },
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [articles, setArticles] = useState<CommunityArticle[]>([]);
  const [busyId, setBusyId] = useState("");
  const [reviewed, setReviewed] = useState<ReviewedEntry[]>([]);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/review", { cache: "no-store" });
      if (response.status === 401 || response.status === 403) { setForbidden(true); return; }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { notify(data.message ?? "无法加载待审内容", "error"); return; }
      setOpportunities(data.pendingOpportunities ?? []);
      setArticles(data.pendingArticles ?? []);
    } catch {
      notify("网络异常，无法加载待审内容", "error");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function reviewOpportunity(id: string, decision: "approved" | "rejected") {
    if (busyId) return;
    setBusyId(`opportunity-${id}`);
    const target = opportunities.find((item) => item.id === id);
    try {
      const response = await fetch(`/api/admin/opportunities/${id}/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        notify(data.message ?? "审核失败，请重试", "error");
        return;
      }
      setOpportunities((current) => current.filter((item) => item.id !== id));
      if (target) {
        setReviewed((current) => [
          { key: `opportunity-${id}`, kind: "比赛", title: target.title, meta: `${target.organizer} · ${target.type}`, decision },
          ...current,
        ]);
      }
      notify(decision === "approved" ? `已通过：${target?.title ?? "比赛"}` : `已驳回：${target?.title ?? "比赛"}`);
    } catch {
      notify("网络异常，审核未提交", "error");
    } finally {
      setBusyId("");
    }
  }

  async function reviewArticle(id: string, decision: "approved" | "rejected") {
    if (busyId) return;
    setBusyId(`article-${id}`);
    const target = articles.find((item) => item.id === id);
    try {
      const response = await fetch(`/api/admin/articles/${id}/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        notify(data.message ?? "审核失败，请重试", "error");
        return;
      }
      setArticles((current) => current.filter((item) => item.id !== id));
      if (target) {
        setReviewed((current) => [
          { key: `article-${id}`, kind: "文章", title: target.title, meta: `${target.authorName} · ${target.authorMajor}`, decision },
          ...current,
        ]);
      }
      notify(decision === "approved" ? `已通过：${target?.title ?? "文章"}` : `已驳回：${target?.title ?? "文章"}`);
    } catch {
      notify("网络异常，审核未提交", "error");
    } finally {
      setBusyId("");
    }
  }

  const queueCount = opportunities.length + articles.length;

  if (loading) {
    return (
      <div className="page-shell">
        <div className="flex min-h-[50vh] items-center justify-center gap-2 text-[12.5px] text-muted">
          <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2} /> 加载待审内容
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="page-shell">
        <div className="mx-auto mt-10 max-w-xl">
          <section className="card reveal p-7 sm:p-9">
            <span className="grid size-10 place-items-center rounded-[10px] border border-line bg-raise text-ink-soft">
              <ShieldAlert className="size-5" strokeWidth={1.8} />
            </span>
            <h1 className="mt-5 text-[20px] font-semibold tracking-[-0.02em] text-ink">需要管理员权限</h1>
            <p className="mt-2 text-[13px] leading-7 text-muted">
              当前账号无法访问内容审核。审核操作只对管理员开放，并由服务端再次验证权限。
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link href="/" className="btn btn-secondary">
                <ArrowLeft className="size-3.5" strokeWidth={1.9} /> 返回首页
              </Link>
              <Link href="/login?next=/admin" className="btn btn-primary">
                切换管理员账号
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="内容审核"
        title="内容审核"
        lede="审核学生与校内组织发布的比赛和文章。通过后内容进入公开目录，驳回后不会向普通用户展示。"
        icon={<ShieldCheck className="size-5" strokeWidth={1.8} />}
      />

      <dl className="e1 mt-8 grid grid-cols-3 divide-x divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
        <div className="px-4 py-3.5">
          <dt className="flex items-center gap-1.5 text-[10.5px] text-faint">
            <Trophy className="size-3 shrink-0" strokeWidth={1.9} /> 待审比赛
          </dt>
          <dd className="mt-1">
            <CountUp value={opportunities.length} className="num text-[22px] font-semibold leading-none text-ink" />
          </dd>
        </div>
        <div className="px-4 py-3.5">
          <dt className="flex items-center gap-1.5 text-[10.5px] text-faint">
            <FileText className="size-3 shrink-0" strokeWidth={1.9} /> 待审文章
          </dt>
          <dd className="mt-1">
            <CountUp value={articles.length} className="num text-[22px] font-semibold leading-none text-ink" />
          </dd>
        </div>
        <div className="px-4 py-3.5">
          <dt className="flex items-center gap-1.5 text-[10.5px] text-faint">
            <ShieldCheck className="size-3 shrink-0" strokeWidth={1.9} /> 本次已处理
          </dt>
          <dd className="mt-1">
            <CountUp value={reviewed.length} className="num text-[22px] font-semibold leading-none text-ink" />
          </dd>
        </div>
      </dl>

      <div className="mt-9 space-y-9">
        <section className="reveal" style={{ ["--i" as string]: 0 }}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="section-label">Pending</p>
              <h2 className="section-title mt-1.5">待审核</h2>
              <p className="section-desc mt-1">通过后进入公开目录，驳回后不对普通用户展示。</p>
            </div>
            <span className="chip num shrink-0">{queueCount}</span>
          </div>

          {queueCount === 0 ? (
            <div className="sunk mt-3.5 rounded-[14px] border border-dashed border-line-strong bg-raise/45 px-4 py-8 text-center">
              <p className="text-[12.5px] leading-6 text-muted">队列已清空，暂时没有待审内容。</p>
            </div>
          ) : (
            <div className="e1 mt-3.5 overflow-hidden rounded-[14px] border border-line bg-surface">
              <div className="hidden border-b border-line bg-raise/70 px-4 py-2 text-[10.5px] text-faint shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(60,48,30,0.05)] md:grid md:grid-cols-[minmax(0,1fr)_160px_76px_152px] md:gap-3">
                <span>标题</span>
                <span>类型 / 来源</span>
                <span>状态</span>
                <span className="text-right">操作</span>
              </div>

              {opportunities.map((item) => (
                <ReviewRow
                  key={item.id}
                  title={item.title}
                  summary={item.description}
                  kind={item.type}
                  source={item.organizer}
                  extra={`发布者 ${item.publisherName ?? "未知"}`}
                  busy={busyId === `opportunity-${item.id}`}
                  onApprove={() => reviewOpportunity(item.id, "approved")}
                  onReject={() => reviewOpportunity(item.id, "rejected")}
                />
              ))}

              {articles.map((item) => (
                <ReviewRow
                  key={item.id}
                  title={item.title}
                  summary={item.summary}
                  kind="文章"
                  source={`${item.authorName} · ${item.authorMajor}`}
                  extra={item.bridge}
                  busy={busyId === `article-${item.id}`}
                  onApprove={() => reviewArticle(item.id, "approved")}
                  onReject={() => reviewArticle(item.id, "rejected")}
                />
              ))}
            </div>
          )}
        </section>

        <section className="reveal" style={{ ["--i" as string]: 1 }}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="section-label">Reviewed</p>
              <h2 className="section-title mt-1.5">已处理</h2>
              <p className="section-desc mt-1">本次打开页面后完成的审核结果。</p>
            </div>
            <span className="chip num shrink-0">{reviewed.length}</span>
          </div>

          {reviewed.length === 0 ? (
            <div className="sunk mt-3.5 rounded-[14px] border border-dashed border-line-strong bg-raise/45 px-4 py-8 text-center">
              <p className="text-[12.5px] leading-6 text-muted">本次还没有处理记录，审核结果会在这里按时间倒序排列。</p>
            </div>
          ) : (
            <div className="e1 mt-3.5 overflow-hidden rounded-[14px] border border-line bg-surface">
              {reviewed.map((entry) => (
                <div key={entry.key} className="border-b border-line last:border-b-0">
                  <div className="grid gap-1.5 px-4 py-3 md:grid-cols-[minmax(0,1fr)_160px_76px] md:items-center md:gap-3">
                    <p className="truncate text-[13px] font-medium text-ink">{entry.title}</p>
                    <p className="min-w-0 truncate text-[11.5px] text-muted">
                      <span className="chip mr-2">{entry.kind}</span>
                      {entry.meta}
                    </p>
                    <p className="md:text-right">
                      <span className={`chip ${REVIEW_RESULT[entry.decision].className}`}>{REVIEW_RESULT[entry.decision].label}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ReviewRow({
  title,
  summary,
  kind,
  source,
  extra,
  busy,
  onApprove,
  onReject,
}: {
  title: string;
  summary: string;
  kind: string;
  source: string;
  extra: string;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="border-b border-line last:border-b-0">
      <div className="group relative row-hover grid gap-2 px-4 py-3.5 transition duration-300 [transition-timing-function:var(--spring)] hover:-translate-y-px md:grid-cols-[minmax(0,1fr)_160px_76px_152px] md:items-center md:gap-3">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0)_58%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <div className="relative min-w-0">
          <p className="truncate text-[13.5px] font-medium text-ink">{title}</p>
          <p className="mt-1 line-clamp-2 text-[11.5px] leading-5 text-muted">{summary}</p>
        </div>

        <div className="relative min-w-0 text-[11.5px]">
          <span className="chip">{kind}</span>
          <span className="mt-1 block truncate text-[11px] text-muted">{source}</span>
          <span className="mt-0.5 block truncate text-[11px] text-faint">{extra}</span>
        </div>

        <div className="relative">
          <span className="chip chip-ochre">
            <span aria-hidden="true" className="size-1 rounded-full bg-current" />
            待审核
          </span>
        </div>

        <div className="relative flex flex-wrap items-center gap-2 md:justify-end">
          {busy ? (
            <span role="status" className="inline-flex items-center gap-1.5 text-[11.5px] text-muted">
              <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2} /> 提交中
            </span>
          ) : (
            <>
              <button type="button" onClick={onApprove} className="btn btn-primary btn-sm min-h-8 active:brightness-[0.96]">
                <Check className="size-3" strokeWidth={2.4} /> 通过
              </button>
              <button type="button" onClick={onReject} className="btn btn-secondary btn-sm min-h-8 active:brightness-[0.97]">
                <X className="size-3" strokeWidth={2.4} /> 驳回
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
