import CollectionTable from './collectionTable';
import CollectionTitle from './collectionTitle';

export default function WeaponCollection({ collectionName, collectionData }: { collectionName: string, collectionData: { [key: string]: any } }) {
    return (
        <section className="items-center justify-center min-h-screen w-full mx-auto max-w-screen-xl m-12">
            <CollectionTitle collectionName={collectionName} collectionData={collectionData} />
            <CollectionTable collectionData={collectionData} type="weapons"/>
        </section>
    )
}