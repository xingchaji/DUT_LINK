# DUT Link 技术架构（初版）

## 技术栈

- Web 全栈：Next.js（App Router）+ React + TypeScript
- 样式系统：Tailwind CSS；设计令牌统一维护在 `app/globals.css`
- API：Next.js Route Handlers，后续可拆分为独立服务
- 数据库：PostgreSQL
- ORM：Prisma 7 + PostgreSQL Driver Adapter（模型与初始迁移见 `prisma/`）
- AI：服务端 Adapter 模式；能力画像、智能组队、探索盲盒共用兼容 Chat Completions 的模型接口，并按模块独立降级
- 向量检索：Phase 2 建议启用 PostgreSQL `pgvector`，避免过早引入独立向量数据库
- 身份认证：当前使用 `scrypt` 密码哈希、随机不透明 Cookie 与数据库 Session；下一阶段对接校园邮箱验证码，规模扩大时可迁移 Auth.js
- 测试：TypeScript 静态检查 + ESLint；接入业务后补充 Vitest 与 Playwright

## 为什么这样选择

单体全栈适合早期快速验证：页面、API 和领域类型处于同一 TypeScript 工程，部署和迭代成本低。AI 与数据访问保留独立边界，业务规模增长后，可以把匹配和探索 Agent 拆成异步任务或独立服务，而不需要重写界面。

## 模块边界

```text
app/                  页面与 HTTP 接口
components/           可复用界面组件
lib/types.ts          领域类型
lib/profile-generator AI 画像服务（当前为 Mock）
lib/ai.ts            三项 AI 能力的结构化调用与降级
lib/ai-settings.ts   用户级 AI 配置解析与密钥加解密（仅服务端）
lib/mock-data.ts      Demo 数据
lib/matching.ts       招募需求驱动的可解释人员匹配
lib/people.ts         统一公开用户资料解析
lib/opportunity-ranking.ts 机会排序
lib/winning-works.ts  官方获奖作品证据目录与可信降级内容
lib/auth.ts           数据库/内存双模式认证与会话 DAL
lib/password.ts       scrypt 密码哈希与恒定时间校验
lib/db.ts             Prisma Client 生命周期、数据后端选择与连接探测
lib/repositories/     领域数据仓库；统一 PostgreSQL 与内存演示模式
lib/store.ts          无数据库时的内存演示仓库
prisma/               PostgreSQL 模型、迁移与可重复种子数据
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

正式数据库使用 `CompetitionMembership` 的 `(userId, opportunityId)` 唯一约束保证一个用户在同一比赛只能属于一个队伍；`RecruitmentPost` 的 `(ownerId, opportunityId)` 唯一约束保证队长不能重复发布。招募创建、申请审批、成员写入与通知使用串行化事务处理；内存演示仓库执行相同的领域校验，规则不只依赖前端隐藏按钮。

能力画像采用版本化竞赛能力问卷：所有用户回答相同的 16 道分档题，服务端使用固定公式计算问题解决、调研表达、竞赛经验和项目交付。前八题使用跨专业通用的任务拆解、资料核验、证据分析、工具学习、需求定义、调研、写作和答辩场景，不推断人格类型。

推荐通过单独的队伍级接口生成。只有队长建立队伍并填写招募技能和具体要求后才返回候选人；候选池从数据库用户、参赛意向与能力画像生成，并排除队长和本队成员。个人 AI 开关开启且配置有效时由模型做结构化排序，关闭、无配置或调用失败时使用同一输入的可解释规则，需求信息不足时明确标记为能力画像降级匹配。

AI 能力遵循不同的可信边界：能力画像分数由固定问卷公式决定，AI 只能生成总结、方向和证据解释；组队 AI 只能重排服务端提供的候选人 ID；探索盲盒 AI 只能选择可信来源目录中的 source ID，URL 由服务端回填；获奖作品解读先由服务端根据用户专业、技能、兴趣和潜在方向排序官方证据目录，AI 只能从目录中选择并在人工核验分析的边界内组织长文，作品名、奖项、学校、年份和来源均由服务端锁定。所有模型返回均经过运行时结构与最低篇幅校验，超时、异常、过短或非法输出自动降级为完整的人工核验文章。

能力画像问卷不接受客户端提交的称呼、专业和年级。`POST /api/profile` 根据当前会话重新读取 `User` 公开资料后再构造问卷输入，避免个人主页与画像身份信息分叉。获奖作品接口会尝试读取固定官方来源的公开页面正文，并与人工核验的证据摘要一并交给模型；不开放任意 URL，避免 SSRF 和未经核验的搜索结果进入生成链路。

每位用户的 AI 开关、服务地址和模型名称保存在 `AISetting`；API Key 使用服务端 `AI_SETTINGS_ENCRYPTION_KEY` 派生的 AES-256-GCM 密钥加密，浏览器读取设置时只获得是否已配置和末四位提示。个人开关作为三项能力的统一入口，关闭后不再回退使用平台级密钥。

## 建议的后续顺序

1. 接入校园邮箱验证码、登录限流、找回密码和会话设备管理。
2. 增加 GitHub OAuth 或后台同步服务，提取仓库语言、提交与协作证据。
3. 为三个 AI 模块配置正式模型服务、评测集和调用观测。
4. 接入赛事采集任务；只有可追溯官方来源的数据才能进入公开目录。
5. 添加举报、拉黑、内容审核、AI 推荐反馈与自动化测试闭环。

## 当前数据边界

真实 AI 只负责从证据中提取画像、排序和解释，不负责凭空生成赛事事实、截止日期或综测加分。机会事实来自人工核验的官方来源；院系综测政策在未录入正式文件时显示“待导入”。
