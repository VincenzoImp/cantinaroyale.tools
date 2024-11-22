// src/app/layout.tsx
import "./globals.css";
import { Providers } from "./providers";

// Static imports to avoid webpack issues
import appInfo from "../../public/data/info.json";
import charactersInfoData from "../../public/data/characters_info.json";
import weaponsInfoData from "../../public/data/weapons_info.json";
import charactersUpgradeData from "../../public/data/characters_upgrade.json";
import weaponsUpgradeData from "../../public/data/weapons_upgrade.json";

// Types for better type safety
interface CollectionInfo {
	collection: string;
	name: string;
	ticker: string;
	holderCount: number;
	nftCount: number;
	assets: {
		website: string;
		description: string;
	};
}

interface CollectionData {
	info: CollectionInfo;
	nfts: Record<string, any>;
}

interface AppData {
	[collectionName: string]: CollectionData;
}

function loadCollectionData(): AppData {
	const allCollections = [
		...appInfo.variables.collections.characters,
		...appInfo.variables.collections.weapons
	];

	const data: AppData = {};

	for (const collection of allCollections) {
		try {
			data[collection] = {
				info: require(`../../public/data/${collection}/info.json`),
				nfts: require(`../../public/data/${collection}/nfts.json`),
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

// Root layout component
export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								try {
									var theme = localStorage.getItem('theme');
									if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
										document.documentElement.classList.add('dark');
									}
								} catch (e) {}
							})();
						`,
					}}
				/>
			</head>
			<body className="bg-theme-background text-theme-text antialiased theme-transition">
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	);
}