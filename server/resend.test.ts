import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Resend API Integration", () => {
  it("should have valid Resend API key configured", () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toMatch(/^re_/);
  });

  it("should be able to instantiate Resend client", () => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    expect(resend).toBeDefined();
  });

  it("should validate Resend API key format", () => {
    const apiKey = process.env.RESEND_API_KEY;
    // Resend API keys start with 're_'
    expect(apiKey).toMatch(/^re_[a-zA-Z0-9_]+$/);
  });
});
