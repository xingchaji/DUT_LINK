"use client";

import "./globals.css";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="zh-CN">
      <body>
        <main className="page-shell flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md text-center">
            <p className="text-[11px] text-faint">DUT Link</p>
            <h1 className="mt-3 text-[19px] font-semibold leading-snug tracking-[-0.02em] text-ink">应用暂时无法显示</h1>
            <p className="mt-2 text-[13px] leading-6 text-muted">
              初始化过程中出现了意外问题。请重试；如果仍然失败，请检查启动窗口中的错误信息。
            </p>
            <button type="button" onClick={() => retry()} className="btn btn-primary mt-6">
              重新加载
            </button>
            {error.digest && <p className="num mt-5 text-[10.5px] text-faint">Digest {error.digest}</p>}
          </div>
        </main>
      </body>
    </html>
  );
}
