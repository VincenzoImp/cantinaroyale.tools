import { contents, variables } from "@/app/layout";

export default function CollectionTitle({ collectionName, collectionData }: { collectionName: string, collectionData: { [key: string]: any } }) {
    var collections = [...variables.collections.characters, ...variables.collections.weapons];
    var titleText;
    var subtitle = null;
    if (collections.includes(collectionName)) {
        titleText = collectionData[collectionName].info.name;
        var explorerUrl = `https://explorer.multiversx.com/collections/${collectionName}`;
        subtitle = (
            <span>
                <a href={explorerUrl} className="underline hover:text-blue-500 dark:hover:text-blue-500">
                    {collectionName}
                </a>
            </span>
        );
    } else if (collectionName === variables.collections.allCharacters) {
        titleText = contents.pages.characterCollection.allCharacters;
        collections = variables.collections.characters;
    } else if (collectionName === variables.collections.allWeapons) {
        titleText = contents.pages.weaponCollection.allWeapons;
        collections = variables.collections.weapons;
    }
    if (subtitle === null) {
        subtitle = collections.map((collection) => {
            return (
                <span key={collection} className="mx-2 justify-center">
                    <a href={`/collection/${collection}`} className="underline hover:text-blue-500 dark:hover:text-blue-500">
                        {collection}
                    </a>
                </span>
            );
        });
    }
    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 dark:text-gray-400">{titleText}</h1>
            <div className="text-lg mb-4 dark:text-gray-400">
                {subtitle}
            </div>
        </div>
    );

}