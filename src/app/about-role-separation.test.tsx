import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AboutPage from "./about/page";
import AuthorsPage from "./authors/page";

const contributors = [{ slug: "maya-chen", name: "Maya Chen", grade: "Class of 2027" }];

vi.mock("@/content", () => ({
  getContributors: vi.fn(async () => contributors),
  getStaticPageBySlug: vi.fn(async () => ({
    slug: "about", title: "About", body: [{ type: "paragraph", text: "Mission." }],
    staff: { editorsInChief: [{ contributorSlug: "maya-chen" }], editors: [], facultyAdviser: [] },
  })),
}));

describe("About leadership separation", () => {
  it("renders Editor-in-Chief as About context without adding it to the Contributor directory", async () => {
    const about = render(await AboutPage());
    expect(screen.getByRole("heading", { name: "Editor-in-Chief" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Maya Chen" })).toBeInTheDocument();
    about.unmount();

    render(await AuthorsPage());
    expect(screen.getByText("Class of 2027")).toBeInTheDocument();
    expect(screen.queryByText("Editor-in-Chief")).not.toBeInTheDocument();
  });
});
