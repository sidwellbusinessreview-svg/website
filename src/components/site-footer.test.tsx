import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { siteSettingsSchema } from "@/content/schemas";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("keeps the provider contact email in a mailto link", () => {
    const settings = siteSettingsSchema.parse({
      ...siteConfig,
      contact: { label: "Contact the editors", email: "sidwellbusinessreview@gmail.com" },
    });
    render(<SiteFooter settings={settings} />);
    expect(screen.getByRole("link", { name: "Contact the editors" }))
      .toHaveAttribute("href", "mailto:sidwellbusinessreview@gmail.com");
  });
});
