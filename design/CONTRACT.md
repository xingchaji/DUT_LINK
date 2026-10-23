# DUT Link 前端设计契约（Notion 风 / Paper Workspace）

本文件是唯一规则源。所有页面改造必须遵守；增量的视觉决策先读这里，再改代码。

## 1. 北极星

一个安静、像纸一样的工作台：学生在这里读自己的画像、翻比赛、处理协作请求。
视觉语气 = 文档 / 笔记本 / 数据库视图，而不是落地页海报。AI 是页边的一条批注，不是霓虹面板。

表达强度：**克制 + 一个有据可依的签名**。签名来自材质与排版（暖纸底、发丝线、mono 数字、衬线斜体英文短句），不来自渐变、光斑和模糊。

## 2. 硬性禁止（旧版 AI 模板痕迹）

以下模式一律不再使用：

- 深色渐变 hero / 面板 + `blur-3xl` 光斑 + `dot-grid` 深底
- `backdrop-blur`、`bg-white/85` 玻璃拟态卡片、超大柔和阴影 `shadow-[0_24px_60px...]`
- `rounded-[28px]` / `rounded-[32px]` 超大圆角、`rounded-3xl`
- `font-extrabold` + `tracking-[-0.045em]` 的大标题
- 彩色全大写 eyebrow（`text-[var(--violet)] uppercase tracking-[0.2em]`）+ 彩色小圆点
- `bg-gradient-to-br`、彩色高饱和底、`--lime` 亮黄绿按钮
- 任意 hex 颜色（`#eeebff`、`#238983`、`#fff2e3`…）；只允许 tokens
- emoji 作为图标

## 3. Tokens（`app/globals.css`）

颜色（Tailwind utility 直接可用）：

| 用途 | class |
| --- | --- |
| 页面底 / 卡片 / 凹陷块 | `bg-canvas` `bg-surface` `bg-raise` `bg-sink` |
| 文字 | `text-ink` `text-ink-soft` `text-muted` `text-faint` |
| 发丝线 | `border-line` `divide-line` `border-line-strong` |
| 主色（链接、AI、信息） | `text-brand` `bg-brand` `bg-brand-soft` |
| 语义色 | `brand`（技术/链接）、`clay`（创意/警示）、`moss`（成功/已核验）、`tea`（协作）、`ochre`（提醒/待核验）、`plum`（分析）、`marker`（高亮） |
| 便签 / 品牌点 | `bg-note` + `border-note-line`（首页 AI 洞察卡），`bg-gold`（Logo 角标） |

字体：

- `font-sans`（Inter + 系统中文字体）——全部正文与标题
- `num`（IBM Plex Mono，tabular-nums）——数字、日期、百分比、属性值、编号
- `font-editorial`（Instrument Serif 斜体）——只允许短英文短语，≤ 5 个词，绝不用于中文

圆角：卡片 `14px`（`.card` / `rounded-[14px]`）、内嵌块 `10px`、按钮/输入 `8px`、chip `6px`、头像圆形。

## 4. 组件类（已内置，别重复造）

```
.page-shell            页面容器：max-width 1180 + 响应式内边距
.page-title .page-lede 页面标题 / 导语（由 PageHeader 渲染）
.section-label         微型大写标签（灰，非彩色）
.section-title         小节标题 17px
.section-desc          小节说明
.meta .num             辅助文字 / 等宽数字
.card .card-sunk .panel .interactive-card
.btn + .btn-primary/.btn-secondary/.btn-ghost/.btn-brand/.btn-marker，尺寸 .btn-sm/.btn-block
.chip + .chip-brand/.chip-moss/.chip-ochre/.chip-clay/.chip-tea/.chip-plum/.chip-marker/.chip-outline/.chip-ink
.field .field-label .field-hint（`.auth-input` 为兼容别名）
.callout + .callout-marker/.callout-brand/.callout-moss/.callout-clay
.status + .status-ok/.status-warn/.status-bad
.mark                  荧光笔高亮（黄底场景下不要用，会糊；用于白底关键短语，每屏 ≤ 1 处）
.rule .row-hover .link-quiet
.reveal                入场动效，配 style={{ ["--i"]: n }} 做 40ms 递进
```

