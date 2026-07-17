import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudioSetup } from "@/sanity/studio-setup";

describe("Studio setup state", () => {
  it("gives a safe, clear message when Sanity variables are absent", () => {
    render(<StudioSetup />);

    expect(
      screen.getByRole("heading", { name: "Connect Sanity to open the editorial Studio." }),
    ).toBeInTheDocument();
    expect(screen.getByText(/safe local-content mode/i)).toBeInTheDocument();
  });
});
