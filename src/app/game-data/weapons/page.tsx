import type { Metadata } from "next";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { WeaponGameplayDashboardPage } from "@/features/game-data/gameplay-dashboard-pages";
import { getCantinaRepository } from "@/server/data";

export const metadata: Metadata = {
  title: "Weapon Gameplay",
  description:
    "Readable Cantina Royale weapon gameplay data: star bonuses, base stats, fuse costs, rewards, and level requirements.",
};

export default function Page() {
  const dashboard = getCantinaRepository().getWeaponGameplayDashboard();

  return (
    <>
      <Navbar activeItemID="game-data" />
      <WeaponGameplayDashboardPage dashboard={dashboard} />
      <Footer />
    </>
  );
}
