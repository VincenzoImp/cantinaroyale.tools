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
import { contents, variables } from "@/app/layout";

export default function CollectionTable({ tableColumns, tableEntries, type }: { tableColumns: { rangeble: boolean; filterable: boolean; searchable: boolean; uid: string, name: string, sortable: boolean; }[], tableEntries: { [key: string]: any }[], type: string }) {

    const INITIAL_ROWS_PER_PAGE = variables.tableInfo.nftsPerPage.default;
    const INITIAL_PAGE = 1;
    const INITIAL_VISIBLE_COLUMNS = tableColumns.map((column) => column.uid);

    const [visibleColumns, setVisibleColumns] = React.useState<string[]>(INITIAL_VISIBLE_COLUMNS);
    const [rowsPerPage, setRowsPerPage] = React.useState(INITIAL_ROWS_PER_PAGE);
    const [page, setPage] = React.useState(INITIAL_PAGE);
    const [totalPages, setTotalPages] = React.useState(Math.ceil(tableEntries.length / rowsPerPage));

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

    function handleSearch(column: string, value: string) {
        setEntitiesUseStates({ ...entriesUseStates, searchable: { ...entriesUseStates.searchable, [column]: value} });
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

    function handleRowsPerPageChange(rowsPerPage: number) {
        setRowsPerPage(rowsPerPage);
        setTotalPages(Math.ceil(selectedEntries.length / rowsPerPage));
        setPage(INITIAL_PAGE);
    }

    function headerCell(columnUid: string) {
        var sortable = null;
        var filterable = null;
        var rangeble = null;
        var searchable = null;
        if (tableColumns.find((column) => column.uid === columnUid)?.searchable) {
            searchable = (
                <Input
                    placeholder="Search"
                    onChange={(e) => handleSearch(columnUid, e.target.value)}
                />
            );
        }
        return (
            <Dropdown>
                <DropdownTrigger>
                    {tableColumns.find((column) => column.uid === columnUid)?.name.toUpperCase()}
                </DropdownTrigger>
                <DropdownMenu>
                    <DropdownItem key="new">{sortable}</DropdownItem>
                    <DropdownItem key="new">{filterable}</DropdownItem>
                    <DropdownItem key="new">{rangeble}</DropdownItem>
                    <DropdownItem key="new">{searchable}</DropdownItem>
                    
                </DropdownMenu>
            </Dropdown>
        );
    }

    const tableTop = (
        <div className="flex justify-between items-center dark:text-gray-400 mx-4 pt-4">
            <span> 
                {selectedEntries.length} {contents.components.collectionTable.nfts}
            </span>
            <label className="flex items-center">
                {contents.components.collectionTable.nftsPerPage}
                <select className="bg-transparent outline-none" onChange={(e) => handleRowsPerPageChange(parseInt(e.target.value))}>
                    {variables.tableInfo.nftsPerPage.options.map((option) => (
                    <option key={option} value={option} selected={option === rowsPerPage}>
                        {option}
                    </option>
                ))}
            </select>
          </label>
        </div>
    );

    const tableBottom = (
        totalPages > 0 ? (
        <div className="flex w-full justify-center pb-4">
            <Pagination
                isCompact
                showControls
                showShadow
                page={page}
                total={totalPages}
                onChange={handlePageChange}
            />
        </div>
        ) : null
    );

    const tableHeader = (
        <TableHeader>
            {tableColumns.filter((column) => visibleColumns.includes(column.uid)).map((column) => (
                <TableColumn key={column.uid}>
                    {headerCell(column.uid)}
                </TableColumn>
            ))}
        </TableHeader>
    );

    const tableBody = (
        <TableBody emptyContent={contents.components.collectionTable.emptyContent}>
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
    );

    return (
        <div className="dark:bg-gray-800 bg-white rounded-lg shadow-lg">
            {tableTop}
            <Table>
                {tableHeader}
                {tableBody}
            </Table>
            {tableBottom}
        </div>
    );

}
