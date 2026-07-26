import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PreviewBanner } from "./preview-banner";

describe("PreviewBanner", () => {
  it("clearly identifies unpublished content and provides an accessible exit", () => {
    render(<PreviewBanner publicationName="Draft Publication Name" redirectPath="/articles/example" />);
    expect(screen.getByRole("complementary", { name: "Draft preview status" })).toHaveTextContent("Previewing unpublished content");
    expect(screen.getByText(/Draft Publication Name/)).toBeVisible();
    expect(screen.getByText(/every localhost tab in this browser session/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Exit preview" })).toBeVisible();
    expect(screen.getByRole("form", { name: "Exit draft preview" }))
      .toHaveAttribute("action", "/api/draft-mode/disable?redirect=%2Farticles%2Fexample");
    expect(screen.getByRole("form", { name: "Exit draft preview" })).toHaveAttribute("target", "_top");
  });
});
