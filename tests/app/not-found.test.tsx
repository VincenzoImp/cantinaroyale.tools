import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NotFound from "@/app/not-found";

vi.mock("@/components/navbar", () => ({
  default: () => <nav aria-label="Site">Navigation</nav>,
}));

vi.mock("@/components/footer", () => ({
  default: () => <footer>Footer</footer>,
}));

describe("NotFound", () => {
  it("keeps the public navigation and footer on missing pages", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("navigation", { name: "Site" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "We could not find that page" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
