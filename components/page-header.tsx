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
    <header className="reveal" style={{ ["--i" as string]: 0 }}>
      <div className="flex items-center justify-between gap-4">
        <nav aria-label="面包屑" className="flex min-w-0 items-center gap-1 text-[11px] text-faint">
          <Link href="/" className="rounded px-1 py-0.5 transition duration-300 hover:-translate-y-px hover:bg-white/70 hover:text-muted hover:shadow-[0_1px_2px_rgba(60,48,30,0.08)]">
            工作台
          </Link>
          <ChevronRight className="size-3 shrink-0 opacity-60" />
          <span className="truncate px-1 text-muted">{eyebrow}</span>
        </nav>
        <HeaderActions />
      </div>

      <div className="mt-6 flex items-start gap-4">
        {icon && (
          <span className="glyph mt-0.5 size-11 shrink-0 text-brand transition duration-500 [transition-timing-function:var(--spring)] hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-8px_rgba(60,48,30,0.35),inset_0_1px_0_#fff]">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="page-title drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">{title}</h1>
          {lede && <p className="page-lede mt-3">{lede}</p>}
          {children}
        </div>
      </div>
    </header>
  );
}
