import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { NftDetail } from "@/features/nft/nft-detail";
import { getCantinaRepository } from "@/server/data";

type PageProps = {
  params: Promise<{ identifier: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { identifier } = await params;
  const nft = getCantinaRepository().findNft(identifier);

  return {
    title: nft ? nft.name : "NFT not found",
    description: nft ? `${nft.name} (${nft.identifier})` : undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { identifier } = await params;
  const repository = getCantinaRepository();
  const nft = repository.findNft(identifier);

  if (!nft) {
    notFound();
  }

  return (
    <>
      <Navbar activeItemID={nft.type} />
      <NftDetail
        nft={nft}
        gameplay={repository.getNftGameplay(identifier)}
      />
      <Footer />
    </>
  );
}
