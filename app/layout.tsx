import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "DUT Link · 遇见新的可能",
  description: "AI 驱动的校园探索与连接平台",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>
        <Navigation />
        <main className="min-h-screen pb-28 lg:ml-72 lg:pb-0">{children}</main>
      </body>
    </html>
  );
}
