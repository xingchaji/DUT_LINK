"use client";

import { Meter } from "@/components/motion/metric";
import type { Skill } from "@/lib/types";

const styles: Record<Skill["category"], { color: string; dot: string; glow: string }> = {
  技术: { color: "linear-gradient(90deg,#4a6ce4,#3354cc)", dot: "bg-brand", glow: "shadow-[0_0_0_3px_rgba(59,95,217,0.12)]" },
  创意: { color: "linear-gradient(90deg,#c96a45,#a84a29)", dot: "bg-clay", glow: "shadow-[0_0_0_3px_rgba(180,83,47,0.12)]" },
  协作: { color: "linear-gradient(90deg,#1f8d84,#0f6b66)", dot: "bg-tea", glow: "shadow-[0_0_0_3px_rgba(20,111,105,0.12)]" },
  探索: { color: "linear-gradient(90deg,#c58e2a,#9d6b13)", dot: "bg-ochre", glow: "shadow-[0_0_0_3px_rgba(157,107,19,0.12)]" },
};

export function SkillBars({ skills }: { skills: Skill[] }) {
  return (
    <div className="space-y-3.5">
      {skills.map((skill, index) => {
        const style = styles[skill.category] ?? styles.技术;
        return (
          <div key={skill.name}>
            <div className="flex items-center justify-between gap-3 text-[12px]">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className={`size-1.5 shrink-0 rounded-full ${style.dot} ${style.glow}`} />
                <span className="truncate font-medium text-ink-soft">{skill.name}</span>
              </span>
              <span className="num shrink-0 text-[11px] text-muted">{skill.score}</span>
            </div>
            <div className="mt-1.5">
              <Meter value={skill.score} height={6} color={style.color} delay={index * 90} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
