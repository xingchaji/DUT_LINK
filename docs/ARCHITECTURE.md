# DUT Link 技术架构（初版）

## 技术栈

- Web 全栈：Next.js（App Router）+ React + TypeScript
- 样式系统：Tailwind CSS；设计令牌统一维护在 `app/globals.css`
- API：Next.js Route Handlers，后续可拆分为独立服务
- 数据库：PostgreSQL
- ORM：Prisma（数据模型草案见 `prisma/schema.prisma`）
- AI：服务端 Adapter 模式；配置兼容 Chat Completions 的模型后启用真实分析，失败时降级到 `lib/profile-generator.ts`
- 向量检索：Phase 2 建议启用 PostgreSQL `pgvector`，避免过早引入独立向量数据库
- 身份认证：建议采用 Auth.js，并对接学校邮箱验证
- 测试：TypeScript 静态检查 + ESLint；接入业务后补充 Vitest 与 Playwright

## 为什么这样选择

单体全栈适合早期快速验证：页面、API 和领域类型处于同一 TypeScript 工程，部署和迭代成本低。AI 与数据访问保留独立边界，业务规模增长后，可以把匹配和探索 Agent 拆成异步任务或独立服务，而不需要重写界面。

## 模块边界

```text
app/                  页面与 HTTP 接口
components/           可复用界面组件
lib/types.ts          领域类型
lib/profile-generator AI 画像服务（当前为 Mock）
lib/mock-data.ts      Demo 数据
lib/matching.ts       可解释人员匹配
lib/opportunity-ranking.ts 机会排序
lib/auth.ts           签名会话与认证 DAL
lib/store.ts          开发期进程内数据仓库
prisma/schema.prisma  数据模型草案
```

机会领域的核心关系：

```text
Opportunity（比赛/活动）
  ├─ RecruitmentPost（本场比赛的招募队伍）
  │    └─ RecruitmentApplication（组队申请及处理状态）
  └─ RecommendedPeople（按本场比赛标签实时计算）
```

比赛事实、组队信息与推荐结果分层保存。平台管理的是组队意向，不把组队申请解释成主办方的官方参赛名单。

## 建议的后续顺序

1. PostgreSQL/Prisma 落库，把进程内招募、报名和文章迁移为持久数据。
2. 将 Demo 登录替换为 Auth.js + 学校邮箱注册验证。
3. 增加 GitHub OAuth 或后台同步服务，提取仓库语言、提交与协作证据。
4. 接入赛事采集任务；只有可追溯官方来源的数据才能进入公开目录。
5. 添加举报、拉黑、内容审核与 AI 推荐反馈闭环。

## 当前数据边界

真实 AI 只负责从证据中提取画像、排序和解释，不负责凭空生成赛事事实、截止日期或综测加分。机会事实来自人工核验的官方来源；院系综测政策在未录入正式文件时显示“待导入”。
