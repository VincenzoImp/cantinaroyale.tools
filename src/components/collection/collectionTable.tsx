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
    Pagination,
} from "@nextui-org/react";

export default function CollectionTable({ tableColumns, tableEntries, type }: { tableColumns: { rangeble: boolean; filterable: boolean; searchable: boolean; uid: string, name: string, sortable: boolean; }[], tableEntries: { [key: string]: any }[], type: string }) {

    const INITIAL_ROWS_PER_PAGE = 25;
    const INITIAL_PAGE = 1;
    const INITIAL_VISIBLE_COLUMNS = tableColumns.map((column) => column.uid);

    const [visibleColumns, setVisibleColumns] = React.useState<string[]>(INITIAL_VISIBLE_COLUMNS);
    const [rowsPerPage, setRowsPerPage] = React.useState(INITIAL_ROWS_PER_PAGE);
    const [page, setPage] = React.useState(INITIAL_PAGE);

    type EntriesUseStates = {
        searchable: { [key: string]: { value: string; setValue: React.Dispatch<React.SetStateAction<string>> } };
        sortable: { [key: string]: { value: string; setValue: React.Dispatch<React.SetStateAction<string>> } };
        filterable: { [key: string]: { value: string[]; setValue: React.Dispatch<React.SetStateAction<string[]>> } };
        rangeble: { [key: string]: { value: { min: string; max: string }; setValue: React.Dispatch<React.SetStateAction<{ min: string; max: string }>> } };
    };

    function initEntriesUseStates(tableColumns: { rangeble: boolean; filterable: boolean; searchable: boolean; uid: string, name: string, sortable: boolean; }[]): EntriesUseStates {
        var initialStates: EntriesUseStates = {
            searchable: {},
            sortable: {},
            filterable: {},
            rangeble: {}
        };
        for (const column of tableColumns) {
            if (column.searchable) {
                const [value, setValue] = React.useState("");
                initialStates.searchable[column.uid] = { value, setValue };
            }
            if (column.sortable) {
                const [value, setValue] = React.useState<string>("");
                initialStates.sortable[column.uid] = { value, setValue };
            }
            if (column.filterable) {
                const [value, setValue] = React.useState<string[]>([]);
                initialStates.filterable[column.uid] = { value, setValue };
            }
            if (column.rangeble) {
                const [value, setValue] = React.useState<{ min: string, max: string }>({ min: "", max: "" });
                initialStates.rangeble[column.uid] = { value, setValue };
            }
        }
        return initialStates;
    }
    var entriesUseStates = initEntriesUseStates(tableColumns);

    const selectedEntries = React.useMemo(() => {
        let filteredEntries = [...tableEntries];
        for (const column of Object.values(tableColumns)) {
            const searchableState = entriesUseStates.searchable[column.uid];
            const sortableState = entriesUseStates.sortable[column.uid];
            const filterableState = entriesUseStates.filterable[column.uid];
            const rangebleState = entriesUseStates.rangeble[column.uid];
    
            if (column.searchable && searchableState?.value && visibleColumns.includes(column.uid)) {
                filteredEntries = filteredEntries.filter((entry) => entry[column.uid]?.includes(searchableState.value));
            }
            if (column.sortable && sortableState?.value && visibleColumns.includes(column.uid)) {
                const sortOrder = sortableState.value;
                filteredEntries.sort((a, b) => {
                    const aValue = a[column.uid];
                    const bValue = b[column.uid];
                    if (sortOrder === "asc") {
                        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
                    } else if (sortOrder === "desc") {
                        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
                    }
                    return 0;
                });
            }
            if (column.filterable && filterableState?.value.length > 0 && visibleColumns.includes(column.uid)) {
                filteredEntries = filteredEntries.filter((entry) => filterableState.value.includes(entry[column.uid]));
            }
            if (column.rangeble && (rangebleState?.value.min || rangebleState?.value.max) && visibleColumns.includes(column.uid)) {
                filteredEntries = filteredEntries.filter((entry) => {
                    if (rangebleState.value.min && rangebleState.value.max) {
                        return entry[column.uid] >= rangebleState.value.min && entry[column.uid] <= rangebleState.value.max;
                    } else if (rangebleState.value.min) {
                        return entry[column.uid] >= rangebleState.value.min;
                    } else if (rangebleState.value.max) {
                        return entry[column.uid] <= rangebleState.value.max;
                    }
                    return true;
                });
            }
        }
        return filteredEntries;
    }, [tableEntries, tableColumns, visibleColumns, entriesUseStates]);
    

    const handleSearch = (column: { uid: string, searchable: any }, value: string) => {
        if (column.searchable) {
            entriesUseStates.searchable[column.uid].setValue(value);
        }
    };

    const handleSort = (column: string, value: string) => {
        entriesUseStates.sortable[column].setValue(value);
    };

    const handleFilterAdd = (column: string, value: string) => {
        entriesUseStates.filterable[column].setValue([...entriesUseStates.filterable[column].value, value]);
    };

    const handleFilterRemove = (column: string, value: string) => {
        entriesUseStates.filterable[column].setValue(entriesUseStates.filterable[column].value.filter((v) => v !== value));
    };

    const handleRange = (column: string, value: { min: string; max: string }) => {
        entriesUseStates.rangeble[column].setValue(value);
    };

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const handleRowsPerPageChange = (rowsPerPage: number) => {
        setRowsPerPage(rowsPerPage);
    };

    const handleColumnVisibilityAdd = (column: string) => {
        setVisibleColumns([...visibleColumns, column]);
    };

    const handleColumnVisibilityRemove = (column: string) => {
        setVisibleColumns(visibleColumns.filter((c) => c !== column));
    };

    return (
        <div>
            <Table>
                <TableHeader>
                    {tableColumns.filter((column) => visibleColumns.includes(column.uid)).map((column) => (
                        <TableColumn key={column.uid}>
                            {column.name}
                            {column.searchable && (
                                <Input
                                    placeholder="Search"
                                    value={entriesUseStates.searchable[column.uid].value}
                                    onChange={(e) => handleSearch(column, e.target.value)}
                                />
                            )}
                            {column.sortable && (
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button>{entriesUseStates.sortable[column.uid].value === "" ? "Sort" : entriesUseStates.sortable[column.uid].value}</Button>
                                    </DropdownTrigger>
                                    <DropdownMenu>
                                        <DropdownItem onClick={() => handleSort(column.uid, "asc")}>Sort Ascending</DropdownItem>
                                        <DropdownItem onClick={() => handleSort(column.uid, "desc")}>Sort Descending</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            )}
                            {column.filterable && (
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button>Filter</Button>
                                    </DropdownTrigger>
                                    <DropdownMenu>
                                        {tableEntries.map((entry) => entry[column.uid]).filter((value, index, self) => self.indexOf(value) === index).map((value) => (
                                            <DropdownItem key={value}>
                                                <Chip onClick={() => handleFilterAdd(column.uid, value)}>
                                                    {value}
                                                </Chip>
                                            </DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </Dropdown>
                            )}
                            {column.rangeble && (
                                <div>
                                    <Input
                                        placeholder="Min"
                                        value={entriesUseStates.rangeble[column.uid].value.min}
                                        onChange={(e) => handleRange(column.uid, { ...entriesUseStates.rangeble[column.uid].value, min: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Max"
                                        value={entriesUseStates.rangeble[column.uid].value.max}
                                        onChange={(e) => handleRange(column.uid, { ...entriesUseStates.rangeble[column.uid].value, max: e.target.value })}
                                    />
                                </div>
                            )}
                            <Button onClick={() => handleColumnVisibilityRemove(column.uid)}>Hide</Button>
                        </TableColumn>
                    ))}
                </TableHeader>
                <TableBody>
                    {selectedEntries.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((entry) => (
                        <TableRow key={entry.uid}>
                            {visibleColumns.map((column) => (
                                <TableCell key={column}>
                                    {entry[column]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Pagination
                total={Math.ceil(selectedEntries.length / rowsPerPage)}
                page={page}
                onChange={handlePageChange}
            />
        </div>
    );

}
