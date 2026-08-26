import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("Next build content source", () => {
  it("compiles the provider choice into server runtime code", () => {
    expect(nextConfig.env?.CONTENT_SOURCE).toBe(process.env.CONTENT_SOURCE ?? "local");
  });
});
