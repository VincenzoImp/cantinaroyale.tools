import type { Metadata } from "next";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { CharacterGameplayDashboardPage } from "@/features/game-data/gameplay-dashboard-pages";
import { getCantinaRepository } from "@/server/data";

export const metadata: Metadata = {
  title: "Character Gameplay",
  description:
    "Readable Cantina Royale character gameplay data: profiles, rarities, species, perks, and upgrade costs.",
};

export default function Page() {
  const dashboard = getCantinaRepository().getCharacterGameplayDashboard();

  return (
    <>
      <Navbar activeItemID="game-data" />
      <CharacterGameplayDashboardPage dashboard={dashboard} />
      <Footer />
    </>
  );
}
