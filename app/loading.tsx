import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center" role="status" aria-live="polite">
      <section className="card e2 w-full max-w-[420px] px-6 py-8 text-center sm:px-8">
        <LoaderCircle className="mx-auto size-[13px] animate-spin text-faint" strokeWidth={2} aria-hidden="true" />
        <p className="mt-3 text-[14px] font-medium text-ink">正在准备页面</p>
        <p className="mt-1.5 text-[12.5px] leading-6 text-muted">正在同步你的资料、比赛和组队信息。</p>
        <div aria-hidden className="mt-5 space-y-2">
          <span className="sunk mx-auto block h-1.5 w-3/4 animate-pulse rounded-full bg-raise" />
          <span className="sunk mx-auto block h-1.5 w-1/2 animate-pulse rounded-full bg-raise" />
        </div>
      </section>
    </div>
  );
}
