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
    Image,
    Avatar,
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
        var dropdownItems: { [key: string]: JSX.Element } = {}
        if (tableColumns.find((column) => column.uid === columnUid)?.searchable) {
            dropdownItems['searchable'] = (
                <Input
                    placeholder="Search"
                    onChange={(e) => handleSearch(columnUid, e.target.value)}
                />
            );
        }
        if (tableColumns.find((column) => column.uid === columnUid)?.sortable) {
            dropdownItems['sortable'] = (
                <div>
                    <Button
                        onClick={() => handleSort(columnUid, "asc")}
                    >
                        Asc
                    </Button>
                    <Button
                        onClick={() => handleSort(columnUid, "desc")}
                    >
                        Desc
                    </Button>
                </div>
            );
        }
        if (tableColumns.find((column) => column.uid === columnUid)?.filterable) {
            dropdownItems['filterable'] = (
                <div>
                    {tableEntries.map((entry) => entry[columnUid]).filter((value, index, self) => self.indexOf(value) === index).map((value) => (
                        <Chip
                            key={value}
                            onClick={() => handleFilterAdd(columnUid, value)}
                        >
                            {value}
                        </Chip>
                    ))}
                </div>
            );
        }
        if (tableColumns.find((column) => column.uid === columnUid)?.rangeble) {
            dropdownItems['rangeble'] = (
                <div>
                    <Input
                        placeholder="Min"
                        type="number"
                        onChange={(e) => handleRange(columnUid, { min: e.target.value, max: entriesUseStates.rangeble[columnUid].max })}
                    />
                    <Input
                        placeholder="Max"
                        type="number"
                        onChange={(e) => handleRange(columnUid, { min: entriesUseStates.rangeble[columnUid].min, max: e.target.value })}
                    />
                </div>
            );
        }
        return (
            <Dropdown>
                <DropdownTrigger>
                    {tableColumns.find((column) => column.uid === columnUid)?.name.toUpperCase()}
                </DropdownTrigger>
                <DropdownMenu>
                    {Object.entries(dropdownItems).map(([key, value]) => (
                        <DropdownItem key={key}>
                            {value}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        );
    }

    const tableTop = (
        <div className="flex justify-between items-center dark:text-white mx-4 pt-4">
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
        totalPages > 1 ? (
        <div className="flex w-full justify-center">
            <Pagination 
                className=" mb-2"
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
                <TableColumn key={column.uid} align="center" className="dark:bg-gray-800 bg-white dark:text-white">
                    {headerCell(column.uid)}
                </TableColumn>
            ))}
        </TableHeader>
    );

    function renderCell(entry: { [key: string]: any }, column: string) {
        var displayValue: any = entry[column];
        if (column === "thumbnailUrl") {
            displayValue = <Avatar src={entry[column]} alt={entry["name"]} size="lg" radius="sm"/>
        }
        if (column === "owner") {
            displayValue = displayValue.slice(0, 6) + "..." + displayValue.slice(-6);
        }
        if (parseFloat(displayValue)) {
            displayValue = parseFloat(displayValue).toFixed(2).replace(/\.?0*$/, "");
        }
        if (column === "priceAmount" && entry["priceCurrency"]) {
            displayValue = displayValue + " " + entry["priceCurrency"];
        }
        if (column === "rarityClass") {
            const colorMapping: { [key: string]: string } = {
                "Bronze": "bg-yellow-500",
                "Silver": "bg-gray-300",
                "Gold": "bg-yellow-300",
                "Epic": "bg-purple-500",
                "Legendary": "bg-red-500"
            }
            displayValue = <Chip size="sm" className={colorMapping[displayValue]}>{displayValue}</Chip>
        }
        if (column === "perk1" || column === "perk2") {
            const talentTypes: { [key: string]: string } = variables.talentTypes;
            const colors: { [key: string]: string } = {
                valor: "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200",
                tactics: "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200",
                resolve: "bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200"
            };
            displayValue = displayValue.replace(/\s/g, "")
            displayValue = displayValue.charAt(0).toLowerCase() + displayValue.slice(1);
            displayValue = <Chip size="sm" className={colors[talentTypes[displayValue]]}>{entry[column]}</Chip>
        }
        if (["perk1", "perk2", "rarirtyClass", "thumbnailUrl"].includes(column)) {
            return (
                <TableCell>
                    {displayValue}
                </TableCell>
            );
        } else {
            return (
                <TableCell>
                    <Chip variant="light" className="dark:text-white">{displayValue}</Chip>                
                </TableCell>
            );
        }
    }
    const tableBody = (
        <TableBody emptyContent={contents.components.collectionTable.emptyContent}>
            {selectedEntries.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((entry) => (
                <TableRow key={entry.uid}>
                    {visibleColumns.map((column) => (
                        renderCell(entry, column)
                    ))}
                </TableRow>
            ))}
        </TableBody>
    );

    return (
        <div className="dark:bg-gray-800 bg-white rounded-lg shadow-lg">
            {tableTop}
            <div className="mx-4 mt-4">
            <Table 
                shadow="none"
                classNames={{ 
                    table: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                    wrapper: "dark:bg-gray-900 bg-gray-100 rounded-lg p-4 mb-4"
                }}>
                {tableHeader}
                {tableBody}
            </Table>
            </div>
            
            {tableBottom}
        </div>
    );

}
