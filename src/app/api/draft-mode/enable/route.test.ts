import { beforeEach, describe, expect, it, vi } from "vitest";

const enable = vi.fn();
const validatePreviewUrl = vi.fn();
vi.mock("next/headers", () => ({ draftMode: async () => ({ enable, isEnabled: false }) }));
vi.mock("@sanity/preview-url-secret", () => ({ validatePreviewUrl }));
vi.mock("@/sanity/lib/client", () => ({ getDraftSanityClient: () => ({}) }));

describe("draft preview enable route", () => {
  beforeEach(() => {
    enable.mockReset();
    validatePreviewUrl.mockReset();
    process.env.SANITY_PREVIEW_SECRET = "test-preview-secret";
  });

  it("rejects missing and incorrect secrets", async () => {
    validatePreviewUrl.mockResolvedValue({ isValid: false });
    const { GET } = await import("./route");
    expect((await GET(new Request("http://local/api/draft-mode/enable"))).status).toBe(401);
    expect((await GET(new Request("http://local/api/draft-mode/enable?secret=wrong"))).status).toBe(401);
    expect(enable).not.toHaveBeenCalled();
  });

  it("activates preview and restricts redirects to local paths", async () => {
    const { GET } = await import("./route");
    const valid = await GET(new Request("http://local/api/draft-mode/enable?secret=test-preview-secret&redirect=%2Fabout"));
    expect(valid.status).toBe(307);
    expect(valid.headers.get("location")).toBe("http://local/about");
    expect(valid.headers.get("x-robots-tag")).toContain("noindex");
    expect(enable).toHaveBeenCalledOnce();

    const unsafe = await GET(new Request("http://local/api/draft-mode/enable?secret=test-preview-secret&redirect=https%3A%2F%2Fevil.example"));
    expect(unsafe.headers.get("location")).toBe("http://local/");
  });
});