## 5. 页面骨架

```tsx
<div className="page-shell">
  <PageHeader
    eyebrow="组队中心"                       // 面包屑末级
    title="找到互补的队友"                    // 动词/名词短语，≤ 14 字，不用感叹号
    lede="用一句话说明这一页能做什么，以及事实边界。"   // 必填
    icon={<Trophy className="size-5" strokeWidth={1.8} />}
  />
  <div className="mt-8 space-y-8">…</div>
</div>
```

`PageHeader` 自带面包屑 `工作台 / {eyebrow}` 与右上角操作区，**不要**再自己拼 eyebrow 小圆点或标题。

## 6. 排版与布局规则

- 页面主标题由 `PageHeader` 负责，正文里不再出现第二个同等重量的大标题。
- 分组用 section-label → section-title → 内容，垂直间距 24–32px；区块之间用 32–36px 或 `.rule`。
- 列表优先用「行」而不是「卡片堆」：`divide-y divide-line`，行内 `py-3`～`py-4`，悬停 `row-hover`。
  带多列的列表用对齐的 grid 列（如标题列 + 截止日期列 + 匹配度列 + 箭头列），形成数据库视图感。
- 卡片网格仅在内容确实并列时使用（如比赛卡片、奖项列表），`gap-4`，最多 3 列。
- 数字、日期、分数、百分比、编号一律 `.num`。
- 每个区块最多一个强调色；同屏强调色 ≤ 3 种。
- 中文排版：不要用 `uppercase`/`tracking` 装饰中文；中文标题不用超紧字距（-0.02em 以内）。
- 空状态：虚线 `border-dashed border-line-strong` + 一句解释 + 一个操作，居中但不夸张。
- 加载状态：骨架条（`animate-pulse bg-raise`）或居中的 `LoaderCircle` 13px + 文字，不用整屏 spinner。

## 7. 可用图元示例

统计条（替代深色统计面板）：

```tsx
<dl className="grid grid-cols-3 divide-x divide-line rounded-[14px] border border-line bg-surface">
  <div className="px-4 py-3.5">
    <dt className="text-[10.5px] text-faint">比赛机会</dt>
    <dd className="num mt-1 text-[22px] font-semibold leading-none">10</dd>
  </div>
  …
</dl>
```

行式列表：

```tsx
<Link href={…} className="row-hover group flex items-start gap-3 border-b border-line px-3 py-3.5 last:border-b-0">
  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[8px] bg-brand-soft text-brand">
    <Icon className="size-4" strokeWidth={1.9} />
  </span>
  <span className="min-w-0 flex-1">
    <span className="truncate text-[13.5px] font-medium text-ink group-hover:underline">标题</span>
    <span className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[11.5px] text-muted">…</span>
  </span>
  <ArrowUpRight className="size-3.5 text-faint transition group-hover:text-ink" />
</Link>
```

## 8. 内容与功能边界

- 不删改数据请求、事件处理、路由跳转、`aria-*`、`required`、表单字段名、接口路径。
- 不改文案中的事实（日期、来源、核验状态、人数限制）；可以压缩冗长的说明，但不得编造新事实。
- 「待核验」「来源已核验」「AI 生成 / 规则生成」等状态必须继续可见，用 `.status` / `.chip` 表达。
- 所有交互控件在键盘与移动端可用；触控目标高度 ≥ 32px。
- `prefers-reduced-motion` 已在 CSS 全局处理，不要添加依赖动画的信息。


## 9. 已批准基线

- 2026-10：首页 / 组队中心 / 探索（两个入口）/ 申请管理 / 个人主页 / 能力测评 / 登录 / 比赛文档 / 队长工作台 / 寻找队伍 / 人物页 / 内容审核 / 404 全部按本契约完成一次整体重设计。
- 签名元素（不要滥用，也不要随手删）：暖纸底 + 纸颗粒、左侧 workspace 侧栏、面包屑式页头、发丝线数据库行列表、等宽数字、衬线斜体英文短句（每页 ≤ 1 句）、首页 `note` 便签卡。
- 变更记录写在这里或 `design/VALIDATION.md`，不要新建第二份规则文件。
