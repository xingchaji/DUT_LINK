# DUT Link 技术架构（初版）

## 技术栈

- Web 全栈：Next.js（App Router）+ React + TypeScript
- 样式系统：Tailwind CSS；设计令牌统一维护在 `app/globals.css`
- API：Next.js Route Handlers，后续可拆分为独立服务
- 数据库：PostgreSQL
- ORM：Prisma（数据模型草案见 `prisma/schema.prisma`）
- AI：服务端 Adapter 模式；Demo 由 `lib/profile-generator.ts` 本地规则模拟
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
prisma/schema.prisma  数据模型草案
```

## 建议的后续顺序

1. Auth.js + 学校邮箱登录，明确隐私授权与资料可见范围。
2. PostgreSQL/Prisma 落库，用真实资料替换 Mock 数据。
3. 将画像生成器替换为结构化输出的模型调用，并记录画像版本。
4. 建立可解释的匹配分数：技能互补、兴趣桥接、时间可用性、协作偏好。
5. 添加举报、拉黑、内容审核与 AI 推荐反馈闭环。

