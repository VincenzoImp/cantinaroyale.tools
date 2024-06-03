import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { contents } from "@/app/layout";

export default function Home() {
  var home = contents.pages.home;
  return (
    <>
      {Navbar()}
      <section className="items-center justify-center min-h-screen w-full mx-auto max-w-screen-xl m-12">
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 dark:text-gray-400">{home.hero_title}</h1>
            <p className="text-lg mb-8 dark:text-gray-400">{home.hero_description}</p>
        </div>
      </section>
      {Footer()}
    </>
  );
}
