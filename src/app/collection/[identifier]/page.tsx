import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contents, variables, data } from "@/app/layout";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CharacterCollection from "@/components/characterCollection";
import WeaponCollection from "@/components/weaponCollection";

export const generateMetadata = ({ params }: { params: { identifier: string } }): Metadata => {
    const homeTitle = contents.pages.home.title;
    const collections = [...variables.collections.characters, ...variables.collections.weapons, variables.collections.allCharacters, variables.collections.allWeapons];
    if (collections.includes(params.identifier)) {
        return { title: `${params.identifier} - ${homeTitle}` };
    }
    return { title: `404 - ${homeTitle}` };
};

export default function CollectionPage({ params }: { params: { identifier: string } }) {
    const characterCollections = [...variables.collections.characters, variables.collections.allCharacters];
    const weaponCollections = [...variables.collections.weapons, variables.collections.allWeapons];
    const collections = [...characterCollections, ...weaponCollections];
    if (collections.includes(params.identifier)) {
        const collectionName = params.identifier;
        var collectionData: { [key: string]: any } = {};
        if (characterCollections.includes(collectionName)) {
            if (collectionName === variables.collections.allCharacters) {
                for (const characterCollection in variables.collections.characters) {
                    collectionData[characterCollection] = data[characterCollection];
                }
            }
            else {
                collectionData[collectionName] = data[collectionName];
            }
            return (
                <>
                    <Navbar activeItemID="characters" />
                    <CharacterCollection collectionName={collectionName} collectionData={collectionData} />
                    <Footer />
                </>
            );
        }
        if (weaponCollections.includes(collectionName)) {
            if (collectionName === variables.collections.allWeapons) {
                for (const weaponCollection in variables.collections.weapons) {
                    collectionData[weaponCollection] = data[weaponCollection];
                }
            }
            else {
                collectionData[collectionName] = data[collectionName];
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
    return notFound();
}