// src/types/table.ts
export interface TableColumn {
    uid: string;
    name: string;
    searchable: boolean;
    sortable: boolean;
    filterable: boolean;
    rangeble: boolean;
}

export interface TableEntry {
    [key: string]: any;
    uid?: string;
    identifier?: string;
    name?: string;
    thumbnailUrl?: string;
    url?: string;
    owner?: string;
}

export interface EntriesUseStates {
    searchable: { [key: string]: string };
    sortable: Array<{ column: string; value: "asc" | "desc" }>;
    filterable: { [key: string]: string[] };
    rangeble: { [key: string]: { min: string; max: string } };
}

export interface CollectionTableProps {
    tableColumns: TableColumn[];
    tableEntries: TableEntry[];
    type: "characters" | "weapons" | "collections";
}

export interface TableConfig {
    nftsPerPage: {
        default: number;
        options: number[];
    };
}

export interface TableVariables {
    tableInfo: TableConfig;
    tabelEntries: {
        [key: string]: {
            searchable: string[];
            sortable: string[];
            filterable: string[];
            rangeble: string[];
        };
    };
}