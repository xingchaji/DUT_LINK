import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10" role="status" aria-live="polite">
      <div className="overflow-hidden rounded-[2rem] bg-[var(--ink)] p-6 text-white shadow-[0_24px_70px_rgba(23,32,51,0.14)] sm:p-9">
        <div className="flex items-center gap-3 text-sm font-bold">
          <LoaderCircle className="size-5 animate-spin text-[var(--lime)]" />
          正在准备页面
        </div>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">正在同步你的资料、比赛和组队信息，请稍候。</p>
      </div>
      <div className="mt-7 grid gap-5 md:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <div key={item} className="card animate-pulse p-6">
            <div className="h-3 w-20 rounded-full bg-black/[0.06]" />
            <div className="mt-5 h-7 w-2/3 rounded-xl bg-black/[0.07]" />
            <div className="mt-4 h-3 rounded-full bg-black/[0.05]" />
            <div className="mt-2 h-3 w-4/5 rounded-full bg-black/[0.05]" />
          </div>
        ))}
      </div>
    </div>
  );
}
