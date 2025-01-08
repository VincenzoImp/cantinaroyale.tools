// src/lib/data.ts - Centralized data loading and exports

// Static imports to avoid webpack issues
import appInfo from "../../public/data/info.json";
import charactersInfoData from "../../public/data/characters_info.json";
import weaponsInfoData from "../../public/data/weapons_info.json";
import charactersUpgradeData from "../../public/data/characters_upgrade.json";
import weaponsUpgradeData from "../../public/data/weapons_upgrade.json";

// Import types for better type safety
import { CollectionInfo, CollectionData, AppData } from '@/types';

function loadCollectionData(): AppData {
    const allCollections = [
        ...appInfo.variables.collections.characters,
        ...appInfo.variables.collections.weapons
    ];

    const data: AppData = {};

    for (const collection of allCollections) {
        try {
            // Use try-catch with require for better error handling
            const info = require(`../../public/data/${collection}/info.json`);
            const nfts = require(`../../public/data/${collection}/nfts.json`);

            data[collection] = {
                info,
                nfts,
            };
        } catch (error) {
            console.error(`Failed to load collection ${collection}:`, error);
            // Provide fallback data instead of crashing
            data[collection] = {
                info: {
                    collection,
                    name: collection,
                    ticker: collection,
                    holderCount: 0,
                    nftCount: 0,
                    assets: {
                        website: "",
                        description: ""
                    }
                },
                nfts: {}
            };
        }
    }

    return data;
}

function loadIdentifiers(): Record<string, string[]> {
    try {
        const data = loadCollectionData();
        const identifiers: Record<string, string[]> = {};

        for (const [collection, collectionData] of Object.entries(data)) {
            identifiers[collection] = Object.keys(collectionData.nfts);
        }

        return identifiers;
    } catch (error) {
        console.error("Failed to load identifiers:", error);
        return {};
    }
}

// Export configuration and contents
export const contents = appInfo.contents.en;
export const variables = appInfo.variables;

// Export data with proper error handling
export const data = loadCollectionData();
export const identifiers = loadIdentifiers();

// Export game data using static imports
export const characters_info = charactersInfoData;
export const weapons_info = weaponsInfoData;
export const characters_upgrade = charactersUpgradeData;
export const weapons_upgrade = weaponsUpgradeData;
