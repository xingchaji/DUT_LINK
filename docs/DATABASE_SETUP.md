# PostgreSQL 数据库配置

## 两种运行模式

- `DATA_BACKEND=postgresql`：正式持久化模式，所有已接入领域数据写入 PostgreSQL。
- `DATA_BACKEND=memory`：零配置演示模式，不连接数据库，进程重启后恢复种子数据。

未设置 `DATABASE_URL` 时会自动使用内存模式。`GET /api/health` 可确认当前模式、数据库连接和 AI Adapter 状态。

## 本地初始化

1. 创建 PostgreSQL 数据库 `dut_link`。
2. 将 `.env.example` 复制为 `.env`，确认 `DATA_BACKEND=postgresql`，并修改 `DATABASE_URL` 中的用户名、密码、地址和数据库名。使用 `.env` 可确保 Next.js 与 Prisma CLI 读取同一份配置。
3. 执行迁移与种子数据：

```bash
npm run db:migrate
npm run db:seed
```

种子脚本采用 upsert，可重复执行。它会初始化 Demo 用户、公开候选人、赛事、两支队伍、队伍成员、申请、文章、通知和示例能力画像。

## 开发与部署命令

```bash
npm run db:generate # 根据模型生成类型安全客户端
npm run db:local:start  # 启动当前 Windows 用户下的免安装 PostgreSQL
npm run db:local:status # 查看本机 PostgreSQL 状态
npm run db:local:stop   # 正常停止本机 PostgreSQL
npm run db:migrate  # 本地开发：创建并执行迁移
npm run db:deploy   # 测试/生产：只执行已提交迁移
npm run db:seed     # 写入演示数据
npm run db:studio   # 可视化查看数据库
```

生产环境应在应用启动前运行 `npm run db:deploy`，不要在生产环境运行 `db:migrate`。仓库中的 `prisma/migrations` 是数据库结构的版本记录，应与代码一同提交。

## 当前持久化范围

- 用户公开资料与竞赛能力画像
- 赛事目录与用户参赛意向
- 招募队伍与比赛成员关系
- 申请、审批、队长邀请与通知
- 学生文章

PostgreSQL 模式已经使用 `passwordHash` 和 `Session`：密码通过 scrypt 加盐哈希，浏览器保存随机令牌，数据库只保存令牌哈希。当前已限制大工邮箱域名，但尚未接入邮箱验证码、找回密码、登录限流和设备会话管理，因此仍不应视为完整生产级账户系统。

## 当前 Windows 本机运行时

当前开发机的 PostgreSQL 17 二进制运行时位于 `%LOCALAPPDATA%\DUTLink\PostgreSQL17`，项目数据库和日志位于仓库内已忽略的 `.local/`。由于当前会话没有注册 Windows 服务的管理员权限，它不会随系统自动启动。电脑重启后的启动顺序为：

```bash
npm run db:local:start
npm run dev
```

该本机脚本仅用于开发便利；正式部署应使用托管 PostgreSQL 或由运维管理的数据库服务。
