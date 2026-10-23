import type { Skill } from "@/lib/types";

const styles: Record<Skill["category"], { bar: string; dot: string }> = {
  技术: { bar: "bg-brand", dot: "bg-brand" },
  创意: { bar: "bg-clay", dot: "bg-clay" },
  协作: { bar: "bg-tea", dot: "bg-tea" },
  探索: { bar: "bg-ochre", dot: "bg-ochre" },
};

export function SkillBars({ skills }: { skills: Skill[] }) {
  return (
    <div className="space-y-3.5">
      {skills.map((skill) => {
        const style = styles[skill.category] ?? styles.技术;
        return (
          <div key={skill.name}>
            <div className="flex items-center justify-between gap-3 text-[12px]">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className={`size-1.5 shrink-0 rounded-full ${style.dot}`} />
                <span className="truncate font-medium text-ink-soft">{skill.name}</span>
              </span>
              <span className="num shrink-0 text-[11px] text-muted">{skill.score}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-raise">
              <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${skill.score}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
