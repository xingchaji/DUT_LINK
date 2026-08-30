import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ getPrisma: () => null }));

import { authenticateUser, registerUser } from "@/lib/auth";

describe("memory authentication", () => {
  it("provides the second seeded account used by the two-browser demo", async () => {
    const user = await authenticateUser("zhouyu@dlut.edu.cn", "demo1234");
    expect(user).toMatchObject({ id: "zhou-yu", name: "周宇", major: "建筑学" });
  });

  it("registers and authenticates a temporary campus account", async () => {
    const email = `demo-${crypto.randomUUID()}@mail.dlut.edu.cn`;
    const created = await registerUser({ name: "演示同学", email, password: "demo12345", major: "软件工程", grade: "大二" });
    const authenticated = await authenticateUser(email, "demo12345");

    expect(created.email).toBe(email);
    expect(authenticated).toMatchObject({ id: created.id, name: "演示同学", role: "student" });
  });

  it("rejects duplicate memory registrations", async () => {
    await expect(registerUser({ name: "重复用户", email: "student@dlut.edu.cn", password: "demo12345", major: "软件工程" })).rejects.toMatchObject({
      message: "该校园邮箱已经注册",
      status: 409,
    });
  });
});
