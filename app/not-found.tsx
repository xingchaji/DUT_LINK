import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md text-center">
        <p className="num text-[11px] text-faint">404</p>
        <h1 className="mt-3 text-[19px] font-semibold leading-snug tracking-[-0.02em] text-ink">没有找到这个页面</h1>
        <p className="mt-2 text-[13px] leading-6 text-muted">链接可能已经失效，或者内容还没有发布。</p>
        <Link href="/" className="btn btn-primary mt-6">
          <ArrowLeft className="size-3.5" strokeWidth={1.9} />
          返回首页
        </Link>
      </div>
    </div>
  );
}
