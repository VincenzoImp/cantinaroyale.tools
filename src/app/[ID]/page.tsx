import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { contents } from "@/app/layout";
import { variables } from "@/app/layout";

export const generateMetadata = ({ params }: { params: { ID: string } }): Metadata => {
    const homeTitle = contents.pages.home.title;
    const collections = [...variables.collections.characters, ...variables.collections.weapons, variables.collections.all_characters, variables.collections.all_weapons];
    const nftIDs: string[] = [];
    if (!collections.includes(params.ID) && !nftIDs.includes(params.ID)) {
        return {
            title: `404 - ${homeTitle}`,
        };
    }
    return {
        title: `${params.ID} - ${homeTitle}`,
    };
};

export default function Page( {params} : {params: {ID: string}} ) {
    // check if the ID is contained in the list of valid IDs
    const collections = [...variables.collections.characters, ...variables.collections.weapons, variables.collections.all_characters, variables.collections.all_weapons];
    const nftIDs: string[] = [];
    if (!collections.includes(params.ID) && !nftIDs.includes(params.ID)) {
        return notFound();
    }
    return (
        <>
          {Navbar()}
          <section className="items-center justify-center min-h-screen w-full mx-auto max-w-screen-xl m-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4 dark:text-gray-400">{params.ID}</h1>
                <p className="text-lg mb-8 dark:text-gray-400">{params.ID}</p>
            </div>
          </section>
          {Footer()}
        </>
    );
};