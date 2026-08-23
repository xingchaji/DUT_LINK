# DUT Link

AI 驱动的校园探索与连接平台。当前版本已经打通能力画像、可解释匹配、真实机会目录、队伍招募与报名、知识盲盒、学生投稿和基础登录。

## 启动

```bash
npm install
npm run dev
```

访问 <http://localhost:3000>。

Demo 登录：

```text
student@dlut.edu.cn
demo1234
```

## 可用命令

```bash
npm run dev        # 本地开发
npm run typecheck  # TypeScript 检查
npm run lint       # ESLint 检查
npm run build      # 生产构建
```

## 当前实现

- 个人主页统一承载账户资料、Enter 创建的技能标签和竞赛能力画像，旧 `/profile` 自动跳转
- 能力画像、智能组队和探索盲盒共用服务端 AI Adapter；模型不可用时分别降级到固定评分、可解释排序和可信内容池
- 画像使用 16 题跨专业竞赛能力调查，覆盖问题解决、调研表达、参赛与获奖经验、项目交付
- `POST /api/profile`：标准化问卷评分；旧版证据分析接口仍保留兼容
- `GET/POST /api/matches`：技能互补、兴趣桥接、跨专业评分
- 比赛总览按开始报名时间排序，推荐比赛按用户画像排序
- 每场比赛拆分队长招募工作台与队员找队页，不再混用同一页面
- 用户可标记任意比赛参赛意向；建队后才按意向、能力画像、招募标签与具体要求推荐队友
- 推荐用户主页展示联系方式，并支持队长发送组队邀请
- 真实赛事强制显示来源、核验时间和综测政策状态
- 用户与校内组织可发布校内比赛，发布内容明确标记待核验
- 建队技能输入支持回车生成多个可删除标签
- 同一用户在同一比赛只能加入或带领一支队伍；队长也只能发布一条招募
- 成员名单由队长和审批通过的申请自动生成；成员姓名可进入公开主页并支持悬浮查看专业、年级和技能
- 队长可删除队伍并清理关联申请与邀请；过期或满员招募自动隐藏
- 招募发布、主动邀请、申请加入、队长接受/拒绝和队伍人数更新闭环
- 可随机切换并带论文/文章来源的知识盲盒
- 学生跨领域文章投稿入口
- 签名 HttpOnly Cookie 登录会话
- PostgreSQL/Prisma 完整数据模型草案

## AI 配置

复制 `.env.example` 为 `.env.local`，填写兼容 Chat Completions 的服务：

```text
AI_API_KEY=...
AI_BASE_URL=https://your-provider.example/v1
AI_MODEL=...
SESSION_SECRET=至少32字节的随机字符串
```

未配置 AI 时会自动使用本地规则，不影响功能演示。能力画像的统一问卷分数始终由固定公式产生，AI 只解释证据并生成潜在方向；探索盲盒中的引用只能从服务端可信来源目录选择，模型不能返回自造链接。

> 当前比赛发布、招募、申请和投稿由进程内存保存，重启后恢复种子数据。`prisma/schema.prisma` 已准备正式持久化模型；本机没有 Docker 或数据库连接，因此没有引入与既定 PostgreSQL 方案冲突的临时数据库。

完整技术决策与下一步见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) 和 [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md)。
