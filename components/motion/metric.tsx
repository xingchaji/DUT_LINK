"use client";

import { useEffect, useRef } from "react";

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 进入视区后从 0 数到目标值。
 * 直接写 textContent，避免每帧 re-render；SSR 首帧渲染的是最终值，无 JS 也可读。
 */
export function CountUp({
  value,
  duration = 950,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "",
}: {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const format = (n: number) => `${prefix}${decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString()}${suffix}`;
    const target = format(value);

    if (!document.documentElement.classList.contains("js-motion") || prefersReduced() || typeof IntersectionObserver === "undefined") {
      node.textContent = target;
      return;
    }

    // 已经播放过一次的计数，后续变化直接落到终值，避免每次更新都从 0 重播
    if (animated.current) {
      node.textContent = target;
      return;
    }

    let raf = 0;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      animated.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        node.textContent = format(value * easeOutQuart(progress));
        if (progress < 1) raf = requestAnimationFrame(tick);
        else node.textContent = target;
      };
      node.textContent = format(0);
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            run();
          }
        }
      },
      { threshold: 0.35 },
    );

    if (node.getBoundingClientRect().top < window.innerHeight * 0.95) run();
    else observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      node.textContent = target;
    };
  }, [value, duration, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {`${prefix}${decimals > 0 ? value.toFixed(decimals) : value}${suffix}`}
    </span>
  );
}

/**
 * 进度条 / 能力条：进入视区后从 0 生长。
 * 宽度由 CSS 变量驱动，js-motion 存在时默认收起；类名 is-in 后展开。
 */
export function Meter({
  value,
  max = 100,
  color = "var(--color-ink)",
  className = "",
  height = 6,
  delay = 0,
}: {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  height?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!document.documentElement.classList.contains("js-motion")) return;
    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("is-in");
      return;
    }
    let timer = 0;
    const reveal = () => {
      timer = window.setTimeout(() => node.classList.add("is-in"), delay);
    };
    if (node.getBoundingClientRect().top < window.innerHeight * 0.94) {
      reveal();
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            reveal();
          }
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [delay]);

  return (
    <div ref={ref} className={`meter ${className}`} style={{ height, ["--w" as string]: `${percent}%` }}>
      <span style={{ background: color }} />
    </div>
  );
}

/** 环形进度，用于画像完成度等单值指标 */
export function Ring({
  value,
  size = 64,
  stroke = 6,
  color = "var(--color-ink)",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(100, Math.max(0, value));

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!document.documentElement.classList.contains("js-motion")) return;
    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("is-in");
      return;
    }
    let timer = 0;
    const reveal = () => {
      timer = window.setTimeout(() => node.classList.add("is-in"), 140);
    };
    if (node.getBoundingClientRect().top < window.innerHeight * 0.94) {
      reveal();
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            reveal();
          }
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} className="ring relative grid place-items-center" style={{ width: size, height: size, ["--circ" as string]: circumference, ["--off" as string]: circumference * (1 - percent / 100) }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-sink)" strokeWidth={stroke} />
        <circle className="ring-bar" cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
