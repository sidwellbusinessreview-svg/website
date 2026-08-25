import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AboutPage from "./about/page";
import AuthorsPage from "./authors/page";

const contributors = [{ slug: "maya-chen", name: "Maya Chen", grade: "Class of 2027" }, { slug: "julia-pitt", name: "Julia Pitt", grade: "Class of 2027" }];
const managedPage = {
  slug: "about", title: "About", body: [{ type: "paragraph" as const, text: "Mission." }],
  staff: { editorsInChief: [{ contributorSlug: "maya-chen" }], editors: [], facultyAdviser: [] },
};

vi.mock("@/content", () => ({
  getContributors: vi.fn(async () => contributors),
  getStaticPageBySlug: vi.fn(async () => managedPage),
}));

describe("About leadership separation", () => {
  it("renders Editor-in-Chief as About context without adding it to the Contributor directory", async () => {
    const about = render(await AboutPage());
    expect(screen.getByRole("heading", { name: "Editor-in-Chief" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Maya Chen" })).toBeInTheDocument();
    about.unmount();

    render(await AuthorsPage());
    expect(screen.getAllByText("Class of 2027")).toHaveLength(2);
    expect(screen.queryByText("Editor-in-Chief")).not.toBeInTheDocument();
  });
  it("uses the plural heading and preserves configured order for multiple Editors-in-Chief", async () => {
    managedPage.staff.editorsInChief = [{ contributorSlug: "julia-pitt" }, { contributorSlug: "maya-chen" }];
    render(await AboutPage());
    expect(screen.getByRole("heading", { name: "Editors-in-Chief" })).toBeInTheDocument();
    expect(screen.getAllByRole("link").filter((link) => ["Julia Pitt", "Maya Chen"].includes(link.textContent ?? "")).map((link) => link.textContent)).toEqual(["Julia Pitt", "Maya Chen"]);
    managedPage.staff.editorsInChief = [{ contributorSlug: "maya-chen" }];
  });
});
