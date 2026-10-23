"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, ExternalLink, Lightbulb, Link2, Plus, ShieldCheck } from "lucide-react";
import type { WinningWorkInsight } from "@/lib/types";

const sectionKinds = ["问题定义", "方案拆解", "专业落点", "跨域协同", "验证设计", "证据边界"];

const designStages = [
  {
    question: "团队是否把宽泛命题收敛成了一个可以被验证的具体问题？",
    method: "先从真实使用者、任务场景和失败后果出发，再把“更好”“更智能”等模糊目标翻译成可测量指标。跨学科知识在这里不是解决方案装饰，而是帮助团队理解问题边界。",
    checklist: ["写出一个具体使用场景和一个核心矛盾", "明确现有方案为什么不够好", "把目标拆成三项以内的可测指标"],
    evidence: "用户访谈、现场观察、现有方案对比、需求优先级和指标定义。",
    pitfall: "一开始就决定使用某个热门模型或硬件，最后只能证明技术能运行，却不能证明问题值得解决。",
  },
  {
    question: "作品是否被拆成输入、处理、决策、执行和反馈清晰的系统？",
    method: "先画系统边界和信息流，再决定每个专业负责的模块。优秀作品的设计思路通常不是把多种技术堆在一起，而是让前一个模块的输出成为后一个模块可验证的输入。",
    checklist: ["列出系统输入、输出与外部约束", "给每个模块定义责任和接口", "标出最可能失败的两个连接点"],
    evidence: "系统架构、数据流、模块接口、关键器件或方法选型依据，以及最小可行原型。",
    pitfall: "按团队成员专业分工，却没有统一接口，导致算法、硬件、内容和界面分别完成但无法联调。",
  },
  {
    question: "用户本专业的能力是否真正进入了作品核心，而不是停留在包装层？",
    method: "判断一个专业是否被真正使用，要看它是否改变了系统的判断、动作或评价方式。专业成果应当形成可交付输入，例如模型、规则、结构参数、内容依据或交互流程。",
    checklist: ["说明本专业解决了哪个不可替代的问题", "把专业成果转换成其他模块能读取的形式", "设计一次能够单独验证该成果的测试"],
    evidence: "专业模型、计算过程、设计推导、数据或内容来源、模块测试和版本变化记录。",
    pitfall: "把界面、宣传片或报告写作当作某个专业的全部贡献，没有说明它如何影响作品核心效果。",
  },
  {
    question: "不同领域是在同一条工作链上协作，还是只被并列写进项目书？",
    method: "真正的跨学科结合发生在接口处：一个领域产生的数据、约束或判断，被另一个领域用于决策；后者的结果再反馈回来修正前者。分析接口比罗列专业名词更能体现作品深度。",
    checklist: ["为每对协作模块写清输入与输出", "统一术语、单位、坐标或状态定义", "为异常数据和低置信度结果设计处理路径"],
    evidence: "接口协议、数据样例、联调记录、状态转换、异常处理流程和跨模块测试结果。",
    pitfall: "只展示各模块的最佳结果，不解释数据如何传递，也不说明某个模块失败后其他模块会怎样响应。",
  },
  {
    question: "团队怎样证明作品有效，而不只是成功演示了一次？",
    method: "验证应从作品最初定义的指标出发，同时覆盖单模块、系统联调和真实场景。除了平均结果，还要观察异常、边界条件和人工接管，让作品形成可信的证据链。",
    checklist: ["设置清晰的基线或对照方案", "同时测试模块指标和系统指标", "记录失败案例并解释如何改进"],
    evidence: "测试条件、样本来源、基线对比、重复实验、失败案例、用户反馈和指标变化。",
    pitfall: "只展示最理想的一次结果，或用单一算法准确率代替整个作品在真实场景中的效果。",
  },
  {
    question: "文章是否明确区分官方事实、团队公开信息和作者的专业推演？",
    method: "严谨的作品分析不会替原团队补写未公开参数。可以基于题目讨论合理的系统结构，但必须标记推演边界，并告诉读者还需要哪些材料才能进一步验证。",
    checklist: ["逐项标记事实来源", "把合理推演写成可能性而非结论", "列出仍缺少的技术文档或实验信息"],
    evidence: "官方获奖页面、团队论文或演示、技术报告、可追溯引用，以及事实与推演清单。",
    pitfall: "为了让文章显得专业而补写算法名称、硬件型号或性能数字，使读者误以为这些是原作品公开事实。",
  },
];

