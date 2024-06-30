import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contents, variables, data } from "@/app/layout";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CharacterCollection from "@/components/characterCollection";
import WeaponCollection from "@/components/weaponCollection";
import CharacterNft from "@/components/characterNft";
import WeaponNft from "@/components/weaponNft";

export const generateMetadata = ({ params }: { params: { ID: string } }): Metadata => {
    const homeTitle = contents.pages.home.title;
    const collections = [...variables.collections.characters, ...variables.collections.weapons, variables.collections.allCharacters, variables.collections.all_weapons];
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
    const character_collections = [...variables.collections.characters, variables.collections.allCharacters];
    const weapon_collections = [...variables.collections.weapons, variables.collections.allWeapons];
    const collections = [...character_collections, ...weapon_collections];
    if (collections.includes(params.ID)) {
        const collectionName = params.ID;
        var collectionData: { [key: string]: any } = {};
        if (character_collections.includes(params.ID)) {
            if (params.ID === variables.collections.allCharacters) {
                for (const character_collection in variables.collections.characters) {
                    collectionData[character_collection] = data[character_collection];
                }
            }
            else {
                collectionData[params.ID] = data[params.ID];
            }
            return (
                <>
                    <Navbar activeItemID="characters" />
                    <CharacterCollection collectionName={collectionName} collectionData={collectionData} />
                    <Footer />
                </>
            );
        }
        if (weapon_collections.includes(params.ID)) {
            if (params.ID === variables.collections.allWeapons) {
                for (const weapon_collection in variables.collections.weapons) {
                    collectionData[weapon_collection] = data[weapon_collection];
                }
            }
            else {
                collectionData[params.ID] = data[params.ID];
            }
            return (
                <>
                    <Navbar activeItemID="weapons" />
                    <WeaponCollection collectionName={collectionName} collectionData={collectionData} />
                    <Footer />
                </>
            );
        }
    }
    for (const collection in data) {
        if (params.ID.startsWith(collection) && params.ID in data[collection].nfts) {
            const nft: {[key: string]: any} = data[collection].nfts[params.ID];
            if (character_collections.includes(collection)) {
                return (
                    <>
                        <Navbar activeItemID="characters" />
                        <CharacterNft nft={nft} />
                        <Footer />
                    </>
                );
            }
            if (weapon_collections.includes(collection)) {
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