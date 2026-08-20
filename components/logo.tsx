import { Sparkles } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-[var(--ink)] text-white shadow-[0_8px_24px_rgba(22,31,49,0.18)]">
        <Sparkles className="size-5" strokeWidth={1.8} />
      </div>
      {!compact && (
        <div>
          <div className="font-[family-name:var(--font-display)] text-lg font-bold leading-none tracking-[-0.03em]">DUT Link</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Meet possibilities</div>
        </div>
      )}
    </div>
  );
}

