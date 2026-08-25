import { describe, expect, it } from "vitest";
import config from "../../sanity.config";

describe("standalone Sanity Studio configuration", () => {
  it("always exports exactly one configured workspace", () => {
    expect(Array.isArray(config)).toBe(false);
    expect(config).toMatchObject({
      name: "sidwell_business_review",
      title: "Sidwell Business Review",
      projectId: "bumxf5q6",
      dataset: "production",
    });
    expect("basePath" in config).toBe(false);
    expect(config.plugins).toHaveLength(2);
    expect(config.schema?.types).toBeDefined();
  });
});
