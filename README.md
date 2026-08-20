# DUT Link

AI 驱动的校园探索与连接平台。当前仓库是依据产品 README 搭建的首个可运行框架，覆盖能力画像、智能组队、知识盲盒和资料录入 Demo。

## 启动

```bash
npm install
npm run dev
```

访问 <http://localhost:3000>。

## 可用命令

```bash
npm run dev        # 本地开发
npm run typecheck  # TypeScript 检查
npm run lint       # ESLint 检查
npm run build      # 生产构建
```

## 当前实现

- 响应式产品首页与四个核心场景页面
- 可提交的个人资料表单
- `POST /api/profile` 画像生成接口
- 本地规则生成器，便于无密钥演示
- PostgreSQL/Prisma 数据模型草案
- AI、数据和 UI 的基础模块边界

完整技术决策与下一步见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。
