import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { studioTheme, ThemeProvider } from "@sanity/ui";
import { useState } from "react";
import { beforeAll, expect, it, vi } from "vitest";
import type { ArrayOfObjectsInputProps } from "sanity";

vi.mock("sanity", async () => {
  const actual = await vi.importActual<typeof import("sanity")>("sanity");
  return { ...actual, useFormValue: () => [] };
});

import { ArticleSourcesInput, type ArticleSourceValue } from "./ArticleSourcesInput";

beforeAll(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});

function Harness() {
  const [value, setValue] = useState<ArticleSourceValue[]>([]);
  return <ArticleSourcesInput {...({
    value,
    readOnly: false,
    onChange: (patch: { value?: ArticleSourceValue[] }) => setValue(patch.value ?? []),
  } as unknown as ArrayOfObjectsInputProps<ArticleSourceValue>)} />;
}

it("expands a newly added Source and focuses its Citation field", async () => {
  render(<ThemeProvider theme={studioTheme}><Harness /></ThemeProvider>);
  await userEvent.click(screen.getByRole("button", { name: "Add source" }));
  expect(screen.getByLabelText("Citation")).toHaveFocus();
  expect(screen.getByLabelText("Citation")).toHaveValue("");
});
