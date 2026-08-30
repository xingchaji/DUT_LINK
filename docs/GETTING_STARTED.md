# Clone 后启动与故障排查

## 推荐环境

- Git
- Node.js 22 LTS（推荐 22.12 或更高的 22.x）
- npm 10 或更高版本
- Chrome、Edge、Firefox 或 Safari 的现代版本

项目的 `.nvmrc` 和 `.node-version` 固定了推荐 Node.js 版本；`package-lock.json` 固定了 JavaScript 依赖版本。不要提交或传递 `node_modules`、`.next`、`.env` 和 `.local`。

## 全新启动

```bash
git clone git@github.com:xingchaji/DUT_LINK.git
cd DUT_LINK
npm ci
npm run setup
npm run dev
```

打开 <http://localhost:3000>。Demo 账号为 `student@dlut.edu.cn`，密码为 `demo1234`。

默认采用内存演示模式，不需要 PostgreSQL，也不需要 AI Key。进程重启后演示数据会恢复。需要持久化数据时再阅读 [`DATABASE_SETUP.md`](DATABASE_SETUP.md)。

Windows 用户可以双击仓库根目录的 `start.bat`。它会检查 Node.js、安装锁定依赖、创建环境文件并启动应用，但不会尝试寻找或启动某台电脑特有的 PostgreSQL。

## 常见错误

### `npm error ENOENT ... package.json`

当前终端不在项目根目录。先进入 clone 后包含 `package.json` 的 `DUT_LINK` 文件夹，再运行 npm 命令。

### Node.js 版本不兼容

运行 `node -v`。本项目中的 Prisma 7 要求 Node.js `20.19+`、`22.12+` 或 `24+`，推荐直接安装 Node.js 22 LTS。切换版本后删除旧的 `node_modules`，重新执行 `npm ci`。

### `npm ci` 提示锁文件不一致

先确认使用的是仓库最新代码。项目维护者升级依赖后必须同时提交 `package.json` 和 `package-lock.json`。普通使用者不要删除锁文件，应优先反馈该问题。

### Prisma Client 找不到或类型不匹配

执行：

```bash
npm ci
npm run db:generate
```

生成目录不提交 Git，它会在安装后的 `postinstall` 阶段按当前系统重新生成。

### 数据库连接失败

只想体验项目时，检查 `.env` 是否为：

```text
DATA_BACKEND="memory"
```

并删除或注释 `DATABASE_URL`。需要 PostgreSQL 时，确认服务已启动、数据库已创建、连接字符串正确，并对密码中的特殊字符进行 URL 编码，然后执行迁移和种子命令。

### 端口 3000 被占用

Next.js 通常会选择 3001 等可用端口，终端会显示实际地址。如果终端提示已有同一项目的开发服务，可以直接打开原地址，或者先在原终端按 `Ctrl+C` 停止它。

### 浏览器出现旧页面或奇怪的构建错误

先停止开发服务，再删除仅由本机构建产生的 `.next` 文件夹并重新执行 `npm run dev`。不要删除源码、`.env` 或数据库目录。

### API 返回空内容或页面提示服务未就绪

打开 <http://localhost:3000/api/health>。内存模式应返回 `ok: true` 和 `backend: "memory"`。PostgreSQL 模式返回 503 时，按数据库错误排查；AI 未配置不会阻止项目启动，本地规则会自动接管。

## 提交前检查

```bash
npm run check
```

该命令依次执行 TypeScript 检查、ESLint、自动化测试和生产构建。四项全部通过后再提交，可以显著减少其他人 clone 后遇到的问题。
