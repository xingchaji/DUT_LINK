import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 开发模式的悬浮指示器会压住侧栏底部的头像 / 退出按钮（以及移动端「首页」标签），
  // 让人误以为这些按钮点不动，所以关掉它；编译与运行时错误仍会正常提示。
  devIndicators: false,
};

export default nextConfig;
