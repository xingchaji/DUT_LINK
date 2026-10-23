"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center">
      <section className="card e3 w-full max-w-[440px] px-6 py-8 text-center sm:px-8">
        <p className="section-label">Error</p>
        <h1 className="mt-2 text-[16.5px] font-semibold leading-snug text-ink">页面没有加载完成</h1>
        <p className="mt-2 text-[12.5px] leading-6 text-muted">可能是网络短暂中断或服务尚未就绪。重试不会重复你已经做过的操作。</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={() => retry()} className="btn btn-primary">
            <RefreshCw className="size-3.5" strokeWidth={1.9} />
            重新加载
          </button>
          <Link href="/" className="btn btn-ghost">
            返回首页
          </Link>
        </div>
        {error.digest && (
          <p className="panel mx-auto mt-5 w-fit rounded-[8px] px-2.5 py-1">
            <span className="num text-[10.5px] text-faint">Digest {error.digest}</span>
          </p>
        )}
      </section>
    </div>
  );
}
