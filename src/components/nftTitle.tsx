export default function nftTitle({ nft }: { [key: string]: any }) {
    const explorerUrl = `https://explorer.multiversx.com/nfts/${nft.identifier}`;
    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 dark:text-gray-400">{nft.name}</h1>
            <p className="text-lg mb-4 dark:text-gray-400"><a href={explorerUrl} className="underline hover:text-blue-500 dark:hover:text-blue-500">{nft.identifier}</a></p>
        </div>
    );
}