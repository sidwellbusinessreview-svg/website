import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { siteSettingsSchema } from "@/content/schemas";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("renders the selected provider tagline instead of the static fallback", () => {
    const settings = siteSettingsSchema.parse({
      ...siteConfig,
      tagline: "Unpublished Site Settings tagline",
    });
    render(<SiteHeader settings={settings} />);
    expect(screen.getByText("Unpublished Site Settings tagline")).toBeVisible();
    expect(screen.queryByText(siteConfig.tagline)).not.toBeInTheDocument();
  });
});
