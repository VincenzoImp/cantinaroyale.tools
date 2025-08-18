import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contents, variables, data } from "@/app/layout";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CharacterCollection from "@/components/collection/characterCollection";
import WeaponCollection from "@/components/collection/weaponCollection";

type CollectionType = 'characters' | 'weapons';

interface CollectionConfig {
    collections: string[];
    allCollection: string;
    component: typeof CharacterCollection | typeof WeaponCollection;
    navId: string;
}

export const generateMetadata = ({ params }: { params: { identifier: string } }): Metadata => {
    const homeTitle = contents.pages.home.title;
    const allCollections = [
        ...variables.collections.characters,
        ...variables.collections.weapons,
        variables.collections.allCharacters,
        variables.collections.allWeapons
    ];

    if (allCollections.includes(params.identifier)) {
        return { title: `${params.identifier} - ${homeTitle}` };
    }
    return { title: `404 - ${homeTitle}` };
};

function getCollectionType(identifier: string): CollectionType | null {
    const characterCollections = [...variables.collections.characters, variables.collections.allCharacters];
    const weaponCollections = [...variables.collections.weapons, variables.collections.allWeapons];

    if (characterCollections.includes(identifier)) return 'characters';
    if (weaponCollections.includes(identifier)) return 'weapons';
    return null;
}

function buildCollectionData(collectionName: string, type: CollectionType): Record<string, any> {
    const config: Record<CollectionType, CollectionConfig> = {
        characters: {
            collections: variables.collections.characters,
            allCollection: variables.collections.allCharacters,
            component: CharacterCollection,
            navId: 'characters'
        },
        weapons: {
            collections: variables.collections.weapons,
            allCollection: variables.collections.allWeapons,
            component: WeaponCollection,
            navId: 'weapons'
        }
    };

    const { collections, allCollection } = config[type];
    const collectionData: Record<string, any> = {};

    if (collectionName === allCollection) {
        collections.forEach(collection => {
            collectionData[collection] = data[collection];
        });
    } else {
        collectionData[collectionName] = data[collectionName];
    }

    return collectionData;
}

export default function CollectionPage({ params }: { params: { identifier: string } }) {
    const { identifier } = params;
    const type = getCollectionType(identifier);

    if (!type) {
        return notFound();
    }

    const collectionData = buildCollectionData(identifier, type);

    const config: Record<CollectionType, CollectionConfig> = {
        characters: {
            collections: variables.collections.characters,
            allCollection: variables.collections.allCharacters,
            component: CharacterCollection,
            navId: 'characters'
        },
        weapons: {
            collections: variables.collections.weapons,
            allCollection: variables.collections.allWeapons,
            component: WeaponCollection,
            navId: 'weapons'
        }
    };

    const { component: Component, navId } = config[type];

    return (
        <>
            <Navbar activeItemID={navId} />
            <Component collectionName={identifier} collectionData={collectionData} />
            <Footer />
        </>
    );
}