import { describe, expect, it } from "vitest";
import { normalizedPublicationMonth, parsePublicationMonth, PUBLICATION_MONTHS } from "./PublicationMonthInput";

describe("PublicationMonthInput helpers", () => {
  it("loads an existing canonical value as friendly controls", () => expect(parsePublicationMonth("2025-03")).toEqual({ month: "03", year: "2025" }));
  it("supports January and December", () => { expect(normalizedPublicationMonth("01", "2026")).toBe("2026-01"); expect(normalizedPublicationMonth("12", "2026")).toBe("2026-12"); });
  it("cannot produce invalid months, years, or a day", () => { expect(normalizedPublicationMonth("13", "2026")).toBeUndefined(); expect(normalizedPublicationMonth("03", "26")).toBeUndefined(); expect(normalizedPublicationMonth("03", "2026-01")).toBeUndefined(); });
  it("offers every named month in calendar order", () => expect(PUBLICATION_MONTHS).toHaveLength(12));
});
