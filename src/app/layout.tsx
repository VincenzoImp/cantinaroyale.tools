import "./globals.css";
import info from "../../public/data/info.json";
import {Providers} from "./providers";

export const contents = info.contents.en;

export const variables = info.variables;

var nftsData: { [key: string]: any } = {};
for (const collection of variables.collections.characters.concat(variables.collections.weapons)) {
	nftsData[collection] = {
		info: require(`../../public/data/${collection}/info.json`),
		nfts: require(`../../public/data/${collection}/nfts.json`),
	};
}
export const data = nftsData;

var onlyIdentifiers: { [key: string]: string[] } = {};
for (const collection of variables.collections.characters.concat(variables.collections.weapons)) {
	onlyIdentifiers[collection] = Object.keys(nftsData[collection].nfts);
}
export const identifiers = onlyIdentifiers;

var tableUniqueValues: {
	"characters": { [key: string]: { [key: string]: any } },
	"weapons": { [key: string]: { [key: string]: any } }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className="dark:bg-gray-900 bg-gray-100">
			<body className="dark:bg-gray-900 bg-gray-100">
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	);
}