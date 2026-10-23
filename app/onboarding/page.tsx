"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BrainCircuit, Check, CheckCircle2, ChevronLeft, ClipboardCheck, LoaderCircle, Sparkles, Target } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CountUp, Meter } from "@/components/motion/metric";
import { Reveal } from "@/components/motion/reveal";
import { SkillBars } from "@/components/skill-bars";
import { profileInterestOptions, profileQuestions } from "@/lib/questionnaire";
import type { GeneratedProfile, UserAccountProfile } from "@/lib/types";

const QUESTIONS_PER_STEP = 4;
const STEP_LABELS = ["问题解决", "调研表达", "竞赛经验", "项目交付"];

export default function OnboardingPage() {
  const [accountProfile, setAccountProfile] = useState<UserAccountProfile | null>(null);
  const [identityLoading, setIdentityLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [interests, setInterests] = useState<string[]>(["人工智能", "软件开发"]);
  const [evidence, setEvidence] = useState("");
  const [result, setResult] = useState<GeneratedProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  const answered = Object.keys(answers).length;
  const progress = useMemo(() => Math.round(answered / profileQuestions.length * 100), [answered]);
  const totalSteps = Math.ceil(profileQuestions.length / QUESTIONS_PER_STEP);
  const currentQuestions = profileQuestions.slice(step * QUESTIONS_PER_STEP, (step + 1) * QUESTIONS_PER_STEP);
  const currentComplete = currentQuestions.every((question) => answers[question.id]);
  const isLastStep = step === totalSteps - 1;

  useEffect(() => {
    fetch("/api/account", { cache: "no-store" })
      .then(async (response) => ({ response, data: await response.json() }))
      .then(({ response, data }) => {
        if (response.ok) setAccountProfile(data.profile);
        else setError(data.message ?? "无法读取个人主页资料");
      })
      .catch(() => setError("无法读取个人主页资料"))
      .finally(() => setIdentityLoading(false));
  }, []);

  function toggleInterest(value: string) {
    setInterests((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value].slice(0, 6));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "questionnaire", answers, interests, evidence }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setError(data.message); return; }
    localStorage.setItem("dut-link-profile", JSON.stringify(data));
    window.dispatchEvent(new Event("storage"));
    setResult(data);
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="能力测评"
        title="用竞赛事实构建能力画像"
        lede="16 道统一问题衡量问题解决、调研表达、竞赛经验和项目交付。分数由规则计算，AI 只负责结合证据进行解释。"
        icon={<BrainCircuit className="size-5" strokeWidth={1.8} />}
      >
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-faint">
          <Link href="/" className="inline-flex items-center gap-1 transition hover:text-ink">
            <ArrowLeft className="size-3" strokeWidth={2} /> 返回工作台
          </Link>
          <span className="h-3 w-px bg-line" />
          <span className="num">{profileQuestions.length} 题 · {totalSteps} 组</span>
        </div>
      </PageHeader>

      {/* 进度统计条 */}
      <Reveal delay={0} className="e1 mt-7 overflow-hidden rounded-[14px] border border-line bg-surface">
        <dl className="grid grid-cols-3 divide-x divide-line">
          <div className="px-4 py-3.5">
            <dt className="text-[10.5px] text-faint">已回答</dt>
            <dd className="mt-1 flex items-baseline gap-1">
              <CountUp value={answered} duration={480} className="num text-[22px] font-semibold leading-none text-ink" />
              <span className="num text-[11px] text-muted">/ {profileQuestions.length}</span>
            </dd>
          </div>
          <div className="px-4 py-3.5">
            <dt className="text-[10.5px] text-faint">画像进度</dt>
            <dd className="mt-1 flex items-baseline gap-1">
              <CountUp value={progress} duration={480} className="num text-[22px] font-semibold leading-none text-ink" />
              <span className="text-[11px] text-muted">%</span>
            </dd>
          </div>
          <div className="px-4 py-3.5">
            <dt className="text-[10.5px] text-faint">当前分组</dt>
            <dd className="mt-1 flex items-baseline gap-1">
              <span className="num text-[22px] font-semibold leading-none text-ink">{String(step + 1).padStart(2, "0")}</span>
              <span className="num text-[11px] text-muted">/ {String(totalSteps).padStart(2, "0")}</span>
            </dd>
          </div>
        </dl>
        <div className="px-4 pb-3.5">
          <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="问卷完成度">
            <Meter value={progress} height={6} color="var(--color-ink)" />
          </div>
        </div>
      </Reveal>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-8">
        <form onSubmit={submit} className="min-w-0 space-y-4">
          {/* 身份信息 */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line bg-surface px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-[7px] bg-raise text-muted">
                <CheckCircle2 className="size-3.5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="section-label">身份信息已同步</p>
                <p className="mt-0.5 truncate text-[12.5px] text-ink-soft">
                  {identityLoading ? "正在读取…" : accountProfile ? `${accountProfile.nickname} · ${accountProfile.major} · ${accountProfile.grade || "年级未填写"}` : "暂未读取到个人资料"}
                </p>
              </div>
            </div>
            <Link href="/account" className="btn btn-secondary shrink-0">修改个人资料</Link>
          </div>

          {/* 题目 */}
          <section className="card overflow-hidden">
            <header className="border-b border-line px-5 py-4 sm:px-6">
              <p className="section-label">
                Step <span className="num">{String(step + 1).padStart(2, "0")}</span> / <span className="num">{String(totalSteps).padStart(2, "0")}</span>
              </p>
              <h2 className="section-title mt-1.5">{STEP_LABELS[step] ?? "竞赛能力调查"}</h2>
              <p className="section-desc mt-1">请选择最接近你当前真实经历的一项。</p>
            </header>

            <div key={step} className="pop space-y-7 px-5 py-6 sm:px-6">
              {currentQuestions.map((question, questionIndex) => {
                const index = step * QUESTIONS_PER_STEP + questionIndex;
                return (
                  <fieldset key={question.id}>
                    <legend className="flex gap-2.5 text-[13.5px] font-medium leading-6 text-ink">
                      <span className="num shrink-0 pt-px text-[11px] text-faint">{String(index + 1).padStart(2, "0")}</span>
                      <span>{question.text}</span>
                    </legend>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-5">
                      {question.options.map((label, optionIndex) => {
                        const value = optionIndex + 1;
                        const selected = answers[question.id] === value;
                        return (
                          <label
                            key={label}
                            className={`pressable relative flex min-h-11 cursor-pointer items-center justify-center gap-1 rounded-[8px] border px-2.5 py-2 text-center focus-within:border-brand ${
                              selected
                                ? "-translate-y-px border-ink bg-raise font-medium text-ink shadow-[0_2px_4px_rgba(60,48,30,0.1),0_10px_20px_-12px_rgba(60,48,30,0.4),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_0_0_1px_var(--color-ink)]"
                                : "border-line bg-surface text-muted shadow-[0_1px_1px_rgba(60,48,30,0.05),0_3px_6px_-3px_rgba(60,48,30,0.16),inset_0_1px_0_rgba(255,255,255,0.95)] hover:-translate-y-px hover:border-line-strong hover:text-ink-soft hover:shadow-[0_2px_4px_rgba(60,48,30,0.07),0_8px_16px_-9px_rgba(60,48,30,0.28),inset_0_1px_0_rgba(255,255,255,0.95)]"
                            }`}
                          >
                            <input className="sr-only" type="radio" name={question.id} value={value} checked={selected} onChange={() => setAnswers((current) => ({ ...current, [question.id]: value }))} />
                            <span className="text-[11.5px] leading-4">{label}</span>
                            {selected && <Check className="size-3 shrink-0" strokeWidth={2.6} />}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-line bg-raise/50 px-5 py-3.5 sm:px-6">
              <button type="button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} className="btn btn-ghost">
                <ChevronLeft className="size-4" /> 上一步
              </button>
              {!isLastStep && (
                <button type="button" disabled={!currentComplete} onClick={() => setStep((current) => Math.min(totalSteps - 1, current + 1))} className="btn btn-primary">
                  继续下一组 <ArrowRight className="size-4" />
                </button>
              )}
            </footer>
          </section>

          {/* 兴趣与证据 */}
          {isLastStep && (
            <section className="card">
              <div className="border-b border-line px-5 py-4 sm:px-6">
                <p className="section-label flex items-center gap-1.5">
                  <Target className="size-3" strokeWidth={2} /> Interests &amp; evidence
                </p>
                <h2 className="section-title mt-1.5">兴趣与证据</h2>
                <p className="section-desc mt-1">兴趣不改变能力分数，但会参与比赛和队友推荐。</p>
              </div>
              <div className="px-5 py-5 sm:px-6">
                <div className="flex flex-wrap gap-1.5">
                  {profileInterestOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      aria-pressed={interests.includes(item)}
                      className={`chip pressable h-8 px-3 text-[12px] ${interests.includes(item) ? "chip-ink" : "chip-outline hover:border-line-strong hover:text-ink"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <label className="mt-5 block">
                  <span className="field-label">补充作品或项目证据（选填）</span>
                  <textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} rows={4} placeholder="例如：完成过课程管理系统，负责前端和接口联调" className="field" />
                </label>
              </div>
            </section>
          )}

          {error && <p role="alert" className="callout callout-clay px-4 py-3 text-[12.5px] text-clay">{error}</p>}

          {isLastStep && (
            <button disabled={loading || identityLoading || !accountProfile || answered !== profileQuestions.length} className="btn btn-primary btn-block h-10">
              {loading ? <LoaderCircle className="size-4 animate-spin" /> : <ClipboardCheck className="size-4" />}
              {loading ? "正在计算竞赛能力…" : "生成竞赛能力画像"}
            </button>
          )}
        </form>

        <Reveal as="aside" className="min-w-0">
          {result ? (
            <div className="card sticky top-6 px-5 py-5">
              <span className="chip chip-moss">
                <Sparkles className="size-3" strokeWidth={2} />
                {result.analysisMode === "questionnaire-ai" ? "规则评分 · AI 个性化解释" : "统一规则评分 · AI 降级"}
              </span>
              <h2 className="section-title mt-3 text-[15px]">你的竞赛能力坐标</h2>
              <p className="mt-2 text-[12.5px] leading-6 text-muted">{result.summary}</p>
              <div className="mt-4">
                <SkillBars skills={result.skills} />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {result.interests.map((item) => (
                  <span key={item} className="chip">{item}</span>
                ))}
              </div>
              <Link href="/account" className="btn btn-secondary btn-block mt-4">
                查看完整画像 <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <div className="card sticky top-6 px-5 py-5">
              <p className="section-label">Four steps</p>
              <h2 className="section-title mt-1.5">四步完成竞赛画像</h2>
              <p className="section-desc mt-1">每步只回答 4 道问题，结果仍采用统一的 16 题评分标准。</p>
              <ol className="mt-4 space-y-1 border-t border-line pt-3">
                {STEP_LABELS.map((label, index) => {
                  const isCurrent = index === step;
                  return (
                    <li
                      key={label}
                      className={`flex items-center gap-2.5 rounded-[9px] px-2 py-2 transition-[transform,box-shadow,background-color] duration-300 [transition-timing-function:var(--spring)] ${
                        isCurrent ? "-translate-y-px bg-surface shadow-[0_1px_1px_rgba(60,48,30,0.05),0_6px_14px_-8px_rgba(60,48,30,0.3),inset_0_1px_0_#fff]" : ""
                      }`}
                    >
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full border text-[10.5px] ${index < step
                          ? "border-ink bg-ink text-canvas shadow-[0_1px_2px_rgba(60,48,30,0.24),inset_0_1px_0_rgba(255,255,255,0.22)]"
                          : isCurrent
                            ? "border-ink bg-surface text-ink shadow-[0_1px_2px_rgba(60,48,30,0.16),inset_0_1px_0_#fff]"
                            : "border-line text-faint"
                          }`}
                      >
                        {index < step ? <Check className="size-3" strokeWidth={3} /> : <span className="num">{index + 1}</span>}
                      </span>
                      <span className={`text-[12.5px] ${isCurrent ? "font-medium text-ink" : "text-muted"}`}>{label}</span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 border-t border-line pt-3 text-[11px] leading-6 text-faint">规则负责定量，AI 只结合项目证据生成总结和方向；模型不可用时自动返回规则画像。</p>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
