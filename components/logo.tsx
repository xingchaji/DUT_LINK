import { Sparkles } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-10 place-items-center overflow-hidden rounded-[15px] bg-[var(--ink)] text-white shadow-[0_10px_28px_rgba(22,31,49,0.2)]">
        <div className="absolute -right-2 -top-2 size-6 rounded-full bg-[var(--violet)] blur-sm" />
        <Sparkles className="relative size-[18px]" strokeWidth={1.9} />
      </div>
      {!compact && (
        <div>
          <div className="font-[family-name:var(--font-display)] text-lg font-extrabold leading-none tracking-[-0.035em]">DUT Link</div>
          <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--muted)]">Meet possibilities</div>
        </div>
      )}
    </div>
  );
}
