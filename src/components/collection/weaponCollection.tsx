import CollectionTable from './collectionTable';
import CollectionTitle from './collectionTitle';
import { contents, variables } from "@/app/layout";

export default function WeaponCollection({ collectionName, collectionData }: { collectionName: string, collectionData: { [key: string]: any } }) {
    var tableColumns: { uid: string, name: string, sortable: boolean }[] = [];
    for (const [key, value] of Object.entries(contents.components.collectionTable.weapons.columns)) {
        tableColumns.push({ uid: key, name: value, sortable: variables.tabelEntries.weapons.sortable.includes(key) });
    }
    var tableEntries: any[] = [];
    for (const collection of Object.values(collectionData)) {
        tableEntries = tableEntries.concat(Object.values(collection.nfts));
    }
    return (
        <section className="items-center justify-center min-h-screen w-full mx-auto max-w-screen-xl m-12">
            <CollectionTitle collectionName={collectionName} collectionData={collectionData} />
            <CollectionTable tableColumns={tableColumns} tableEntries={tableEntries} type="weapons" />
        </section>
    )
}