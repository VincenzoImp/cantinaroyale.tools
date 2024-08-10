"use client";

import React from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Chip,
    User,
    Pagination,
    Selection,
    ChipProps,
    SortDescriptor
} from "@nextui-org/react";
import {PlusIcon} from "../icon/plusIcon";
import {VerticalDotsIcon} from "../icon/verticalDotsIcon";
import {ChevronDownIcon} from "../icon/chevronDownIcon";
import {SearchIcon} from "../icon/searchIcon";
import { list } from "postcss";

export default function CollectionTable({ tableColumns, tableEntries, type }: { tableColumns: { uid: string, name: string, sortable: boolean }[], tableEntries: any[], type: string }) {
    
    function capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }      

    type Nft = typeof tableEntries[0];

    const INITIAL_ROWS_PER_PAGE = 10;
    const INITIAL_PAGE = 1;
    const INITIAL_VISIBLE_COLUMNS = tableColumns.map((column) => column.uid);

    const [visibleColumns, setVisibleColumns] = React.useState<string[]>(INITIAL_VISIBLE_COLUMNS);
    const [rowsPerPage, setRowsPerPage] = React.useState(INITIAL_ROWS_PER_PAGE);
    const [page, setPage] = React.useState(INITIAL_PAGE);

    const entriesUseStates: {
        [key: string]: { column: any; value: any; setValue: React.Dispatch<React.SetStateAction<any>>; }[];
    } = {
        searchable: Object.values(tableColumns).filter((column: any) => column.searchable).map((column: any) => {
            const [value, setValue] = React.useState("");
            return { column: column.uid, value: value, setValue: setValue };
        }),
        sortable: Object.values(tableColumns).filter((column: any) => column.sortable).map((column: any) => {
            const [value, setValue] = React.useState<string>("");
            return { column: column.uid, value: value, setValue: setValue };
        }),
        filterable: Object.values(tableColumns).filter((column: any) => column.filterable).map((column: any) => {
            const [value, setValue] = React.useState<string[]>([]);
            return { column: column.uid, value: value, setValue: setValue };
        }),
        rangeble: Object.values(tableColumns).filter((column: any) => column.rangeble).map((column: any) => {
            const [value, setValue] = React.useState<{ min: string, max: string }>({ min: "", max: "" });
            return { column: column.uid, value: value, setValue: setValue };
        }),
    };

    const selectedColumns = React.useMemo(() => {
        return tableColumns.filter((column) => visibleColumns.includes(column.uid));
    }, [visibleColumns]);

    const selectedEntries = React.useMemo(() => {
        let filteredEntries = [...tableEntries];
        for (const column of Object.values(entriesUseStates.searchable)) {
            if (column.value !== "" && visibleColumns.includes(column.column)) {
                filteredEntries = filteredEntries.filter((entry) => entry[column.column].toLowerCase().includes(column.value.toLowerCase()));
            }
        }
        for (const column of Object.values(entriesUseStates.filterable)) {
            if (column.value.length !== 0 && visibleColumns.includes(column.column)) {
                filteredEntries = filteredEntries.filter((entry) => column.value.includes(entry[column.column]));
            }
        }
        for (const column of Object.values(entriesUseStates.rangeble)) {
            if (column.value.min !== "" && column.value.max !== "" && visibleColumns.includes(column.column)) {
                filteredEntries = filteredEntries.filter((entry) => entry[column.column] >= column.value.min && entry[column.column] <= column.value.max);
            }
        }
        for (const column of Object.values(entriesUseStates.sortable)) {
            if (['asc', 'desc'].includes(column.value) && visibleColumns.includes(column.column)) {
                filteredEntries = filteredEntries.sort((a: Nft, b: Nft) => {
                    const first = a[column.column] as number;
                    const second = b[column.column] as number;
                    const cmp = first < second ? -1 : first > second ? 1 : 0;
                    return column.value === "desc" ? -cmp : cmp;
                });
            }
        }
        return filteredEntries;
    }, [tableEntries, entriesUseStates, visibleColumns]);
    
    const handleSort = (column: string, value: string) => {
        for (const columnState of Object.values(entriesUseStates.sortable)) {
            if (columnState.column === column) {
                columnState.setValue(value);
            }
        }
    };

    const handleSearch = (column: string, value: string) => {
        for (const columnState of Object.values(entriesUseStates.searchable)) {
            if (columnState.column === column) {
                columnState.setValue(value);
            }
        }
    };

    const handleFilterAdd = (column: string, value: string) => {
        for (const columnState of Object.values(entriesUseStates.filterable)) {
            if (columnState.column === column) {
                columnState.setValue([...columnState.value, value]);
            }
        }
    }

    const handleFilterRemove = (column: string, value: string) => {
        for (const columnState of Object.values(entriesUseStates.filterable)) {
            if (columnState.column === column) {
                columnState.setValue(columnState.value.filter((val: string) => val !== value));
            }
        }
    }

    const handleRange = (column: string, value: { min: string, max: string }) => {
        for (const columnState of Object.values(entriesUseStates.rangeble)) {
            if (columnState.column === column) {
                columnState.setValue(value);
            }
        }
    }

    const handleColumnAdd = (column: string) => {
        setVisibleColumns([...visibleColumns, column]);
    }

    const handleColumnRemove = (column: string) => {
        setVisibleColumns(visibleColumns.filter((col) => col !== column));
    }

    const handlePageChange = (page: number) => {
        setPage(page);
    }

    const handleRowsPerPageChange = (rowsPerPage: number) => {
        setRowsPerPage(rowsPerPage);
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    {selectedColumns.map((column) => {
                        return (
                            <TableColumn key={column.uid}>
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button size="sm" variant="ghost">
                                            {column.name}
                                            <ChevronDownIcon />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu>
                                        <DropdownItem onClick={() => handleSort(column.uid, "asc")}>Ascending</DropdownItem>
                                        <DropdownItem onClick={() => handleSort(column.uid, "desc")}>Descending</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </TableColumn>
                        );
                    })}
                </TableHeader>
                <TableBody>
                    {selectedEntries.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((entry, index) => {
                        return (
                            <TableRow key={index}>
                                {selectedColumns.map((column) => {
                                    return (
                                        <TableCell key={column.uid}>
                                            {entry[column.uid]}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <Pagination
                total={selectedEntries.length}
                page={page}
                onChange={handlePageChange}
            />
        </div>
    );
}