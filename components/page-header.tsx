import Link from "next/link";
import { Bell, Search } from "lucide-react";

export function PageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--coral)]">{eyebrow}</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="搜索" className="grid size-10 place-items-center rounded-full border border-black/5 bg-white text-[var(--muted)] shadow-sm"><Search className="size-4" /></button>
        <button aria-label="通知" className="relative grid size-10 place-items-center rounded-full border border-black/5 bg-white text-[var(--muted)] shadow-sm"><Bell className="size-4" /><span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[var(--coral)]" /></button>
        <Link href="/profile" className="ml-1 grid size-10 place-items-center rounded-full bg-gradient-to-br from-[#ff8a67] to-[#ffc15b] text-sm font-bold text-white shadow-sm">陆</Link>
      </div>
    </header>
  );
}

