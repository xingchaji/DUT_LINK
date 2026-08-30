# DUT Link

AI 驱动的校园探索与连接平台。当前版本已经打通能力画像、可解释匹配、真实机会目录、队伍招募与报名、知识盲盒、学生投稿和基础登录。

## 从 GitHub 启动

推荐使用 **Node.js 22 LTS**（最低要求由 Prisma 决定：Node.js 20.19+、22.12+ 或 24+）。clone 后不要复制别人的 `node_modules` 或 `.env`：

```bash
git clone git@github.com:xingchaji/DUT_LINK.git
cd DUT_LINK
npm ci
npm run setup
npm run dev
```

访问 <http://localhost:3000>。`npm run setup` 会创建仅供本机使用的 `.env`，默认采用无需安装数据库的内存演示模式；重复执行不会覆盖已有配置。Windows 用户也可以直接双击 `start.bat`。

Demo 登录：

```text
student@dlut.edu.cn
demo1234
```

组队双身份验收还可使用 `zhouyu@dlut.edu.cn`；演示种子用户统一使用密码 `demo1234`。这些账号只用于本地开发。

内存演示模式也支持注册新的校园邮箱账号，账号在当前服务进程内有效，重启后会随演示数据一起恢复。正式持久化注册仍使用 PostgreSQL 模式。

## 可用命令

```bash
npm run dev        # 本地开发
npm run setup      # 首次运行：创建本机环境配置
npm run check      # 一次执行类型、规范、测试和生产构建检查
npm run typecheck  # TypeScript 检查
npm run lint       # ESLint 检查
npm run build      # 生产构建
npm run db:migrate # 开发环境执行数据库迁移
npm run db:seed    # 写入可重复执行的演示数据
npm run db:studio  # 打开数据库管理界面
npm run db:local:init   # 首次初始化本机免安装 PostgreSQL
npm run db:local:start  # 启动本机免安装 PostgreSQL
```

安装依赖请优先使用 `npm ci`。它严格按照已经提交的 `package-lock.json` 安装，团队成员会得到相同版本；只有主动升级依赖时才使用 `npm install` 并提交更新后的锁文件。

## 当前实现

- 个人主页统一承载账户资料、Enter 创建的技能标签、竞赛能力画像和个人 AI 设置，旧 `/profile` 自动跳转
- 能力画像、智能组队和探索盲盒共用服务端 AI Adapter；用户可统一开关，模型不可用时分别降级到固定评分、可解释排序和可信内容池
- 画像使用 16 题跨专业竞赛能力调查，覆盖问题解决、调研表达、参赛与获奖经验、项目交付；称呼、专业和年级直接同步个人主页
- `POST /api/profile`：标准化问卷评分；旧版证据分析接口仍保留兼容
- `GET/POST /api/matches`：技能互补、兴趣桥接、跨专业评分
- 比赛总览按开始报名时间排序，推荐比赛按用户画像排序
- 每场比赛拆分队长招募工作台与队员找队页，不再混用同一页面
- 组队中心按比赛组织队长招募和队员找队；用户可标记参赛意向，建队后才按数据库候选人意向、能力画像、招募标签与具体要求推荐队友
- 推荐用户主页展示联系方式，并支持队长发送组队邀请
- 真实赛事强制显示来源、核验时间和综测政策状态
- 用户与校内组织可发布校内比赛，发布内容明确标记待核验
- 建队技能输入支持回车生成多个可删除标签
- 同一用户在同一比赛只能加入或带领一支队伍；队长也只能发布一条招募
- 成员名单由队长和审批通过的申请自动生成；成员姓名可进入公开主页并支持悬浮查看专业、年级和技能
- 队长可删除队伍并清理关联申请与邀请；过期或满员招募自动隐藏
- 招募发布、主动邀请、申请加入、队长接受/拒绝和队伍人数更新闭环
- 探索页精简为“跨域灵感”和“获奖作品解读”两个同级入口：来源、同学文章、联系人与投稿集中在跨域灵感板块；获奖作品按专业拆成可点击、可展开的设计复盘
- 组队中心内置 10 项经过官方来源核验的全国大学生竞赛，覆盖软件、数学建模、电子、机械、智能车、创新创业与广告设计等方向；未知报名日期保持为空
- 学生跨领域文章投稿入口
- PostgreSQL 模式使用 `scrypt` 密码哈希和数据库会话，浏览器仅保存随机 HttpOnly 令牌；内存模式保留签名 Demo 会话
- 校园邮箱域名注册与注册后自动登录；邮箱所有权验证码等待邮件服务接入
- 收到的组队邀请支持接受/拒绝，接受后事务化入队并关闭同场其他待处理意向
- PostgreSQL/Prisma 持久化层，覆盖账户与画像、赛事、参赛意向、招募、成员、申请、邀请、文章和通知
- 招募创建、申请审批与成员入队使用数据库事务和唯一约束，避免并发下重复建队或重复入队
- `GET /api/health` 返回数据库连接、持久化模式和 AI 配置状态

## AI 配置

执行 `npm run setup` 生成 `.env`，再填写兼容 Chat Completions 的服务：

```text
AI_API_KEY=...
AI_BASE_URL=https://your-provider.example/v1
AI_MODEL=...
AI_SETTINGS_ENCRYPTION_KEY=至少32字节的独立随机字符串
SESSION_SECRET=至少32字节的随机字符串
```

登录后可在“个人主页 → AI 功能设置”保存个人 API Key、API 根地址和模型名称。密钥只提交到服务端，使用 AES-256-GCM 加密保存，查询接口不会返回明文；个人开关同时控制问卷画像、智能组队和探索盲盒。未开启或调用失败时会自动使用本地规则，不影响功能演示。能力画像的统一问卷分数始终由固定公式产生，AI 只解释证据并生成潜在方向；探索盲盒中的引用只能从服务端可信来源目录选择，模型不能返回自造链接。

## 数据库配置

默认的内存模式适合快速体验。正式持久化使用 PostgreSQL；在 `.env` 中配置 `DATA_BACKEND=postgresql` 和有效的 `DATABASE_URL` 后执行：

```bash
npm run db:migrate
npm run db:seed
```

`npm run db:local:start` 只适用于已按本项目文档配置免安装 PostgreSQL 的 Windows 开发机，不是 clone 后启动项目的必需步骤。

没有 PostgreSQL 时可设置 `DATA_BACKEND=memory` 继续体验全部流程；该模式重启后会恢复演示数据。生产部署在发布新版本时执行 `npm run db:deploy`，不要使用开发迁移命令。

clone、启动和常见错误见 [`docs/GETTING_STARTED.md`](docs/GETTING_STARTED.md)。数据库完整操作见 [`docs/DATABASE_SETUP.md`](docs/DATABASE_SETUP.md)，技术决策与下一步见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) 和 [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md)。
