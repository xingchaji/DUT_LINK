"use client";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, background: "#f4f4ef", color: "#172033", fontFamily: "Segoe UI, Microsoft YaHei, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <section style={{ width: "min(620px, 100%)", borderRadius: 28, background: "white", padding: 36, boxShadow: "0 24px 70px rgba(23,32,51,.10)" }}>
            <p style={{ margin: 0, color: "#7164e8", fontSize: 13, fontWeight: 700 }}>DUT LINK</p>
            <h1 style={{ margin: "14px 0 0", fontSize: 32 }}>应用暂时无法显示</h1>
            <p style={{ margin: "14px 0 0", color: "#6e7582", lineHeight: 1.8 }}>初始化过程中出现了意外问题。请重试；如果仍然失败，请检查启动窗口中的错误信息。</p>
            <button type="button" onClick={() => retry()} style={{ marginTop: 24, border: 0, borderRadius: 16, background: "#172033", color: "white", padding: "13px 20px", fontWeight: 700, cursor: "pointer" }}>重新加载</button>
          </section>
        </main>
      </body>
    </html>
  );
}
