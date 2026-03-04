/**
 * Sample test file for frontend unit tests.
 *
 * Tests are written with Vitest (bundled with Vite).
 * Run all tests with: npm test
 *
 * TODO: Add meaningful test coverage as the application grows.
 */

import { describe, expect, it } from "vitest";

describe("Utility: cn()", () => {
  it("returns empty string for no arguments", async () => {
    const { cn } = await import("../src/lib/utils");
    expect(cn()).toBe("");
  });

  it("merges class names", async () => {
    const { cn } = await import("../src/lib/utils");
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves Tailwind conflicts (last wins)", async () => {
    const { cn } = await import("../src/lib/utils");
    // bg-red-500 should be overridden by bg-blue-500
    const result = cn("bg-red-500", "bg-blue-500");
    expect(result).toBe("bg-blue-500");
  });
});

describe("Recipe total time", () => {
  it("calculates total time correctly", () => {
    const prepTime = 10;
    const cookTime = 25;
    expect(prepTime + cookTime).toBe(35);
  });
});
