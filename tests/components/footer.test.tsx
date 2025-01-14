import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Footer from "@/components/footer";

vi.mock("@/features/theme/theme-toggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

describe("Footer", () => {
  it("keeps game data out of the footer navigation", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    const navigation = within(footer).getByRole("navigation", {
      name: "Footer",
    });

    expect(
      within(navigation).queryByRole("link", { name: "Game Data" }),
    ).not.toBeInTheDocument();
    expect(
      within(navigation).getByRole("link", { name: "Cantina Royale" }),
    ).toBeInTheDocument();
  });
});
