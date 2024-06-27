export default function WeaponNft({ nft }: { [key: string]: any }) {
    return (
        <section className="items-center justify-center min-h-screen w-full mx-auto max-w-screen-xl m-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4 dark:text-gray-400">{nft.identifier}</h1>
                <p className="text-lg mb-8 dark:text-gray-400">{nft.identifier}</p>
            </div>
        </section>
    )
}