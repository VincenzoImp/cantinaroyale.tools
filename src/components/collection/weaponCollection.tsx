import CollectionTable from './collectionTable';
import CollectionTitle from './collectionTitle';
import { contents, variables } from "@/lib/data";

export default function WeaponCollection({ collectionName, collectionData }: { collectionName: string, collectionData: { [key: string]: any } }) {
    var tableColumns: { uid: string, name: string, searchable: boolean, sortable: boolean, filterable: boolean, rangeable: boolean }[] = [];
    for (const [key, value] of Object.entries(contents.components.collectionTable.weapons.columns)) {
        tableColumns.push({
            uid: key,
            name: value,
            searchable: variables.tabelEntries.weapons.searchable.includes(key),
            sortable: variables.tabelEntries.weapons.sortable.includes(key),
            filterable: variables.tabelEntries.weapons.filterable.includes(key),
            rangeable: variables.tabelEntries.weapons.rangeble.includes(key)
        });
    }
    var tableEntries: any[] = [];
    for (const collection of Object.values(collectionData)) {
        if (collection && collection.nfts) {
            tableEntries = tableEntries.concat(Object.values(collection.nfts));
        }
    }
    return (
        <section className="items-center justify-center min-h-screen w-full mx-auto max-w-screen-xl m-4 sm:m-8 lg:m-12">
            <CollectionTitle collectionName={collectionName} collectionData={collectionData} />
            <CollectionTable tableColumns={tableColumns} tableEntries={tableEntries} type="weapons" />
        </section>
    )
}