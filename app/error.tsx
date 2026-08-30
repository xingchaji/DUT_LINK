"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-10 sm:px-7">
      <section className="card w-full overflow-hidden">
        <div className="dot-grid bg-[var(--ink)] p-7 text-white sm:p-10">
          <span className="grid size-12 place-items-center rounded-2xl bg-[var(--coral)] text-white">
            <AlertTriangle className="size-6" />
          </span>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-white/45">Page interrupted</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">页面暂时没有加载完成</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">可能是网络短暂中断或服务尚未就绪。你的操作不会自动重复，可以放心重试。</p>
        </div>
        <div className="flex flex-wrap gap-3 p-6 sm:p-8">
          <button type="button" onClick={() => retry()} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--violet)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5">
            <RefreshCw className="size-4" />重新加载
          </button>
          <Link href="/" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-bold transition hover:border-[var(--violet)]/30 hover:text-[var(--violet)]">
            <ArrowLeft className="size-4" />返回首页
          </Link>
        </div>
      </section>
    </div>
  );
}
