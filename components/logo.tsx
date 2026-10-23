import { Sparkles } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid size-8 shrink-0 place-items-center rounded-[9px] bg-ink text-canvas shadow-[0_1px_2px_rgba(30,29,26,0.25)]">
        <Sparkles className="size-[15px]" strokeWidth={2} />
        <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-sidebar bg-gold" />
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="text-[15px] font-semibold tracking-[-0.02em] text-ink">DUT Link</div>
          <div className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.22em] text-faint">Campus workspace</div>
        </div>
      )}
    </div>
  );
}
