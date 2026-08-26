import { describe, expect, it } from "vitest";
import { DomainError, errorResponse } from "@/lib/domain-error";

describe("DomainError", () => {
  it("默认状态码为 400", () => {
    const error = new DomainError("参数错误");
    expect(error.message).toBe("参数错误");
    expect(error.status).toBe(400);
    expect(error.name).toBe("DomainError");
  });

  it("可携带自定义状态码", () => {
    const error = new DomainError("无权操作", 403);
    expect(error.status).toBe(403);
  });
});

describe("errorResponse", () => {
  it("将 DomainError 转为对应状态的 JSON 响应", () => {
    const response = errorResponse(new DomainError("队伍不存在", 404));
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("application/json");
  });

  it("未知异常统一转为 500", () => {
    const response = errorResponse(new Error("unexpected"));
    expect(response.status).toBe(500);
  });
});
