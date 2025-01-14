import type { Metadata } from "next";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { EconomyGameplayDashboardPage } from "@/features/game-data/gameplay-dashboard-pages";
import { getCantinaRepository } from "@/server/data";

export const metadata: Metadata = {
  title: "Upgrade Economy",
  description:
    "Readable Cantina Royale economy data for NFT upgrade costs, weapon fuse costs, currencies, and linked rewards.",
};

export default function Page() {
  const dashboard = getCantinaRepository().getEconomyGameplayDashboard();

  return (
    <>
      <Navbar activeItemID="game-data" />
      <EconomyGameplayDashboardPage dashboard={dashboard} />
      <Footer />
    </>
  );
}
