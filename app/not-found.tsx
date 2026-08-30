import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-10 sm:px-7">
      <section className="card w-full p-7 text-center sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#ebe8ff] text-[var(--violet)]">
          <Compass className="size-7" />
        </span>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral)]">404 · Lost link</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">没有找到这个页面</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[var(--muted)]">链接可能已经失效，或者内容还没有发布。可以返回首页继续探索比赛与队友。</p>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5">
          <ArrowLeft className="size-4 text-[var(--lime)]" />返回首页
        </Link>
      </section>
    </div>
  );
}
