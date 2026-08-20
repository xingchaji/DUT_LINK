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

- 画像输入支持项目、奖项、成果与 GitHub 仓库
- `POST /api/profile`：真实 AI / 可解释本地规则双模式
- `GET/POST /api/matches`：技能互补、兴趣桥接、跨专业评分
- 比赛总览按开始报名时间排序，推荐比赛按用户画像排序
- 每场比赛拥有独立组队空间，聚合招募队伍并定向推荐队友
- 真实赛事强制显示来源、核验时间和综测政策状态
- 用户与校内组织可发布校内比赛，发布内容明确标记待核验
- 招募发布、申请加入、队长接受/拒绝和队伍人数更新闭环
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

未配置 AI 时会自动使用本地规则，不影响功能演示。

> 当前比赛发布、招募、申请和投稿由进程内存保存，重启后恢复种子数据。`prisma/schema.prisma` 已准备正式持久化模型；本机没有 Docker 或数据库连接，因此没有引入与既定 PostgreSQL 方案冲突的临时数据库。

完整技术决策与下一步见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) 和 [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md)。
