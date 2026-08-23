"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function TagEditor({ label, tags, onChange, inputName, placeholder = "输入标签后按回车", maxTags = 12, className = "" }: { label: string; tags: string[]; onChange: (tags: string[]) => void; inputName?: string; placeholder?: string; maxTags?: number; className?: string }) {
  const [text, setText] = useState("");

  function addTag() {
    const value = text.trim().replace(/[，,、]+$/, "");
    if (value && !tags.includes(value) && tags.length < maxTags) onChange([...tags, value]);
    setText("");
  }

  return <label className={className}><span className="mb-2 block text-xs font-bold">{label}</span>{inputName && <input type="hidden" name={inputName} value={tags.join("、")} />}<div className="min-h-12 rounded-2xl border border-black/10 bg-[var(--paper)] px-3 py-2 focus-within:border-[var(--violet)]"><div className="flex flex-wrap gap-1.5">{tags.map((tag) => <button key={tag} type="button" onClick={() => onChange(tags.filter((item) => item !== tag))} aria-label={`删除技能标签 ${tag}`} className="inline-flex items-center gap-1 rounded-full bg-[#ebe8ff] px-2.5 py-1 text-xs font-semibold text-[var(--violet)]">{tag}<X className="size-3" /></button>)}<input aria-label={`${label}输入`} value={text} onChange={(event) => setText(event.target.value)} onBlur={addTag} onKeyDown={(event) => { if (event.key === "Enter" || event.key === "," || event.key === "，") { event.preventDefault(); addTag(); } }} placeholder={tags.length ? "继续输入并按回车" : placeholder} className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm outline-none" /></div></div><span className="mt-1.5 block text-[10px] text-[var(--muted)]">按 Enter 创建标签，点击已有标签可删除（最多 {maxTags} 个）</span></label>;
}
