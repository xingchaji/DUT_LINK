"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md text-center">
        <h1 className="text-[19px] font-semibold leading-snug tracking-[-0.02em] text-ink">页面没有加载完成</h1>
        <p className="mt-2 text-[13px] leading-6 text-muted">可能是网络短暂中断或服务尚未就绪。重试不会重复你已经做过的操作。</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button type="button" onClick={() => retry()} className="btn btn-primary">
            <RefreshCw className="size-3.5" strokeWidth={1.9} />
            重新加载
          </button>
          <Link href="/" className="btn btn-ghost">
            返回首页
          </Link>
        </div>
        {error.digest && <p className="num mt-5 text-[10.5px] text-faint">Digest {error.digest}</p>}
      </div>
    </div>
  );
}
