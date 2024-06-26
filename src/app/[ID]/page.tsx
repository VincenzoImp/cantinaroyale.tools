import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { contents, variables, data } from "@/app/layout";
import CharacterCollection from "@/components/character_collection";
import WeaponCollection from "@/components/weapon_collection";
import CharacterNft from "@/components/character_nft";
import WeaponNft from "@/components/weapon_nft";

export const generateMetadata = ({ params }: { params: { ID: string } }): Metadata => {
    const homeTitle = contents.pages.home.title;
    const collections = [...variables.collections.characters, ...variables.collections.weapons, variables.collections.all_characters, variables.collections.all_weapons];
    if (collections.includes(params.ID)) {
        return { title: `${params.ID} - ${homeTitle}` };
    }
    for (const collection in data) {
        if (params.ID.startsWith(collection) && params.ID in data[collection].nfts) {
            return { title: `${params.ID} - ${homeTitle}` };
        }
    }
    return { title: `404 - ${homeTitle}` };
};

export default function Page({ params }: { params: { ID: string } }) {
    // check if the ID is contained in the list of valid IDs
    const character_collections = [...variables.collections.characters, variables.collections.all_characters];
    const weapon_collections = [...variables.collections.weapons, variables.collections.all_weapons];
    const collections = [...character_collections, ...weapon_collections];
    var body = null;
    if (collections.includes(params.ID)) {
        if (params.ID in character_collections) {
            body = <CharacterCollection collection={data[params.ID]} />
        }
        if (params.ID in weapon_collections) {
            body = <WeaponCollection collection={data[params.ID]} />
        }
        return (
            <>
                <Navbar />
                {body}
                <Footer />
            </>
        );
    }
    for (const collection in data) {
        if (params.ID.startsWith(collection) && params.ID in data[collection].nfts) {
            if (collection in character_collections) {
                body = <CharacterNft nft={data[collection].nfts[params.ID]} />
            }
            if (collection in weapon_collections) {
                body = <WeaponNft nft={data[collection].nfts[params.ID]} />
            }
            return (
                <>
                    <Navbar />
                    {body}
                    <Footer />
                </>
            );
        }
    }
    return notFound();
};