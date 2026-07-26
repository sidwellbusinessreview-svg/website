import { describe, expect, it, vi } from "vitest";

const disable = vi.fn();
vi.mock("next/headers", () => ({ draftMode: async () => ({ disable }) }));

describe("draft preview disable route", () => {
  it("clears preview and redirects safely", async () => {
    const { POST } = await import("./route");
    const response = await POST(new Request("http://local/api/draft-mode/disable?redirect=%2Fabout", { method: "POST" }));
    expect(disable).toHaveBeenCalledOnce();
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://local/about");
  });

  it.each([
    ["%2Fstudio", "http://local/"],
    ["%2Fstudio%2Fstructure", "http://local/"],
    ["%2Fapi%2Frevalidate%2Fsanity", "http://local/"],
    ["%2F%2Fevil.example", "http://local/"],
    ["https%3A%2F%2Fevil.example", "http://local/"],
    ["%2Farticles%2Fexample%3Fsanity-preview-secret%3Dremove", "http://local/articles/example"],
  ])("sanitizes exit redirect %s", async (redirect, expected) => {
    const { POST } = await import("./route");
    const response = await POST(new Request(`http://local/api/draft-mode/disable?redirect=${redirect}`, { method: "POST" }));
    expect(response.headers.get("location")).toBe(expected);
  });
});
