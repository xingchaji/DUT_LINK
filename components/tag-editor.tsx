"use client";

import { useId, useState } from "react";
import { X } from "lucide-react";

export function TagEditor({ label, tags, onChange, inputName, placeholder = "输入标签后按回车", maxTags = 12, className = "" }: { label: string; tags: string[]; onChange: (tags: string[]) => void; inputName?: string; placeholder?: string; maxTags?: number; className?: string }) {
  const [text, setText] = useState("");
  const inputId = useId();

  function addTag() {
    const value = text.trim().replace(/[，,、]+$/, "");
    if (value && !tags.includes(value) && tags.length < maxTags) onChange([...tags, value]);
    setText("");
  }

  return (
    <div className={className}>
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      {inputName && <input type="hidden" name={inputName} value={tags.join("、")} />}
      <div className="field flex min-h-11 flex-wrap items-center gap-1.5 px-2 py-1.5 focus-within:border-brand focus-within:shadow-[var(--sh-in-1),0_0_0_3px_rgba(59,95,217,0.14)]">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(tags.filter((item) => item !== tag))}
            aria-label={`删除技能标签 ${tag}`}
            className="chip chip-outline group pressable h-8 gap-1 pr-1.5 hover:border-clay hover:bg-clay-soft hover:text-clay hover:shadow-[0_1px_1px_rgba(60,48,30,0.06),0_2px_5px_-2px_rgba(60,48,30,0.18),inset_0_1px_0_#fff]"
          >
            {tag}
            <X className="size-3 opacity-50 transition-opacity group-hover:opacity-100" strokeWidth={2.5} />
          </button>
        ))}
        <input
          id={inputId}
          aria-label={`${label}输入`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={addTag}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === "," || event.key === "，") {
              event.preventDefault();
              addTag();
            }
          }}
          placeholder={tags.length ? "继续输入并按回车" : placeholder}
          className="min-w-24 flex-1 bg-transparent px-1 py-1 text-[13px] text-ink outline-none placeholder:text-faint"
        />
      </div>
      <span className="field-hint">
        按 Enter 创建标签，点击已有标签可删除（最多 {maxTags} 个）
      </span>
    </div>
  );
}
