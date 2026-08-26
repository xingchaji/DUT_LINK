import { describe, expect, it } from "vitest";
import { hashPassword, isPasswordAcceptable, verifyPassword } from "@/lib/password";

describe("password scrypt 哈希", () => {
  it("生成的哈希格式为 scrypt$salt$key", async () => {
    const hash = await hashPassword("demo1234");
    const parts = hash.split("$");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("scrypt");
    expect(parts[1].length).toBeGreaterThan(0);
    expect(parts[2].length).toBeGreaterThan(0);
  });

  it("相同密码两次哈希结果不同（随机盐）", async () => {
    const a = await hashPassword("demo1234");
    const b = await hashPassword("demo1234");
    expect(a).not.toBe(b);
  });

  it("正确密码校验通过", async () => {
    const hash = await hashPassword("demo1234");
    await expect(verifyPassword("demo1234", hash)).resolves.toBe(true);
  });

  it("错误密码校验失败", async () => {
    const hash = await hashPassword("demo1234");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("非法哈希格式返回 false", async () => {
    await expect(verifyPassword("demo1234", "not-a-valid-hash")).resolves.toBe(false);
    await expect(verifyPassword("demo1234", "")).resolves.toBe(false);
  });
});

describe("isPasswordAcceptable", () => {
  it("8–72 位且同时含字母和数字时通过", () => {
    expect(isPasswordAcceptable("demo1234")).toBe(true);
    expect(isPasswordAcceptable("a1b2c3d4")).toBe(true);
  });

  it("过短或过长被拒绝", () => {
    expect(isPasswordAcceptable("a1b2c3")).toBe(false);
    expect(isPasswordAcceptable("a".repeat(73) + "1")).toBe(false);
  });

  it("缺少字母或数字被拒绝", () => {
    expect(isPasswordAcceptable("12345678")).toBe(false);
    expect(isPasswordAcceptable("abcdefgh")).toBe(false);
  });
});
