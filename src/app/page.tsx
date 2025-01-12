import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { HomeDashboard } from "@/features/home/home-dashboard";
import { getCantinaRepository } from "@/server/data";

export default function Home() {
  const repository = getCantinaRepository();
  const stats = repository.getHomeStats();
  const insights = repository.getHomeInsights();

  return (
    <>
      <Navbar activeItemID="home" />
      <HomeDashboard stats={stats} insights={insights} />
      <Footer />
    </>
  );
}
