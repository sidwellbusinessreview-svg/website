import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "./error";
import Loading from "./loading";

describe("route resilience states", () => {
  afterEach(() => vi.restoreAllMocks());

  it("announces loading without exposing implementation details", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toHaveTextContent("Preparing the latest published content");
  });

  it("shows a safe public error and retries through the boundary", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const reset = vi.fn();
    render(<ErrorPage error={Object.assign(new Error("private provider detail"), { digest: "abc123" })} reset={reset} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Something interrupted the Review");
    expect(alert).not.toHaveTextContent("private provider detail");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
