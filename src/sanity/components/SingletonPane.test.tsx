import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { studioTheme, ThemeProvider } from "@sanity/ui";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetch = vi.fn();
const action = vi.fn();
const navigateIntent = vi.fn();
const client = {
  fetch,
  action,
  withConfig: () => client,
  config: () => ({ projectId: "test-project", dataset: "test-dataset" }),
};

vi.mock("sanity", async (importOriginal) => {
  const actual = await importOriginal<typeof import("sanity")>();
  return { ...actual, useClient: () => client };
});

vi.mock("sanity/router", () => ({
  IntentLink: ({ children, text }: { children?: React.ReactNode; text?: string }) => <a href="#editor">{children ?? text}</a>,
  useRouter: () => ({ navigateIntent }),
}));

import { exactCurrentPageVersions } from "../pageExistence";
import { SingletonPane } from "./SingletonPane";

const options = {
  documentId: "siteSettings",
  schemaType: "siteSettings",
  title: "Publication Settings",
  initialValue: {},
};

function renderPane() {
  return render(<ThemeProvider theme={studioTheme}><SingletonPane options={options} /></ThemeProvider>);
}

describe("singleton recovery pane", () => {
  beforeEach(() => {
    fetch.mockReset();
    action.mockReset();
    navigateIntent.mockReset();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });

  it("accepts only exact current IDs and the expected schema type", () => {
    expect(exactCurrentPageVersions([
      { _id: "siteSettings", _type: "siteSettings" },
      { _id: "drafts.siteSettings", _type: "siteSettings" },
      { _id: "about", _type: "staticPage" },
      { _id: "versions.siteSettings", _type: "siteSettings" },
      {}, null,
    ], "siteSettings", "siteSettings")).toEqual([
      { _id: "siteSettings", _type: "siteSettings" },
      { _id: "drafts.siteSettings", _type: "siteSettings" },
    ]);
    expect(exactCurrentPageVersions({}, "siteSettings", "siteSettings")).toEqual([]);
  });

  it("opens an existing singleton without offering initialization", async () => {
    fetch.mockResolvedValue([{ _id: "siteSettings", _type: "siteSettings" }]);
    renderPane();
    expect(await screen.findByRole("link", { name: "Open Publication Settings" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create clean Publication Settings draft" })).not.toBeInTheDocument();
  });

  it("does not mutate a no-current-version state until clean initialization is confirmed", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce([]).mockResolvedValueOnce([{ _id: "drafts.siteSettings", _type: "siteSettings" }]);
    action.mockResolvedValue({ transactionId: "test-transaction" });
    renderPane();
    expect(await screen.findByText("No current draft or published version exists.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open revision history" })).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Create clean Publication Settings draft" }));
    expect(action).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Create clean draft" }));
    await waitFor(() => expect(action).toHaveBeenCalledWith({
      actionType: "sanity.action.document.create",
      publishedId: "siteSettings",
      attributes: {
        _id: "drafts.siteSettings",
        _type: "siteSettings",
      },
      ifExists: "fail",
    }, { tag: "singleton-initialize" }));
    expect(navigateIntent).toHaveBeenCalledWith("edit", { id: "siteSettings", type: "siteSettings" });
  });

  it("does not claim success when the action result is absent from the authoritative raw query", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValue([]);
    action.mockResolvedValue({ transactionId: "test-transaction" });
    renderPane();
    await screen.findByText("No current draft or published version exists.");
    await user.click(screen.getByRole("button", { name: "Create clean Publication Settings draft" }));
    await user.click(screen.getByRole("button", { name: "Create clean draft" }));
    expect(await screen.findByText(/document-create action failed/i)).toBeInTheDocument();
    expect(navigateIntent).not.toHaveBeenCalled();
  });

});
