import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { contents } from "@/app/layout";

const home = contents.pages.home;

export const metadata: Metadata = {
  title: `${home.title}`
};

export default function Home() {

  return (
    <>
      <Navbar activeItemID="home" />
      <section className="items-center justify-center min-h-screen w-full mx-auto max-w-screen-xl m-12">
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 dark:text-white">{home.heroTitle}</h1>
            <p className="text-lg mb-8 dark:text-white">{home.heroDescription}</p>
        </div>
      </section>
      
      <Footer />
    </>
  );
};