export function WinningWorkStory({ insight }: { insight: WinningWorkInsight }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sections = insight.articleSections;
  const active = sections[activeIndex] ?? sections[0];
  const stage = designStages[Math.min(activeIndex, designStages.length - 1)];
  const domains = useMemo(() => active ? selectDomains(active.heading, active.body, insight.knowledgeDomains, activeIndex) : [], [active, activeIndex, insight.knowledgeDomains]);

  if (!active) return null;

  return (
    <section className="mt-8 border-t border-line pt-7">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="section-label">Project design review</p>
          <h4 className="section-title mt-1.5 text-[17px]">从获奖作品中学习如何设计参赛项目</h4>
          <p className="section-desc mt-1 max-w-2xl">选择一个板块，查看作品在这一阶段如何组织问题、调用其他领域知识，以及参赛团队可以复用的设计方法。</p>
        </div>
        <span className="chip num shrink-0">{activeIndex + 1} / {sections.length}</span>
      </div>

      {/* 章节切换：凹槽内滑动的凸起分段 */}
      <div className="seg mt-4 flex-wrap">
        {sections.map((section, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={section.heading}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-pressed={selected}
              data-active={selected}
              className="seg-item h-8 px-2.5 text-[11.5px] active:scale-[0.98]"
            >
              <span className={`num text-[10px] ${selected ? "text-ink" : "text-faint"}`}>{String(index + 1).padStart(2, "0")}</span>
              <span>{stripSectionNumber(section.heading)}</span>
            </button>
          );
        })}
      </div>

      <article className="reveal card mt-4 overflow-hidden" style={{ ["--i" as string]: 0 }}>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10.5px] text-faint">
              板块 <span className="num">{String(activeIndex + 1).padStart(2, "0")}</span> · {sectionKinds[activeIndex % sectionKinds.length]}
            </p>
            <h5 className="mt-1 text-[15px] font-semibold leading-6 tracking-[-0.01em] text-ink">{active.heading}</h5>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <NavButton label="上一板块" disabled={activeIndex === 0} onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}>
              <ArrowLeft className="size-3.5" />
            </NavButton>
            <NavButton label="下一板块" disabled={activeIndex === sections.length - 1} onClick={() => setActiveIndex((index) => Math.min(sections.length - 1, index + 1))}>
              <ArrowRight className="size-3.5" />
            </NavButton>
          </div>
        </header>

        <div className="divide-y divide-line">
          <ExpandablePart icon={<Lightbulb className="size-3.5" />} title="作品在这一部分的设计思路" subtitle={stage.question} defaultOpen>
            <p className="text-[13.5px] leading-7 text-ink-soft">{active.body}</p>
            <div className="panel mt-4 px-3.5 py-3">
              <p className="text-[11px] font-semibold text-muted">设计逻辑提炼</p>
              <p className="mt-1.5 text-[12.5px] leading-6 text-ink-soft">{stage.method}</p>
            </div>
          </ExpandablePart>

          <ExpandablePart icon={<Link2 className="size-3.5" />} title="其他领域的知识具体用在了哪里" subtitle={`围绕“${stripSectionNumber(active.heading)}”分析各专业的实际落点`} defaultOpen>
            <div className="grid gap-3 lg:grid-cols-3">
              {domains.map((domain, index) => (
                <section key={domain.name} className="panel px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="num grid size-5 shrink-0 place-items-center rounded-full border border-line bg-surface text-[10px] font-semibold text-muted">{index + 1}</span>
                    <h6 className="truncate text-[12.5px] font-semibold text-ink">{domain.name}</h6>
                  </div>
                  <p className="mt-3 text-[10.5px] text-faint">应用位置</p>
                  <p className="mt-1 text-[12px] leading-6 text-ink-soft">在作品的“{stripSectionNumber(active.heading)}”阶段，{domain.role}。</p>
                  <p className="mt-3 text-[10.5px] text-faint">怎样与其他领域结合</p>
                  <p className="mt-1 border-l-2 border-line-strong pl-2.5 text-[12px] leading-6 text-muted">{domain.integration}</p>
                </section>
              ))}
            </div>
            <p className="mt-4 text-[11.5px] leading-6 text-muted">
              <strong className="font-semibold text-ink-soft">判断是否真正跨学科：</strong>不要只看作品使用了多少领域名词，而要看上述知识是否改变了另一个模块的输入、约束、决策或验证方式。
            </p>
          </ExpandablePart>

          <ExpandablePart icon={<BookOpenCheck className="size-3.5" />} title="给参赛者的可复用方法" subtitle="把作品分析转化为自己的项目检查表">
            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <p className="text-[11px] font-semibold text-muted">本阶段行动清单</p>
                <ul className="panel mt-2.5 divide-y divide-line/70 overflow-hidden">
                  {stage.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 px-3 py-2.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-moss" strokeWidth={1.9} />
                      <p className="text-[12.5px] leading-6 text-ink-soft">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <div className="callout callout-moss">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-moss" strokeWidth={1.9} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-moss">答辩前应准备的证据</p>
                    <p className="mt-1 text-[12.5px] leading-6 text-ink-soft">{stage.evidence}</p>
                  </div>
                </div>
                <div className="callout callout-clay">
                  <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-clay" strokeWidth={1.9} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-clay">常见误区</p>
                    <p className="mt-1 text-[12.5px] leading-6 text-ink-soft">{stage.pitfall}</p>
                  </div>
                </div>
              </div>
            </div>
          </ExpandablePart>

          <ExpandablePart icon={<ShieldCheck className="size-3.5" />} title="事实边界与原作品资料" subtitle="区分官方确认信息与本文的专业分析">
            <p className="text-[13px] leading-7 text-ink-soft">本文对设计流程和跨学科接口的讨论，是基于作品题目、官方简介和工程方法形成的分析。官方未公开的算法、设备型号、实验数字或实施细节，不作为原团队事实陈述。</p>
            <a
              href={insight.source.url}
              target="_blank"
              rel="noreferrer"
              className="group mt-4 inline-flex max-w-full items-center gap-2 rounded-[9px] border border-line-strong bg-surface px-3 py-2 text-[11.5px] font-medium text-ink-soft shadow-[0_1px_1px_rgba(60,48,30,0.05),0_3px_8px_-4px_rgba(60,48,30,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] transition duration-300 [transition-timing-function:var(--spring)] hover:-translate-y-px hover:text-ink hover:shadow-[0_2px_4px_rgba(60,48,30,0.06),0_10px_20px_-10px_rgba(60,48,30,0.28)] active:translate-y-0.5"
            >
              <span className="truncate">查看原作品与官方来源：{insight.source.title}</span>
              <ExternalLink className="size-3 shrink-0 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.9} />
            </a>
          </ExpandablePart>
        </div>
      </article>
    </section>
  );
}

