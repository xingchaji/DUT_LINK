import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center">
      <section className="card e2 w-full max-w-[420px] px-6 py-8 text-center sm:px-8">
        <p className="num text-[42px] font-semibold leading-none tracking-[-0.03em] text-ink">404</p>
        <h1 className="mt-3.5 text-[16.5px] font-semibold leading-snug text-ink">没有找到这个页面</h1>
        <p className="mt-2 text-[12.5px] leading-6 text-muted">链接可能已经失效，或者内容还没有发布。</p>
        <hr className="rule mx-auto mt-5 w-14" />
        <Link href="/" className="btn btn-primary mt-5">
          <ArrowLeft className="size-3.5" strokeWidth={1.9} />
          返回首页
        </Link>
      </section>
    </div>
  );
}
