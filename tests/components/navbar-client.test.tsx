import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavbarClient } from "@/components/navbar-client";
import type { CollectionGroups } from "@/server/data/repository";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/features/theme/theme-toggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

const groups: CollectionGroups = {
  characters: [
    {
      id: "CHAR-123456",
      name: "Genesis Characters",
      type: "characters",
      nftCount: 1200,
      holderCount: 300,
      description: null,
      iconUrl: null,
    },
  ],
  weapons: [
    {
      id: "WEAPON-123456",
      name: "Genesis Weapons",
      type: "weapons",
      nftCount: 600,
      holderCount: 180,
      description: null,
      iconUrl: null,
    },
  ],
  allCharacters: {
    id: "All-Characters",
    name: "All Characters",
    type: "characters",
    nftCount: 1200,
    holderCount: 300,
    description: null,
    iconUrl: null,
  },
  allWeapons: {
    id: "All-Weapons",
    name: "All Weapons",
    type: "weapons",
    nftCount: 600,
    holderCount: 180,
    description: null,
    iconUrl: null,
  },
};

describe("NavbarClient", () => {
  const expectBefore = (first: HTMLElement, second: HTMLElement) => {
    expect(
      first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  };

  it("keeps only one desktop collection dropdown open", () => {
    render(<NavbarClient activeItemID="home" groups={groups} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open Characters menu" }),
    );
    expect(
      screen.getByRole("menu", { name: "Characters collections" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open Weapons menu" }));

    expect(
      screen.queryByRole("menu", { name: "Characters collections" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("menu", { name: "Weapons collections" }),
    ).toBeInTheDocument();
  });

  it("uses a structured mobile panel instead of a long flat link list", () => {
    render(<NavbarClient activeItemID="home" groups={groups} />);

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(
      screen.getByRole("dialog", { name: "Site navigation" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Show character collections" }),
    );

    expect(screen.getByText("Genesis Characters")).toBeInTheDocument();
    expect(screen.getAllByText("1,200").length).toBeGreaterThan(0);
  });

  it("keeps the hamburger navigation in the same order as the desktop navigation", () => {
    render(<NavbarClient activeItemID="home" groups={groups} />);

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));

    const dialog = screen.getByRole("dialog", { name: "Site navigation" });
    const home = within(dialog).getByRole("link", { name: "Home" });
    const characters = within(dialog).getByRole("button", {
      name: "Show character collections",
    });
    const weapons = within(dialog).getByRole("button", {
      name: "Show weapon collections",
    });
    const gameData = within(dialog).getByRole("button", {
      name: "Show game data views",
    });

    expectBefore(home, characters);
    expectBefore(characters, weapons);
    expectBefore(weapons, gameData);
  });

  it("leaves the theme switch out of the navbar", () => {
    render(<NavbarClient activeItemID="home" groups={groups} />);

    expect(
      screen.queryByRole("button", { name: "Theme" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));

    expect(
      screen.queryByRole("button", { name: "Theme" }),
    ).not.toBeInTheDocument();
  });

  it("opens game data as a dropdown without a direct root link or icon", () => {
    const { container } = render(
      <NavbarClient activeItemID="game-data" groups={groups} />,
    );

    expect(
      screen.queryByRole("link", { name: "Game Data" }),
    ).not.toBeInTheDocument();
    expect(container.querySelector(".lucide-database")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Open Game Data menu" }),
    );

    const menu = screen.getByRole("menu", { name: "Game data views" });
    expect(
      within(menu).getByRole("menuitem", { name: "Characters" }),
    ).toHaveAttribute("href", "/game-data/characters");
    expect(
      within(menu).getByRole("menuitem", { name: "Weapons" }),
    ).toHaveAttribute("href", "/game-data/weapons");
    expect(
      within(menu).getByRole("menuitem", { name: "Economy" }),
    ).toHaveAttribute("href", "/game-data/economy");

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));

    expect(
      screen.queryByRole("link", { name: "Game Data" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show game data views" }),
    ).toBeInTheDocument();
  });
});
