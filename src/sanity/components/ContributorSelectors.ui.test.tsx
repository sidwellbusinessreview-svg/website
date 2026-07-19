import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { studioTheme, ThemeProvider } from "@sanity/ui";
import type { InputProps } from "sanity";

const fetch = vi.fn();
vi.mock("sanity", async (importOriginal) => {
  const actual = await importOriginal<typeof import("sanity")>();
  return { ...actual, useClient: () => ({ fetch, assets: { upload: vi.fn() } }) };
});

import { ContributorArrayInput } from "./ContributorSelectors";

function props(value: unknown = undefined): InputProps {
  return {
    value,
    onChange: vi.fn(),
    renderDefault: vi.fn(() => <button>Add item</button>),
    schemaType: { name: "contributors" },
  } as unknown as InputProps;
}

function renderInput(input = props()) {
  return render(<ThemeProvider theme={studioTheme}><ContributorArrayInput {...input} /></ThemeProvider>);
}

describe("authoritative Article contributor input", () => {
  beforeEach(() => {
    fetch.mockReset(); fetch.mockResolvedValue([]);
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });

  it("renders exactly one insertion path and never renders Sanity's default input", () => {
    const input = props();
    renderInput(input);
    expect(screen.getAllByRole("button", { name: "Add contributors" })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Add item" })).not.toBeInTheDocument();
    expect(input.renderDefault).not.toHaveBeenCalled();
    expect(screen.queryByText(/choose contributor with confirmation/i)).not.toBeInTheDocument();
  });

  it("opens the modal and Cancel makes no patch", async () => {
    const user = userEvent.setup(); const input = props();
    renderInput(input);
    await user.click(screen.getByRole("button", { name: "Add contributors" }));
    expect(screen.getByRole("dialog", { name: "Add contributors" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm selection" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(input.onChange).not.toHaveBeenCalled();
  });

  it("uses text rows without avatar or unsafe default actions", () => {
    renderInput(props([{ _key: "one", _type: "reference", _ref: "person" }]));
    expect(screen.queryByText(/copy|duplicate|replace|add item before|add item after/i)).not.toBeInTheDocument();
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });
});
