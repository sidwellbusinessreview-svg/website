import { render, screen } from "@testing-library/react";
import { studioTheme, ThemeProvider } from "@sanity/ui";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { PreviewProps } from "sanity";

const formValues = vi.hoisted(() => ({
  sources: [
    { _key: "a", citation: "Source A" },
    { _key: "b", citation: "Source B" },
    { _key: "c", citation: "Source C" },
  ],
  body: [{
    _type: "block",
    _key: "paragraph",
    style: "normal",
    children: [
      { _type: "footnoteReference", _key: "one", sourceKey: "a" },
      { _type: "footnoteReference", _key: "two", sourceKey: "b" },
      { _type: "footnoteReference", _key: "three", sourceKey: "a" },
      { _type: "footnoteReference", _key: "four", sourceKey: "c" },
      { _type: "footnoteReference", _key: "five", sourceKey: "a" },
    ],
  }],
}));

vi.mock("sanity", async () => {
  const actual = await vi.importActual<typeof import("sanity")>("sanity");
  return { ...actual, useFormValue: (path: Array<string>) => path[0] === "body" ? formValues.body : formValues.sources };
});

import { FootnotePreview } from "./FootnotePreview";

beforeAll(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});

function props(key: string, sourceKey: string): PreviewProps {
  return { title: sourceKey, subtitle: key, renderDefault: vi.fn() } as unknown as PreviewProps;
}

describe("FootnotePreview", () => {
  it("shows live occurrence numbers rather than Source-list positions", () => {
    render(<ThemeProvider theme={studioTheme}><FootnotePreview {...props("three", "a")} /></ThemeProvider>);
    expect(screen.getByLabelText("Footnote 3")).toHaveTextContent("3");
  });

  it("is independent of Source order and renumbers after an earlier insertion", () => {
    const view = render(<ThemeProvider theme={studioTheme}><FootnotePreview {...props("three", "a")} /></ThemeProvider>);
    formValues.sources.reverse();
    view.rerender(<ThemeProvider theme={studioTheme}><FootnotePreview {...props("three", "a")} /></ThemeProvider>);
    expect(screen.getByLabelText("Footnote 3")).toBeInTheDocument();

    formValues.body[0].children.unshift({ _type: "footnoteReference", _key: "new", sourceKey: "c" });
    view.rerender(<ThemeProvider theme={studioTheme}><FootnotePreview {...props("three", "a")} /></ThemeProvider>);
    expect(screen.getByLabelText("Footnote 4")).toHaveTextContent("4");
  });
});
