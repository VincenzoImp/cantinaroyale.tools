import "./globals.css";
import info from "../../public/data/info.json";

export const contents = info.contents.en;
export const variables = info.variables;
var nftsData: { [key: string]: any } = {};
for (const collection of variables.collections.characters.concat(variables.collections.weapons)) {
  nftsData[collection] = {
    info: require(`../../public/data/${collection}/info.json`),
    nfts: require(`../../public/data/${collection}/nfts_processed.json`),
  };
}
export const data = nftsData;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark:bg-gray-900 bg-gray-100">
        {children}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
      </body>
    </html>
  );
}