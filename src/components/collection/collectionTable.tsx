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

export default function CollectionTable({ tableColumns, tableEntries, type }: { tableColumns: { rangeble: boolean; filterable: boolean; searchable: boolean; uid: string, name: string, sortable: boolean; }[], tableEntries: { [key: string]: any }[], type: string }) {

    const INITIAL_ROWS_PER_PAGE = 10;
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
    
    //52:11  Warning: The 'entriesUseStates' object makes the dependencies of useMemo Hook (at line 114) change on every render. To fix this, wrap the initialization of 'entriesUseStates' in its own useMemo() Hook.  react-hooks/exhaustive-deps

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
            if (column.searchable && entriesUseStates.searchable[column.uid].value !== "" && visibleColumns.includes(column.uid)) {
                filteredEntries = filteredEntries.filter((entry) => entry[column.uid].includes(entriesUseStates.searchable[column.uid].value));
            }
            if (column.sortable && entriesUseStates.sortable[column.uid].value !== "" && visibleColumns.includes(column.uid)) {
                const sortOrder = entriesUseStates.sortable[column.uid].value;
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
            if (column.filterable && entriesUseStates.filterable[column.uid].value.length > 0 && visibleColumns.includes(column.uid)) {
                filteredEntries = filteredEntries.filter((entry) => entriesUseStates.filterable[column.uid].value.includes(entry[column.uid]));
            }
            if (column.rangeble && (entriesUseStates.rangeble[column.uid].value.min !== "" || entriesUseStates.rangeble[column.uid].value.max !== "") && visibleColumns.includes(column.uid)) {
                filteredEntries = filteredEntries.filter((entry) => {
                    if (entriesUseStates.rangeble[column.uid].value.min !== "" && entriesUseStates.rangeble[column.uid].value.max !== "") {
                        return entry[column.uid] >= entriesUseStates.rangeble[column.uid].value.min && entry[column.uid] <= entriesUseStates.rangeble[column.uid].value.max;
                    } else if (entriesUseStates.rangeble[column.uid].value.min !== "") {
                        return entry[column.uid] >= entriesUseStates.rangeble[column.uid].value.min;
                    } else if (entriesUseStates.rangeble[column.uid].value.max !== "") {
                        return entry[column.uid] <= entriesUseStates.rangeble[column.uid].value.max;
                    }
                });
            }
        }
        return filteredEntries;
    }, [tableEntries, tableColumns, visibleColumns, entriesUseStates]);

    const handleSearch = (column: { uid: string, searchable: any }, value: string) => {
        if (column.searchable && entriesUseStates.searchable[column.uid].value !== "") {
            entriesUseStates.searchable[column.uid].setValue(value);
        }
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
                                    onChange={(e) => handleSearch(column, e.target.value)}
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
                        <TableRow key={entry.uid}>
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
                total={Math.ceil(selectedEntries.length / rowsPerPage)}
                page={page}
                onChange={handlePageChange}
            />
        </div>
    );

}