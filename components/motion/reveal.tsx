"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * 滚动进入时才揭示。
 * - 首屏内容在首帧后立即揭示，避免闪烁
 * - 无 JS 或系统要求减少动态时，内容始终可见
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  ...rest
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!document.documentElement.classList.contains("js-motion")) return;
    if (typeof IntersectionObserver === "undefined") return;

    let frame = 0;
    const show = () => {
      frame = requestAnimationFrame(() => node.classList.add("is-in"));
    };

    if (node.getBoundingClientRect().top < window.innerHeight * 0.94) {
      show();
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            show();
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <Tag ref={ref} className={`reveal-on-scroll ${className}`} style={{ ["--d" as string]: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
