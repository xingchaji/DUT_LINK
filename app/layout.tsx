import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "DUT Link · 遇见新的可能",
  description: "AI 驱动的校园探索与连接平台：能力画像、比赛组队与跨域灵感，都在同一张工作台里。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(window.matchMedia&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js-motion')}}catch(e){}",
          }}
        />
        <Navigation />
        <main className="relative z-10 min-h-screen pb-28 lg:ml-[276px] lg:pb-0">{children}</main>
      </body>
    </html>
  );
}
