import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

// Test the chat input schema validation
describe("chat.router", () => {
  const chatInputSchema = z.object({
    message: z.string().min(1).max(4000),
    conversationHistory: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })
      )
      .optional()
      .default([]),
  });

  it("validates a valid chat message", () => {
    const validInput = {
      message: "Hello, Dr. Sam!",
      conversationHistory: [],
    };

    const result = chatInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects an empty message", () => {
    const invalidInput = {
      message: "",
      conversationHistory: [],
    };

    const result = chatInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("rejects a message that is too long", () => {
    const invalidInput = {
      message: "a".repeat(4001),
      conversationHistory: [],
    };

    const result = chatInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it("accepts conversation history with valid roles", () => {
    const validInput = {
      message: "Follow up question",
      conversationHistory: [
        { role: "user" as const, content: "First message" },
        { role: "assistant" as const, content: "First response" },
      ],
    };

    const result = chatInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects conversation history with invalid roles", () => {
    const invalidInput = {
      message: "Follow up question",
      conversationHistory: [
        { role: "system", content: "Invalid role" },
      ],
    };

    const result = chatInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});
