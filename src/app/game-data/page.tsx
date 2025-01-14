import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Game Data",
  description:
    "Curated Cantina Royale gameplay views for NFT progression, weapon balance, upgrade costs, and rewards.",
};

export default function Page() {
  redirect("/game-data/characters");
}
