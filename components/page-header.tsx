import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HeaderActions } from "@/components/header-actions";

export function PageHeader({
  eyebrow,
  title,
  lede,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header>
      <div className="flex items-center justify-between gap-4">
        <nav aria-label="面包屑" className="flex min-w-0 items-center gap-1 text-[11px] text-faint">
          <Link href="/" className="rounded px-1 py-0.5 transition hover:bg-raise hover:text-muted">
            工作台
          </Link>
          <ChevronRight className="size-3 shrink-0 opacity-60" />
          <span className="truncate px-1 text-muted">{eyebrow}</span>
        </nav>
        <HeaderActions />
      </div>

      <div className="mt-6 flex items-start gap-4">
        {icon && (
          <span className="mt-1 grid size-11 shrink-0 place-items-center rounded-[11px] border border-line bg-surface text-brand shadow-[0_1px_2px_rgba(30,29,26,0.05)]">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="page-title">{title}</h1>
          {lede && <p className="page-lede mt-3">{lede}</p>}
          {children}
        </div>
      </div>
    </header>
  );
}
