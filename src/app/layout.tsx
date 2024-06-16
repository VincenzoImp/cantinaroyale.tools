import { Inter } from "next/font/google";
import "./globals.css";
import info from "../../public/data/info.json";

const inter = Inter({ subsets: ["latin"] });

export const contents = info.contents.en;
export const variables = info.variables;
// for contents and variables open file src/data/{ID}.json and store the contents in nfts
var nfts: { [key: string]: any } = {};
for (const collection of variables.collections.characters) {
  nfts[collection] = require(`../../public/data/${collection}_nfts.csv`);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="{inter.className} dark:bg-gray-900 bg-gray-100">
        {children}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
      </body>
    </html>
  );
}
