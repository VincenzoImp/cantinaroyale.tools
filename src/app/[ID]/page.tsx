import { notFound } from "next/navigation";

export default function Page( {params} : {params: {ID: string}} ) {
    // check if the ID is contained in the list of valid IDs
    const validIDs = ["1", "2", "3"];
    if (!validIDs.includes(params.ID)) {
        return <h1>Invalid ID</h1>;
    }
    return notFound();
}