import NftTitle from "@/components/nftTitle";
import NftCard from "@/components/nftCard";

export default function CharacterNft({ nft }: { [key: string]: any }) {
    return (
        <section className="items-center justify-center min-h-screen w-full mx-auto max-w-screen-xl m-12">
            <NftTitle nft={nft} />
            <NftCard nft={nft} type="character" />
        </section>
    );
}