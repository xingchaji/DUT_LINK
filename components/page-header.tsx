import { HeaderActions } from "@/components/header-actions";

export function PageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--coral)]">{eyebrow}</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{title}</h1>
      </div>
      <HeaderActions />
    </header>
  );
}
