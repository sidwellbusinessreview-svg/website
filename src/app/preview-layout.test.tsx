import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const draftMode = vi.fn();
vi.mock("next/headers", () => ({ draftMode }));
vi.mock("@/components/preview-chrome", () => ({
  PreviewChrome: () => (
    <>
      <span>Previewing unpublished content</span>
      <div data-testid="visual-editing-bridge" />
    </>
  ),
}));
vi.mock("@/components/site-shell", () => ({
  SiteShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

describe("Draft Mode layout", () => {
  beforeEach(() => draftMode.mockReset());

  it("mounts the Presentation bridge and banner only in Draft Mode", async () => {
    draftMode.mockResolvedValue({ isEnabled: true });
    const { default: RootLayout } = await import("./layout");
    render(await RootLayout({ children: <p>Preview content</p> }));
    expect(screen.getByTestId("visual-editing-bridge")).toBeInTheDocument();
    expect(screen.getByText("Previewing unpublished content")).toBeVisible();
  });

  it("keeps the bridge out of normal public pages", async () => {
    draftMode.mockResolvedValue({ isEnabled: false });
    const { default: RootLayout } = await import("./layout");
    render(await RootLayout({ children: <p>Published content</p> }));
    expect(screen.queryByTestId("visual-editing-bridge")).not.toBeInTheDocument();
    expect(screen.queryByText("Previewing unpublished content")).not.toBeInTheDocument();
  });
});
