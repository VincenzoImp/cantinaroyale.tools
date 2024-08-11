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

    function initEntriesUseStates(tableColumns: { rangeble: boolean; filterable: boolean; searchable: boolean; uid: string; name: string; sortable: boolean; }[]) {
        const initialStates = {
            searchable: {} as { [key: string]: string },
            sortable: {} as { column: string; value: string }[],
            filterable: {} as { [key: string]: string[] },
            rangeble: {} as { [key: string]: { min: string; max: string } },
        };
        tableColumns.forEach((column) => {
            if (column.searchable) {
                initialStates.searchable[column.uid] = "";
            }
            if (column.sortable) {
                initialStates.sortable = [];
            }
            if (column.filterable) {
                initialStates.filterable[column.uid] = [];
            }
            if (column.rangeble) {
                initialStates.rangeble[column.uid] = { min: "", max: "" };
            }
        });
        return initialStates;
    }

    const [entriesUseStates, setEntitiesUseStates] = React.useState(initEntriesUseStates(tableColumns));
    
    const selectedEntries = React.useMemo(() => {
        let filteredEntries = [...tableEntries];
        const sortableState = entriesUseStates.sortable;
        for (const column of Object.values(tableColumns)) {
            const searchableState = entriesUseStates.searchable[column.uid];
            const filterableState = entriesUseStates.filterable[column.uid];
            const rangebleState = entriesUseStates.rangeble[column.uid];
            if (column.searchable && searchableState !== "" && visibleColumns.includes(column.uid)) {
                filteredEntries = filteredEntries.filter((entry) => entry[column.uid].toLowerCase().includes(searchableState.toLowerCase()));
            }
            if (column.filterable && filterableState.length > 0 && visibleColumns.includes(column.uid)) {
                filteredEntries = filteredEntries.filter((entry) => filterableState.includes(entry[column.uid]));
            }
            if (column.rangeble && rangebleState.min !== "" && rangebleState.max !== "" && visibleColumns.includes(column.uid)) {
                filteredEntries = filteredEntries.filter((entry) => {
                    return parseFloat(entry[column.uid]) >= parseFloat(rangebleState.min) && parseFloat(entry[column.uid]) <= parseFloat(rangebleState.max);
                });
            }
        }
        for (const { column, value } of sortableState.reverse()) {
            if (value === "asc") {
                filteredEntries.sort((a, b) => {
                    const valA = a[column];
                    const valB = b[column];
                    return typeof valA === 'number' && typeof valB === 'number' ?
                        valA - valB :
                        valA.toString().toLowerCase() > valB.toString().toLowerCase() ? 1 : -1;
                });
            } else if (value === "desc") {
                filteredEntries.sort((a, b) => {
                    const valA = a[column];
                    const valB = b[column];
                    return typeof valA === 'number' && typeof valB === 'number' ?
                        valB - valA :
                        valA.toString().toLowerCase() < valB.toString().toLowerCase() ? 1 : -1;
                });
            }
        }        
        return filteredEntries;
    }, [tableEntries, entriesUseStates, visibleColumns]);

    function clearEntriesUseStates(columnUid: string) {
        setEntitiesUseStates({
            ...entriesUseStates,
            searchable: { ...entriesUseStates.searchable, [columnUid]: "" },
            sortable: entriesUseStates.sortable.filter((state) => state.column !== columnUid),
            filterable: { ...entriesUseStates.filterable, [columnUid]: [] },
            rangeble: { ...entriesUseStates.rangeble, [columnUid]: { min: "", max: "" } },
        });
    }

    function handleColumnVisibilityAdd(columnUid: string) {
        setVisibleColumns([...visibleColumns, columnUid]);
    }

    function handleColumnVisibilityRemove(columnUid: string) {
        setVisibleColumns(visibleColumns.filter((column) => column !== columnUid));
        clearEntriesUseStates(columnUid);
    }

    function handleSearch(column: { uid: string; }, value: string) {
        setEntitiesUseStates({ ...entriesUseStates, searchable: { ...entriesUseStates.searchable, [column.uid]: value } });
    }

    function handleSort(columnUid: string, value: string) {
        setEntitiesUseStates({ ...entriesUseStates, sortable: [...entriesUseStates.sortable, { column: columnUid, value }] });
    }

    function handleFilterAdd(columnUid: string, value: string) {
        setEntitiesUseStates({ ...entriesUseStates, filterable: { ...entriesUseStates.filterable, [columnUid]: [...entriesUseStates.filterable[columnUid], value] } });
    }

    function handleFilterRemove(columnUid: string, value: string) {
        setEntitiesUseStates({ ...entriesUseStates, filterable: { ...entriesUseStates.filterable, [columnUid]: entriesUseStates.filterable[columnUid].filter((val) => val !== value) } });
    }

    function handleRange(columnUid: string, value: { min: string; max: string }) {
        setEntitiesUseStates({ ...entriesUseStates, rangeble: { ...entriesUseStates.rangeble, [columnUid]: value } });
    }

    function handlePageChange(page: number) {
        setPage(page);
    }



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
                                    value={entriesUseStates.searchable[column.uid]}
                                    onChange={(e) => handleSearch(column, e.target.value)}
                                />
                            )}
                            {column.sortable && (
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button>{entriesUseStates.sortable.find((state) => state.column === column.uid)?.value || "Sort"}</Button>
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
                                        value={entriesUseStates.rangeble[column.uid].min}
                                        onChange={(e) => handleRange(column.uid, { ...entriesUseStates.rangeble[column.uid], min: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Max"
                                        value={entriesUseStates.rangeble[column.uid].max}
                                        onChange={(e) => handleRange(column.uid, { ...entriesUseStates.rangeble[column.uid], max: e.target.value })}
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
