"use client";

import "./globals.css";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="zh-CN">
      <body>
        <main className="page-shell flex min-h-screen items-center justify-center">
          <section className="card e3 w-full max-w-[440px] px-6 py-8 text-center sm:px-8">
            <p className="section-label">DUT Link</p>
            <h1 className="mt-2 text-[16.5px] font-semibold leading-snug text-ink">应用暂时无法显示</h1>
            <p className="mt-2 text-[12.5px] leading-6 text-muted">
              初始化过程中出现了意外问题。请重试；如果仍然失败，请检查启动窗口中的错误信息。
            </p>
            <button type="button" onClick={() => retry()} className="btn btn-primary mt-5">
              重新加载
            </button>
            {error.digest && (
              <p className="panel mx-auto mt-5 w-fit rounded-[8px] px-2.5 py-1">
                <span className="num text-[10.5px] text-faint">Digest {error.digest}</span>
              </p>
            )}
          </section>
        </main>
      </body>
    </html>
  );
}
