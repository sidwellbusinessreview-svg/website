import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag }));

describe("Sanity revalidation endpoint", () => {
  beforeEach(() => {
    vi.resetModules();
    revalidateTag.mockReset();
    process.env.SANITY_REVALIDATE_SECRET = "test-only-secret";
  });

  it("rejects requests without the server-only secret", async () => {
    const { POST } = await import("./route");
    const response = await POST(new Request("http://local/api/revalidate/sanity", { method: "POST" }));
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects an incorrect secret and cannot accept caller-selected tags", async () => {
    const { POST } = await import("./route");
    const response = await POST(new Request("http://local/api/revalidate/sanity", {
      method: "POST",
      headers: { authorization: "Bearer wrong-secret", "content-type": "application/json" },
      body: JSON.stringify({ tag: "attacker-controlled", path: "/" }),
    }));
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("revalidates public content for an authorized webhook", async () => {
    const { POST } = await import("./route");
    const response = await POST(new Request("http://local/api/revalidate/sanity", {
      method: "POST",
      headers: { authorization: "Bearer test-only-secret" },
    }));
    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("content", "max");
  });
});
