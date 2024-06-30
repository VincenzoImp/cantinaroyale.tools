import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contents, variables, data } from "@/app/layout";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CharacterNft from "@/components/characterNft";
import WeaponNft from "@/components/weaponNft";

export const generateMetadata = ({ params }: { params: { identifier: string } }): Metadata => {
    const homeTitle = contents.pages.home.title;
    for (const collectionName in data) {
        if (params.identifier.startsWith(collectionName) && params.identifier in data[collectionName].nfts) {
            return { title: `${params.identifier} - ${homeTitle}` };
        }
    }
    return { title: `404 - ${homeTitle}` };
};

export default function Page({ params }: { params: { identifier: string } }) {
    for (const collectionName in data) {
        if (params.identifier.startsWith(collectionName) && params.identifier in data[collectionName].nfts) {
            const nft: {[key: string]: any} = data[collectionName].nfts[params.identifier];
            if (variables.collections.characters.includes(collectionName)) {
                return (
                    <>
                        <Navbar activeItemID="characters" />
                        <CharacterNft nft={nft} />
                        <Footer />
                    </>
                );
            }
            if (variables.collections.weapons.includes(collectionName)) {
                return (
                    <>
                        <Navbar activeItemID="weapons" />
                        <WeaponNft nft={nft} />
                        <Footer />
                    </>
                );
            }
        }
    }
    return notFound();
}