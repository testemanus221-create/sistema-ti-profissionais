import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import crypto from "crypto";
import { users } from "../drizzle/schema";
import { sql as dbSql } from "drizzle-orm";

function createLoginContext(): { ctx: TrpcContext; setCookieCalls: string[] } {
  const setCookieCalls: string[] = [];

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      setHeader: (name: string, value: string) => {
        if (name === "Set-Cookie") {
          setCookieCalls.push(value);
        }
      },
    } as TrpcContext["res"],
  };

  return { ctx, setCookieCalls };
}

describe("auth.loginEmail", () => {
  beforeEach(async () => {
    // Limpar dados de teste antes de cada teste
    const dbInstance = await db.getDb();
    if (dbInstance) {
      try {
        await dbInstance
          .delete(users)
          .where(
            dbSql`email IN ('test@example.com', 'TEST@EXAMPLE.COM')`
          );
      } catch (error) {
        // Ignorar erro se tabela não existir
      }
    }
  });

  it("should fail with incorrect email", async () => {
    const { ctx } = createLoginContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.loginEmail({
        email: "nonexistent@example.com",
        senha: "password123",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
      expect(error.message).toBe("Email ou senha incorretos");
    }
  });

  it("should fail with incorrect password", async () => {
    // Primeiro, criar um usuário
    const password = "correctpassword";
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const dbInstance = await db.getDb();
    if (!dbInstance) {
      expect.fail("Database not available");
    }

    await dbInstance.insert(users).values({
      openId: "test-user-123",
      name: "Test User",
      email: "test@example.com",
      passwordHash: passwordHash,
      loginMethod: "email",
      role: "user",
    });

    const { ctx } = createLoginContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.loginEmail({
        email: "test@example.com",
        senha: "wrongpassword",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.message).toBe("Email ou senha incorretos");
    }
  });

  it("should successfully login with correct email and password", async () => {
    // Primeiro, criar um usuário
    const password = "correctpassword";
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const dbInstance = await db.getDb();
    if (!dbInstance) {
      expect.fail("Database not available");
    }

    await dbInstance.insert(users).values({
      openId: "test-user-login-123",
      name: "Test User",
      email: "test@example.com",
      passwordHash: passwordHash,
      loginMethod: "email",
      role: "user",
    });

    const { ctx, setCookieCalls } = createLoginContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.loginEmail({
      email: "test@example.com",
      senha: password,
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe("test@example.com");
    expect(result.user.name).toBe("Test User");

    // Verificar se o cookie foi setado
    expect(setCookieCalls.length).toBeGreaterThan(0);
    const cookieHeader = setCookieCalls[0];
    expect(cookieHeader).toContain(COOKIE_NAME);
    expect(cookieHeader).toContain("HttpOnly");
    expect(cookieHeader).toContain("Secure");
  });

  it("should normalize email (lowercase and trim)", async () => {
    // Primeiro, criar um usuário com email lowercase
    const password = "correctpassword";
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const dbInstance = await db.getDb();
    if (!dbInstance) {
      expect.fail("Database not available");
    }

    await dbInstance.insert(users).values({
      openId: "test-user-normalize-123",
      name: "Test User",
      email: "test@example.com",
      passwordHash: passwordHash,
      loginMethod: "email",
      role: "user",
    });

    const { ctx } = createLoginContext();
    const caller = appRouter.createCaller(ctx);

    // Tentar fazer login com email em uppercase
    const result = await caller.auth.loginEmail({
      email: "TEST@EXAMPLE.COM",
      senha: password,
    });

    expect(result.success).toBe(true);
    expect(result.user.email).toBe("test@example.com");
  });
});
