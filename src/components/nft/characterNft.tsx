import NftTitle from "@/components/nft/nftTitle";
import NftCard from "@/components/nft/nftCard";

export default function CharacterNft({ nft }: { [key: string]: any }) {
    return (
        <section className="items-center justify-center min-h-screen w-full mx-auto max-w-screen-xl m-12">
            <NftTitle nft={nft} />
            <NftCard nft={nft} type="character" />
        </section>
    );
}