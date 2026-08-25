import { describe, expect, it } from "vitest";
import { clearFailures, isLocked, recordFailure, remainingLockMs } from "@/lib/rate-limit";

function uniqueKey() {
  return `test-${Math.random().toString(36).slice(2)}`;
}

describe("登录失败限流", () => {
  it("未触发阈值前不锁定", () => {
    const key = uniqueKey();
    for (let i = 0; i < 4; i += 1) recordFailure(key);
    expect(isLocked(key)).toBe(false);
  });

  it("连续失败 5 次后锁定", () => {
    const key = uniqueKey();
    for (let i = 0; i < 5; i += 1) recordFailure(key);
    expect(isLocked(key)).toBe(true);
    expect(remainingLockMs(key)).toBeGreaterThan(0);
  });

  it("锁定后清除失败记录即可解锁", () => {
    const key = uniqueKey();
    for (let i = 0; i < 5; i += 1) recordFailure(key);
    expect(isLocked(key)).toBe(true);
    clearFailures(key);
    expect(isLocked(key)).toBe(false);
  });
});
