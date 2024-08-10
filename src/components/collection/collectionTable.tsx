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

export default function CollectionTable({ tableColumns, tableEntries, type }: { tableColumns: {
    rangeble: any;
    filterable: any;
    searchable: any; uid: string, name: string, sortable: boolean 
}[], tableEntries: any[], type: string }) {

    const INITIAL_ROWS_PER_PAGE = 10;
    const INITIAL_PAGE = 1;
    const INITIAL_VISIBLE_COLUMNS = tableColumns.map((column) => column.uid);

    const [visibleColumns, setVisibleColumns] = React.useState<string[]>(INITIAL_VISIBLE_COLUMNS);
    const [rowsPerPage, setRowsPerPage] = React.useState(INITIAL_ROWS_PER_PAGE);
    const [page, setPage] = React.useState(INITIAL_PAGE);

    type Nft = typeof tableEntries[0];
    type EntriesUseStates = {
        searchable: { [key: string]: { value: string; setValue: React.Dispatch<React.SetStateAction<string>> } };
        sortable: { [key: string]: { value: string; setValue: React.Dispatch<React.SetStateAction<string>> } };
        filterable: { [key: string]: { value: string[]; setValue: React.Dispatch<React.SetStateAction<string[]>> } };
        rangeble: { [key: string]: { value: { min: string; max: string }; setValue: React.Dispatch<React.SetStateAction<{ min: string; max: string }>> } };
    };
    
    const entriesUseStates: EntriesUseStates = {
        searchable: {},
        sortable: {},
        filterable: {},
        rangeble: {}
    };
    for (const column of Object.values(tableColumns)) {
        if (column.searchable) {
            const [value, setValue] = React.useState("");
            entriesUseStates.searchable[column.uid] = { value: value, setValue: setValue };
        }
        if (column.sortable) {
            const [value, setValue] = React.useState<string>("");
            entriesUseStates.sortable[column.uid] = { value: value, setValue: setValue };
        }
        if (column.filterable) {
            const [value, setValue] = React.useState<string[]>([]);
            entriesUseStates.filterable[column.uid] = { value: value, setValue: setValue };
        }
        if (column.rangeble) {
            const [value, setValue] = React.useState<{ min: string, max: string }>({ min: "", max: "" });
            entriesUseStates.rangeble[column.uid] = { value: value, setValue: setValue };
        }
    }

    const selectedColumns = React.useMemo(() => {
        return tableColumns.filter((column) => visibleColumns.includes(column.uid));
    }, [visibleColumns]);

    const selectedEntries = React.useMemo(() => {
        let filteredEntries = [...tableEntries];
        for (const column of Object.values(tableColumns)) {
            if (column.searchable && entriesUseStates.searchable[column.uid].value !== "") {
                filteredEntries = filteredEntries.filter((entry) => {
                    return entry[column.uid].includes(entriesUseStates.searchable[column.uid].value);
                });
            }
            if (column.filterable && entriesUseStates.filterable[column.uid].value.length > 0) {
                filteredEntries = filteredEntries.filter((entry) => {
                    return entriesUseStates.filterable[column.uid].value.includes(entry[column.uid]);
                });
            }
            if (column.rangeble && entriesUseStates.rangeble[column.uid].value.min !== "" && entriesUseStates.rangeble[column.uid].value.max !== "") {
                filteredEntries = filteredEntries.filter((entry) => {
                    return (
                        Number(entry[column.uid]) >= Number(entriesUseStates.rangeble[column.uid].value.min) &&
                        Number(entry[column.uid]) <= Number(entriesUseStates.rangeble[column.uid].value.max)
                    );
                });
            }
            if (column.sortable && entriesUseStates.sortable[column.uid].value !== "") {
                filteredEntries = filteredEntries.sort((a, b) => {
                    if (entriesUseStates.sortable[column.uid].value === "asc") {
                        return Number(a[column.uid]) - Number(b[column.uid]);
                    } else if (entriesUseStates.sortable[column.uid].value === "desc") {
                        return Number(b[column.uid]) - Number(a[column.uid]);
                    }
                    return 0;
                });
            }
        }
        return filteredEntries;
    }, [tableEntries, tableColumns, entriesUseStates]);

    const handleSearch = (column: string, value: string) => {
        entriesUseStates.searchable[column].setValue(value);
    };

    const handleSort = (column: string, value: string) => {
        entriesUseStates.sortable[column].setValue(value);
    };

    const handleFilterAdd = (column: string, value: string) => {
        entriesUseStates.filterable[column].setValue([...entriesUseStates.filterable[column].value, value]);
    }

    const handleFilterRemove = (column: string, value: string) => {
        entriesUseStates.filterable[column].setValue(entriesUseStates.filterable[column].value.filter((v) => v !== value));
    }

    const handleRange = (column: string, value: { min: string, max: string }) => {
        entriesUseStates.rangeble[column].setValue(value);
    }

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const handleRowsPerPageChange = (rowsPerPage: number) => {
        setRowsPerPage(rowsPerPage);
    };

    const handleColumnVisibilityAdd = (column: string) => {
        setVisibleColumns([...visibleColumns, column]);
    }

    const handleColumnVisibilityRemove = (column: string) => {
        setVisibleColumns(visibleColumns.filter((c) => c !== column));
    }

    return (
        <div>
            <Table>
                <TableHeader>
                    {tableColumns.map((column) => (
                        <TableColumn key={column.uid}>
                            {column.name}
                            {column.searchable && (
                                <Input
                                    placeholder="Search"
                                    value={entriesUseStates.searchable[column.uid].value}
                                    onChange={(e) => handleSearch(column.uid, e.target.value)}
                                />
                            )}
                            {column.sortable && (
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort(column.uid, "asc")}
                                />
                            )}
                            {column.sortable && (
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort(column.uid, "desc")}
                                />
                            )}
                            {column.filterable && (
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button variant="ghost" />
                                    </DropdownTrigger>
                                    <DropdownMenu>
                                        {tableEntries.map((entry) => (
                                            <DropdownItem
                                                key={entry[column.uid]}
                                                onClick={() => handleFilterAdd(column.uid, entry[column.uid])}
                                            >
                                                {entry[column.uid]}
                                            </DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </Dropdown>
                            )}
                            {column.filterable && (
                                entriesUseStates.filterable[column.uid].value.map((value) => (
                                    <Chip
                                        key={value}
                                        onClose={() => handleFilterRemove(column.uid, value)}
                                    >
                                        {value}
                                    </Chip>
                                ))
                            )}
                            {column.rangeble && (
                                <Input
                                    placeholder="Min"
                                    value={entriesUseStates.rangeble[column.uid].value.min}
                                    onChange={(e) => handleRange(column.uid, { min: e.target.value, max: entriesUseStates.rangeble[column.uid].value.max })}
                                />
                            )}
                            {column.rangeble && (
                                <Input
                                    placeholder="Max"
                                    value={entriesUseStates.rangeble[column.uid].value.max}
                                    onChange={(e) => handleRange(column.uid, { min: entriesUseStates.rangeble[column.uid].value.min, max: e.target.value })}
                                />
                            )}
                            <Button
                                variant="ghost"
                                onClick={() => handleColumnVisibilityAdd(column.uid)}
                            />
                        </TableColumn>
                    ))}
                </TableHeader>
                <TableBody>
                    {selectedEntries.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((entry) => (
                        <TableRow key={entry.id}>
                            {selectedColumns.map((column) => (
                                <TableCell key={column.uid}>
                                    {entry[column.uid]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Pagination
                total={tableEntries.length}
                page={page}
                onChange={handlePageChange}
            />
        </div>
    );

}