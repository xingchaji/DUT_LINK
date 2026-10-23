"use client";

import { useRef, type ReactNode } from "react";

/**
 * 磁性按钮容器：指针靠近时轻微位移，离开后弹回。
 * 只作用于鼠标，触屏与减少动态模式下完全静态。
 */
export function Magnetic({ children, strength = 5, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);

  function handleMove(event: React.PointerEvent<HTMLSpanElement>) {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = ref.current?.getBoundingClientRect();
    if (!box || frame.current) return;
    const dx = ((event.clientX - (box.left + box.width / 2)) / (box.width / 2)) * strength;
    const dy = ((event.clientY - (box.top + box.height / 2)) / (box.height / 2)) * strength;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const node = ref.current;
      if (!node) return;
      node.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
    });
  }

  function reset() {
    const node = ref.current;
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    if (node) node.style.transform = "";
  }

  return (
    <span ref={ref} onPointerMove={handleMove} onPointerLeave={reset} onPointerCancel={reset} className={`inline-flex transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${className}`}>
      {children}
    </span>
  );
}
