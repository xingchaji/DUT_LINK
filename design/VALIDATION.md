# 验证记录 · 立体版（纸感工作台 v2）

记录实际做过什么、没做什么。不代替人工审美判断。

## 版本

| 版本 | 分支 | 标签 |
| --- | --- | --- |
| v1 扁平纸感 | `design/paper-flat` | `paper-flat-v1` |
| v2 立体纸感 | `feat/depth-ui` | `depth-v1` |

回退：`git checkout design/paper-flat`（或 `git reset --hard paper-flat-v1`）。

## 自动化

| 项目 | 命令 | 结果 |
| --- | --- | --- |
| 类型 | `npx tsc --noEmit` | 通过 |
| 规范 | `npx eslint .` | No issues found |
| 测试 | `npx vitest run` | 8 文件 / 37 用例通过 |
| 构建 | `npm run build` | 通过 |

## 动效实测（Chrome headless + 真实 dev server）

- **数字计数**：进入视区后 `CountUp` 从 0 增长到目标值，SSR 首帧输出最终值（无 JS 可读）。
- **进度条 / 环形**：`Meter` 宽度、`Ring` 的 `stroke-dashoffset` 逐帧变化（实测序列 70.78 → 40.43 → 28.36 → 25.77px，约 500ms 收敛），不是一次性跳变。
- **3D 倾斜**：`/opportunities` 悬停单卡时 `perspective + rotateX/rotateY` 生效，指针高光跟随；同尺寸网格下同一时刻只有一张处于倾斜态。
- **页面切换**：路由跳转后 `main > *` 在 ~120ms 处可见淡入 + 8px 上移，~800ms 后稳定。
- **浮层**：通知 Popover 从右上角 `pop` 展开；表单展开、折叠块展开同样使用 `pop`。
- **按压**：按钮 / 选项 / 卡片 `active` 状态有 0.97–0.99 缩放与阴影塌陷。
- **减少动态**：`prefers-reduced-motion: reduce` 下 `html` 不挂 `js-motion`，`reveal-on-scroll` 全部可见（实测 hidden=0），tilt 不触发，计数与进度直接呈现最终值。
- **无 JS**：内联脚本不执行，内容与进度全部以最终状态可见。

## 视觉实测

- 宽度：1600 / 1280 / 1024 / 430
- 页面：首页、组队中心（含发布表单）、探索盲盒（两个入口）、申请管理、个人主页、能力测评、登录、比赛文档、寻找队伍、队长工作台、人物页、内容审核、404
- 控制台：无 pageerror / console error（登录态下的 403 审核接口、初次 favicon 404 为预期）
- 全页截图前会渐进滚动触发所有 `Reveal`，避免把「未进入视区」误判为「内容缺失」

## 已知局限

- 触屏与真机未实测：tilt / magnetic 在触屏上按 `pointerType` 关闭，但仍未在 iOS/Android 真机验证滚动性能。
- `backdrop-blur` 仅保留在移动端固定顶栏与底部导航。
- 未做屏幕阅读器走查；`aria-current` / `aria-pressed` / `aria-expanded` 通过 DOM 与属性检查，未逐页 Tab 实测。
- 未在 Firefox / Safari 实测；`mask-composite`、`mix-blend-mode` 在旧版本浏览器上会退化为无描边光斑，不影响可读性。
- hover / 焦点 / 动效以单帧与逐帧采样核对，未录制视频。
- `js-motion` 由内联脚本在首帧前写入；若 JS 完全失败，内容仍可见，但滚动揭示与计数不会播放。
