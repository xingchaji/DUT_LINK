import Link from "next/link";
import { ArrowLeft, Clock3, ExternalLink, Mail, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { findPublicPersonProfile } from "@/lib/people";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await findPublicPersonProfile(id);
  if (!person) notFound();

  return <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
    <Link href="/opportunities" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft className="size-4" /> 返回组队中心</Link>
    <section className="card mt-6 overflow-hidden"><div className="bg-[var(--ink)] p-7 text-white sm:p-9"><div className="grid size-20 place-items-center rounded-[28px] bg-gradient-to-br from-[var(--coral)] to-[var(--amber)] text-3xl font-bold">{person.avatar}</div><p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-[var(--lime)]">Public profile</p><h1 className="mt-2 text-4xl font-bold">{person.name}</h1><p className="mt-2 text-sm text-white/55">{person.major} · {person.grade}</p><p className="mt-6 max-w-2xl text-sm leading-7 text-white/72">{person.bio}</p></div><div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8"><p className="flex items-start gap-3 text-sm"><Mail className="mt-0.5 size-4 text-[var(--violet)]" /><span><strong className="block text-xs">公开联系方式</strong><span className="mt-1 block text-[var(--muted)]">{person.contact}</span></span></p><p className="flex items-start gap-3 text-sm"><Clock3 className="mt-0.5 size-4 text-[var(--violet)]" /><span><strong className="block text-xs">可投入时间</strong><span className="mt-1 block text-[var(--muted)]">{person.availability}</span></span></p></div><div className="border-t border-black/[0.06] px-6 py-6 sm:px-8"><div className="flex items-center gap-2 text-xs font-bold"><UserRound className="size-4 text-[var(--violet)]" /> 技能标签</div><div className="mt-4 flex flex-wrap gap-2">{person.tags.map((tag) => <span key={tag} className="rounded-full bg-[#ebe8ff] px-3 py-1.5 text-xs font-semibold text-[var(--violet)]">{tag}</span>)}</div>{person.portfolio && <a href={person.portfolio} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[var(--violet)]">查看作品链接 <ExternalLink className="size-3.5" /></a>}</div></section>
  </div>;
}
