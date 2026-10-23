import { Sparkles } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid size-8 shrink-0 place-items-center rounded-[10px] border border-[#121110] border-t-[#37332b] bg-[#1e1d1a] text-canvas shadow-[0_1px_1px_rgba(24,20,12,0.2),0_2px_4px_-2px_rgba(24,20,12,0.3),0_8px_16px_-8px_rgba(24,20,12,0.55),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.45)]">
        <Sparkles className="size-[15px]" strokeWidth={2} />
        <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-sidebar bg-gold shadow-[0_1px_2px_rgba(150,110,20,0.5),inset_0_1px_0_rgba(255,255,255,0.5)]" />
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="text-[15px] font-semibold tracking-[-0.02em] text-ink drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">DUT Link</div>
          <div className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.22em] text-faint">Campus workspace</div>
        </div>
      )}
    </div>
  );
}
