import type { Skill } from "@/lib/types";

const colors: Record<Skill["category"], string> = {
  技术: "bg-[var(--violet)]",
  创意: "bg-[var(--coral)]",
  协作: "bg-[var(--cyan)]",
  探索: "bg-[var(--amber)]",
};

export function SkillBars({ skills }: { skills: Skill[] }) {
  return (
    <div className="space-y-5">
      {skills.map((skill) => (
        <div key={skill.name}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">{skill.name}</span>
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">{skill.score}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/[0.05]">
            <div className={`h-full rounded-full ${colors[skill.category]}`} style={{ width: `${skill.score}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

