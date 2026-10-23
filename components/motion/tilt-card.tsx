"use client";

import { useRef, type ReactNode } from "react";

type TiltProps = {
  children: ReactNode;
  className?: string;
  /** 最大倾斜角度 */
  max?: number;
  /** 悬停时抬升像素 */
  lift?: number;
  /** 指针跟随高光 */
  glare?: boolean;
  /** 外圈聚光描边 */
  spotlight?: boolean;
  style?: React.CSSProperties;
};

/**
 * 指针驱动的 3D 倾斜卡片。只写 CSS 变量 + transform，不触发重排。
 * 触屏与 prefers-reduced-motion 下自动退化为静态卡片。
 */
export function TiltCard({ children, className = "", max = 6, lift = 4, glare = true, spotlight = false, style }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const rect = useRef<DOMRect | null>(null);
  const inside = useRef(false);

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function handleEnter(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || reduced()) return;
    const el = ref.current;
    if (!el) return;
    inside.current = true;
    rect.current = el.getBoundingClientRect();
    el.dataset.tracking = "true";
    el.style.setProperty("--ty", `${-lift}px`);
  }

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !inside.current) return;
    const el = ref.current;
    const box = rect.current;
    if (!el || !box) return;

    const px = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    const py = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height));

    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const node = ref.current;
      if (!node) return;
      node.style.setProperty("--rx", `${(py - 0.5) * max}deg`);
      node.style.setProperty("--ry", `${(0.5 - px) * max}deg`);
      node.style.setProperty("--mx", `${px * 100}%`);
      node.style.setProperty("--my", `${py * 100}%`);
      node.style.setProperty("--sx", `${px * 100}%`);
      node.style.setProperty("--sy", `${py * 100}%`);
    });
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    inside.current = false;
    rect.current = null;
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    delete el.dataset.tracking;
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
    el.style.removeProperty("--ty");
  }

  return (
    <div
      ref={ref}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerCancel={handleLeave}
      className={`tilt relative ${spotlight ? "spot" : ""} ${className}`}
      style={style}
    >
      {children}
      {glare && <span aria-hidden className="tilt-glare" />}
    </div>
  );
}

/** 指针跟随的柔和高光，不倾斜，用于列表 / 面板 */
export function Spot({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const box = ref.current?.getBoundingClientRect();
    if (!box || frame.current) return;
    const px = ((event.clientX - box.left) / box.width) * 100;
    const py = ((event.clientY - box.top) / box.height) * 100;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const node = ref.current;
      if (!node) return;
      node.style.setProperty("--sx", `${px}%`);
      node.style.setProperty("--sy", `${py}%`);
    });
  }

  return (
    <div ref={ref} onPointerMove={handleMove} className={`spot ${className}`} style={style}>
      {children}
    </div>
  );
}
