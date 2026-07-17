import { describe, expect, it } from "vitest";
import { getSanityEnvironment, readPublicSanityEnvironment } from "@/sanity/env";
import { createPublicSanityClient } from "@/sanity/lib/client";

const validEnvironment = {
  NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123xy",
  NEXT_PUBLIC_SANITY_DATASET: "development",
  NEXT_PUBLIC_SANITY_API_VERSION: "2026-07-17",
  NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH: "/studio",
};

describe("Sanity environment", () => {
  it("keeps local-content mode safe when public values are absent", () => {
    expect(getSanityEnvironment({})).toEqual({
      configured: false,
      studioBasePath: "/studio",
    });
  });

  it("accepts a complete public Studio configuration", () => {
    expect(getSanityEnvironment(validEnvironment)).toMatchObject({
      configured: true,
      projectId: "abc123xy",
      dataset: "development",
      apiVersion: "2026-07-17",
      studioBasePath: "/studio",
    });
  });

  it("reads each public value through a statically addressable environment key", () => {
    const previous = {
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
      basePath: process.env.NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH,
    };

    try {
      Object.assign(process.env, validEnvironment);
      expect(getSanityEnvironment(readPublicSanityEnvironment())).toMatchObject({
        configured: true,
        projectId: "abc123xy",
        dataset: "development",
        apiVersion: "2026-07-17",
        studioBasePath: "/studio",
      });
    } finally {
      for (const [key, value] of Object.entries({
        NEXT_PUBLIC_SANITY_PROJECT_ID: previous.projectId,
        NEXT_PUBLIC_SANITY_DATASET: previous.dataset,
        NEXT_PUBLIC_SANITY_API_VERSION: previous.apiVersion,
        NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH: previous.basePath,
      })) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });

  it("rejects partial, malformed, or mismatched route configuration", () => {
    expect(() =>
      getSanityEnvironment({ NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123xy" }),
    ).toThrow(/incomplete/i);

    expect(() =>
      getSanityEnvironment({
        ...validEnvironment,
        NEXT_PUBLIC_SANITY_PROJECT_ID: "NOT VALID",
      }),
    ).toThrow(/projectId/i);

    expect(() =>
      getSanityEnvironment({
        ...validEnvironment,
        NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH: "/admin",
      }),
    ).toThrow(/studioBasePath/i);
  });

  it("creates a published, CDN-backed client without a token", () => {
    const environment = getSanityEnvironment(validEnvironment);
    expect(environment.configured).toBe(true);
    if (!environment.configured) throw new Error("Expected configured test environment");

    const config = createPublicSanityClient(environment).config();
    expect(config.useCdn).toBe(true);
    expect(config.perspective).toBe("published");
    expect(config.token).toBeUndefined();
  });
});
