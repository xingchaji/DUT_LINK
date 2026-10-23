import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center" role="status" aria-live="polite">
      <div className="w-full max-w-md text-center">
        <LoaderCircle className="mx-auto size-[13px] animate-spin text-faint" strokeWidth={2} aria-hidden="true" />
        <p className="mt-3 text-[14px] font-medium text-ink">正在准备页面</p>
        <p className="mt-1.5 text-[12.5px] leading-6 text-muted">正在同步你的资料、比赛和组队信息。</p>
      </div>
    </div>
  );
}
