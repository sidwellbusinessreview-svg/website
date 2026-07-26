import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PreviewChrome } from "./preview-chrome";

const state = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("next-sanity/visual-editing", () => ({
  VisualEditing: () => <div data-testid="visual-editing-bridge" />,
}));

describe("PreviewChrome route scope", () => {
  beforeEach(() => { state.pathname = "/"; });

  it.each(["/", "/articles/example", "/authors/example", "/about"])("renders on public route %s", (pathname) => {
    state.pathname = pathname;
    render(<PreviewChrome publicationName="Draft Publication" />);
    expect(screen.getByText("Previewing unpublished content")).toBeVisible();
    expect(screen.getByTestId("visual-editing-bridge")).toBeInTheDocument();
  });

  it.each([
    "/studio",
    "/studio/structure",
    "/studio/structure/about",
    "/studio/structure/siteSettings",
    "/studio/structure/articles",
    "/studio/preview/siteSettings/siteSettings",
    "/api/draft-mode/enable",
    "/feed.xml",
    "/sitemap.xml",
    "/robots.txt",
  ])("does not mount public preview UI on %s", (pathname) => {
    state.pathname = pathname;
    render(<PreviewChrome />);
    expect(screen.queryByText("Previewing unpublished content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("visual-editing-bridge")).not.toBeInTheDocument();
  });
});