function ExpandablePart({ icon, title, subtitle, defaultOpen = false, children }: { icon: React.ReactNode; title: string; subtitle: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen || undefined} className="group">
      <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3.5 transition-colors hover:bg-raise/60 sm:px-5">
        <span className="glyph mt-0.5 size-7 shrink-0 text-muted">{icon}</span>
        <span className="min-w-0 flex-1">
          <strong className="block text-[13px] font-semibold text-ink">{title}</strong>
          <span className="mt-0.5 block text-[11.5px] leading-5 text-muted">{subtitle}</span>
        </span>
        <Plus className="mt-1 size-3.5 shrink-0 text-faint transition-transform group-open:rotate-45" strokeWidth={2} />
      </summary>
      <div className="px-4 pb-5 sm:px-5 group-open:animate-[pop-in_220ms_var(--spring)_both]">{children}</div>
    </details>
  );
}

function NavButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="btn btn-secondary btn-sm w-8 px-0"
    >
      {children}
    </button>
  );
}

function selectDomains(heading: string, body: string, domains: WinningWorkInsight["knowledgeDomains"], sectionIndex: number) {
  const text = `${heading}${body}`;
  return [...domains].map((domain, domainIndex) => {
    const tokens = `${domain.name}、${domain.role}`.split(/[、，；与和及×\s]/).filter((token) => token.length >= 2 && token.length <= 10);
    const matches = tokens.filter((token) => text.includes(token)).length;
    const proximity = (domainIndex - sectionIndex + domains.length) % Math.max(domains.length, 1);
    return { domain, score: matches * 10 - proximity };
  }).sort((left, right) => right.score - left.score).slice(0, 3).map((item) => item.domain);
}

function stripSectionNumber(value: string) {
  return value.replace(/^[一二三四五六七八九十]+[、，,.]\s*/, "");
}
