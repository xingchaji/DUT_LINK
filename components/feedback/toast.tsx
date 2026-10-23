"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type ToastTone = "success" | "error" | "info";

type ToastItem = { id: number; text: string; tone: ToastTone };

const TONE_STYLE: Record<ToastTone, { icon: typeof CheckCircle2; color: string; border: string }> = {
  success: { icon: CheckCircle2, color: "text-moss", border: "border-moss/25" },
  error: { icon: AlertCircle, color: "text-clay", border: "border-clay/25" },
  info: { icon: Info, color: "text-brand", border: "border-brand/25" },
};

let sequence = 0;
const listeners = new Set<(item: ToastItem) => void>();
const pendingItems: ToastItem[] = [];

/**
 * 任意客户端组件都可以调用：notify("已保存") / notify("失败原因", "error")。
 * 即使提示条还没挂载，消息也会排队等到挂载后再展示。
 */
export function notify(text: string, tone: ToastTone = "success") {
  const value = text.trim();
  if (!value) return;
  const item = { id: ++sequence, text: value, tone };
  if (listeners.size === 0) pendingItems.push(item);
  listeners.forEach((listener) => listener(item));
}

/** 固定在视口右下角（移动端在底部导航之上）的操作反馈层 */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (item: ToastItem) => {
      setItems((current) => {
        if (current.some((existing) => existing.text === item.text && existing.tone === item.tone)) return current;
        return [...current.slice(-2), item];
      });
      const timer = window.setTimeout(() => dismiss(item.id), item.tone === "error" ? 5200 : 3600);
      timers.current.set(item.id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    listeners.add(push);
    if (pendingItems.length) {
      const queued = pendingItems.splice(0);
      queued.forEach(push);
    }
    return () => {
      listeners.delete(push);
    };
  }, [push]);

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => window.clearTimeout(timer));
      map.clear();
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-3 bottom-[86px] z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
    >
      {items.map((item) => {
        const tone = TONE_STYLE[item.tone];
        const Icon = tone.icon;
        return (
          <div
            key={item.id}
            role="status"
            className={`pop pointer-events-none flex w-full max-w-[420px] items-start gap-2.5 rounded-[11px] border bg-surface px-3.5 py-3 text-[12.5px] leading-6 text-ink-soft shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_24px_-12px_rgba(60,48,30,0.26),0_28px_48px_-28px_rgba(60,48,30,0.3)] ${tone.border}`}
          >
            <Icon className={`mt-0.5 size-3.5 shrink-0 ${tone.color}`} strokeWidth={2} />
            <p className="min-w-0 flex-1">
              {item.text}
              {item.text.includes("登录") && (
                <Link
                  href={`/login?next=${encodeURIComponent(typeof window === "undefined" ? "/" : window.location.pathname)}`}
                  className="pointer-events-auto ml-2 font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
                >
                  去登录
                </Link>
              )}
            </p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="关闭提示"
              className="pointer-events-auto grid size-5 shrink-0 place-items-center rounded-[5px] text-faint transition hover:bg-raise hover:text-ink"
            >
              <X className="size-3" strokeWidth={2.2} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
