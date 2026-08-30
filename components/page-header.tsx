import { HeaderActions } from "@/components/header-actions";

export function PageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] shadow-sm">
          <span className="size-1.5 rounded-full bg-[var(--coral)]" />
          {eyebrow}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.045em] sm:text-[2.65rem] sm:leading-none">{title}</h1>
      </div>
      <HeaderActions />
    </header>
  );
}
