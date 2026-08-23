# DUT Link 技术架构（初版）

## 技术栈

- Web 全栈：Next.js（App Router）+ React + TypeScript
- 样式系统：Tailwind CSS；设计令牌统一维护在 `app/globals.css`
- API：Next.js Route Handlers，后续可拆分为独立服务
- 数据库：PostgreSQL
- ORM：Prisma（数据模型草案见 `prisma/schema.prisma`）
- AI：服务端 Adapter 模式；能力画像、智能组队、探索盲盒共用兼容 Chat Completions 的模型接口，并按模块独立降级
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
lib/matching.ts       招募需求驱动的可解释人员匹配
lib/people.ts         统一公开用户资料解析
lib/opportunity-ranking.ts 机会排序
lib/auth.ts           签名会话与认证 DAL
lib/store.ts          开发期进程内数据仓库
prisma/schema.prisma  数据模型草案
```

机会领域的核心关系：

```text
Opportunity（比赛/活动）
  ├─ OpportunityInterest（用户参赛意向）
  ├─ RecruitmentPost（本场比赛的招募队伍）
  │    └─ RecruitmentApplication（组队申请及处理状态）
  │    └─ TeamInvitation（队长向意向用户发出的邀请）
  └─ RecommendedPeople（建队后按意向、画像、技能标签和招募要求排序）
```

比赛事实、组队信息与推荐结果分层保存。平台管理的是组队意向，不把组队申请解释成主办方的官方参赛名单。

正式数据库使用 `CompetitionMembership` 的 `(userId, opportunityId)` 唯一约束保证一个用户在同一比赛只能属于一个队伍；`RecruitmentPost` 的 `(ownerId, opportunityId)` 唯一约束保证队长不能重复发布。内存原型在 Route Handler 中执行相同校验，不能只依赖前端隐藏按钮。

能力画像采用版本化竞赛能力问卷：所有用户回答相同的 16 道分档题，服务端使用固定公式计算问题解决、调研表达、竞赛经验和项目交付。前八题使用跨专业通用的任务拆解、资料核验、证据分析、工具学习、需求定义、调研、写作和答辩场景，不推断人格类型。

推荐通过单独的队伍级接口生成。只有队长建立队伍并填写招募技能和具体要求后才返回候选人；AI 配置存在时由模型做结构化排序，无配置或调用失败时使用同一输入的可解释规则，需求信息不足时明确标记为能力画像降级匹配。

三项 AI 能力遵循不同的可信边界：能力画像分数由固定问卷公式决定，AI 只能生成总结、方向和证据解释；组队 AI 只能重排服务端提供的候选人 ID；探索盲盒 AI 只能选择可信来源目录中的 source ID，URL 由服务端回填。所有模型返回均经过运行时结构校验，超时、异常或非法输出自动降级。

## 建议的后续顺序

1. PostgreSQL/Prisma 落库，把进程内招募、报名和文章迁移为持久数据。
2. 将 Demo 登录替换为 Auth.js + 学校邮箱注册验证。
3. 增加 GitHub OAuth 或后台同步服务，提取仓库语言、提交与协作证据。
4. 接入赛事采集任务；只有可追溯官方来源的数据才能进入公开目录。
5. 添加举报、拉黑、内容审核与 AI 推荐反馈闭环。

## 当前数据边界

真实 AI 只负责从证据中提取画像、排序和解释，不负责凭空生成赛事事实、截止日期或综测加分。机会事实来自人工核验的官方来源；院系综测政策在未录入正式文件时显示“待导入”。
