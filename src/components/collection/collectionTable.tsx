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
    Avatar,
    Select,
    SelectItem,
} from "@heroui/react";
import { contents, variables } from "@/app/layout";

// Define proper TypeScript interfaces
interface TableColumn {
    uid: string;
    name: string;
    searchable: boolean;
    sortable: boolean;
    filterable: boolean;
    rangeble: boolean;
}

interface TableEntry {
    [key: string]: any;
    uid?: string;
    identifier?: string;
}

interface EntriesUseStates {
    searchable: { [key: string]: string };
    sortable: Array<{ column: string; value: "asc" | "desc" }>;
    filterable: { [key: string]: string[] };
    rangeble: { [key: string]: { min: string; max: string } };
}

interface CollectionTableProps {
    tableColumns: TableColumn[];
    tableEntries: TableEntry[];
    type: string;
}

export default function CollectionTable({ tableColumns, tableEntries, type }: CollectionTableProps) {
    const INITIAL_ROWS_PER_PAGE = variables?.tableInfo?.nftsPerPage?.default || 25;
    const INITIAL_PAGE = 1;
    const INITIAL_VISIBLE_COLUMNS = tableColumns.map((column) => column.uid);

    const [visibleColumns, setVisibleColumns] = React.useState<string[]>(INITIAL_VISIBLE_COLUMNS);
    const [rowsPerPage, setRowsPerPage] = React.useState(INITIAL_ROWS_PER_PAGE);
    const [page, setPage] = React.useState(INITIAL_PAGE);
    const [totalPages, setTotalPages] = React.useState(Math.ceil(tableEntries.length / INITIAL_ROWS_PER_PAGE));

    // Initialize the filter states properly
    function initEntriesUseStates(tableColumns: TableColumn[]): EntriesUseStates {
        const initialStates: EntriesUseStates = {
            searchable: {},
            sortable: [],
            filterable: {},
            rangeble: {},
        };

        tableColumns.forEach((column) => {
            if (column.searchable) {
                initialStates.searchable[column.uid] = "";
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

    const [entriesUseStates, setEntriesUseStates] = React.useState<EntriesUseStates>(
        initEntriesUseStates(tableColumns)
    );

    // Fixed filtering and sorting logic
    const selectedEntries = React.useMemo(() => {
        let filteredEntries = [...tableEntries];

        // Apply search filters
        tableColumns.forEach((column) => {
            if (!visibleColumns.includes(column.uid)) return;

            const searchableState = entriesUseStates.searchable[column.uid];
            const filterableState = entriesUseStates.filterable[column.uid];
            const rangebleState = entriesUseStates.rangeble[column.uid];

            // Search filter
            if (column.searchable && searchableState && searchableState.trim() !== "") {
                filteredEntries = filteredEntries.filter((entry) => {
                    const value = entry[column.uid];
                    return value && value.toString().toLowerCase().includes(searchableState.toLowerCase());
                });
            }

            // Multi-select filter
            if (column.filterable && filterableState && filterableState.length > 0) {
                filteredEntries = filteredEntries.filter((entry) =>
                    filterableState.includes(entry[column.uid])
                );
            }

            // Range filter
            if (column.rangeble && rangebleState && rangebleState.min !== "" && rangebleState.max !== "") {
                const min = parseFloat(rangebleState.min);
                const max = parseFloat(rangebleState.max);
                if (!isNaN(min) && !isNaN(max)) {
                    filteredEntries = filteredEntries.filter((entry) => {
                        const value = parseFloat(entry[column.uid]);
                        return !isNaN(value) && value >= min && value <= max;
                    });
                }
            }
        });

        // Apply sorting (support multiple sorts)
        const sortableState = entriesUseStates.sortable;
        sortableState.forEach(({ column, value }) => {
            filteredEntries.sort((a, b) => {
                const valA = a[column];
                const valB = b[column];

                // Handle numbers
                const numA = parseFloat(valA);
                const numB = parseFloat(valB);

                if (!isNaN(numA) && !isNaN(numB)) {
                    return value === "asc" ? numA - numB : numB - numA;
                }

                // Handle strings
                const strA = valA?.toString().toLowerCase() || "";
                const strB = valB?.toString().toLowerCase() || "";

                if (value === "asc") {
                    return strA.localeCompare(strB);
                } else {
                    return strB.localeCompare(strA);
                }
            });
        });

        return filteredEntries;
    }, [tableEntries, entriesUseStates, visibleColumns, tableColumns]);

    // Update total pages when filtered entries change
    React.useEffect(() => {
        const newTotalPages = Math.ceil(selectedEntries.length / rowsPerPage);
        setTotalPages(newTotalPages);
        if (page > newTotalPages && newTotalPages > 0) {
            setPage(1);
        }
    }, [selectedEntries.length, rowsPerPage, page]);

    // Handler functions
    function clearEntriesUseStates(columnUid: string) {
        setEntriesUseStates((prev) => ({
            ...prev,
            searchable: { ...prev.searchable, [columnUid]: "" },
            sortable: prev.sortable.filter((state) => state.column !== columnUid),
            filterable: { ...prev.filterable, [columnUid]: [] },
            rangeble: { ...prev.rangeble, [columnUid]: { min: "", max: "" } },
        }));
    }

    function handleSearch(column: string, value: string) {
        setEntriesUseStates((prev) => ({
            ...prev,
            searchable: { ...prev.searchable, [column]: value }
        }));
        setPage(1); // Reset to first page when searching
    }

    function handleSort(columnUid: string, value: "asc" | "desc") {
        setEntriesUseStates((prev) => ({
            ...prev,
            sortable: [...prev.sortable.filter(s => s.column !== columnUid), { column: columnUid, value }]
        }));
    }

    function handleFilterAdd(columnUid: string, value: string) {
        setEntriesUseStates((prev) => ({
            ...prev,
            filterable: {
                ...prev.filterable,
                [columnUid]: [...(prev.filterable[columnUid] || []), value]
            }
        }));
        setPage(1);
    }

    function handleFilterRemove(columnUid: string, value: string) {
        setEntriesUseStates((prev) => ({
            ...prev,
            filterable: {
                ...prev.filterable,
                [columnUid]: prev.filterable[columnUid]?.filter((val) => val !== value) || []
            }
        }));
    }

    function handleRange(columnUid: string, value: { min: string; max: string }) {
        setEntriesUseStates((prev) => ({
            ...prev,
            rangeble: { ...prev.rangeble, [columnUid]: value }
        }));
        setPage(1);
    }

    function handlePageChange(page: number) {
        setPage(page);
    }

    function handleRowsPerPageChange(rowsPerPage: number) {
        setRowsPerPage(rowsPerPage);
        setTotalPages(Math.ceil(selectedEntries.length / rowsPerPage));
        setPage(INITIAL_PAGE);
    }

    // Get unique values for filter dropdown
    function getUniqueValues(columnUid: string): string[] {
        const uniqueValues = [...new Set(
            tableEntries
                .map((entry) => entry[columnUid])
                .filter((value) => value !== null && value !== undefined && value !== "")
        )];
        return uniqueValues.sort();
    }

    // Format display value
    function formatDisplayValue(value: any, columnUid: string): any {
        if (value === null || value === undefined || value === "") {
            return "-";
        }

        switch (columnUid) {
            case "owner":
                if (typeof value === "string" && value.length > 12) {
                    return `${value.slice(0, 6)}...${value.slice(-6)}`;
                }
                break;
            case "priceAmount":
                if (typeof value === "number" || !isNaN(parseFloat(value))) {
                    const price = parseFloat(value);
                    return price.toFixed(2).replace(/\.?0+$/, "");
                }
                break;
            case "collection":
                // Map collection identifiers to readable names if needed
                const collectionNames: { [key: string]: string } = {
                    "GSPACEAPE-08bc2b": "Genesis Space Apes",
                    "CEA-2d29f9": "CEA Collection",
                    "CRHEROES-9edff2": "Cantina Royale Heroes",
                    "CRWEAPONS-e5ab49": "Cantina Weapons",
                    "CRMYTH-546419": "Mythical Weapons"
                };
                return collectionNames[value] || value;
            default:
                if (typeof value === "number" || (!isNaN(parseFloat(value)) && isFinite(value))) {
                    const numValue = parseFloat(value);
                    // Don't format integers unless they're very large
                    if (Number.isInteger(numValue) && numValue < 1000) {
                        return numValue.toString();
                    }
                    return numValue.toFixed(2).replace(/\.?0+$/, "");
                }
                break;
        }

        return value;
    }

    // Fixed header cell with proper dropdown implementation
    function headerCell(columnUid: string) {
        const column = tableColumns.find((col) => col.uid === columnUid);
        if (!column) return column?.name || columnUid;

        const hasFilters = column.searchable || column.sortable || column.filterable || column.rangeble;

        if (!hasFilters) {
            return (
                <div className="flex items-center justify-center">
                    <span className="font-semibold">{column.name}</span>
                </div>
            );
        }

        return (
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        variant="light"
                        className="h-auto p-2 min-w-0 font-semibold data-[hover=true]:bg-transparent"
                        endContent={<span className="text-xs">▼</span>}
                    >
                        {column.name}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label={`${column.name} filters`}
                    closeOnSelect={false}
                    className="w-80"
                >
                    {/* Search */}
                    {column.searchable && (
                        <DropdownItem key="search" textValue="Search" className="p-2">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Search:</p>
                                <Input
                                    placeholder={`Search ${column.name.toLowerCase()}...`}
                                    value={entriesUseStates.searchable[columnUid] || ""}
                                    onChange={(e) => handleSearch(columnUid, e.target.value)}
                                    size="sm"
                                    className="w-full"
                                />
                            </div>
                        </DropdownItem>
                    )}

                    {/* Sort */}
                    {column.sortable && (
                        <DropdownItem key="sort" textValue="Sort" className="p-2">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Sort by:</p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={entriesUseStates.sortable.some(s => s.column === columnUid && s.value === "asc") ? "solid" : "bordered"}
                                        onClick={() => handleSort(columnUid, "asc")}
                                    >
                                        ↑ Asc
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={entriesUseStates.sortable.some(s => s.column === columnUid && s.value === "desc") ? "solid" : "bordered"}
                                        onClick={() => handleSort(columnUid, "desc")}
                                    >
                                        ↓ Desc
                                    </Button>
                                </div>
                            </div>
                        </DropdownItem>
                    )}

                    {/* Filter */}
                    {column.filterable && (
                        <DropdownItem key="filter" textValue="Filter" className="p-2">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Filter by:</p>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {getUniqueValues(columnUid).map((value) => {
                                        const isSelected = entriesUseStates.filterable[columnUid]?.includes(value);
                                        return (
                                            <Chip
                                                key={value}
                                                size="sm"
                                                variant={isSelected ? "solid" : "bordered"}
                                                className="cursor-pointer mr-1 mb-1"
                                                onClick={() =>
                                                    isSelected
                                                        ? handleFilterRemove(columnUid, value)
                                                        : handleFilterAdd(columnUid, value)
                                                }
                                            >
                                                {value}
                                            </Chip>
                                        );
                                    })}
                                </div>
                                {entriesUseStates.filterable[columnUid]?.length > 0 && (
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="danger"
                                        onClick={() => setEntriesUseStates(prev => ({
                                            ...prev,
                                            filterable: { ...prev.filterable, [columnUid]: [] }
                                        }))}
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </DropdownItem>
                    )}

                    {/* Range */}
                    {column.rangeble && (
                        <DropdownItem key="range" textValue="Range" className="p-2">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Range:</p>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Min"
                                        type="number"
                                        size="sm"
                                        value={entriesUseStates.rangeble[columnUid]?.min || ""}
                                        onChange={(e) => handleRange(columnUid, {
                                            min: e.target.value,
                                            max: entriesUseStates.rangeble[columnUid]?.max || ""
                                        })}
                                    />
                                    <Input
                                        placeholder="Max"
                                        type="number"
                                        size="sm"
                                        value={entriesUseStates.rangeble[columnUid]?.max || ""}
                                        onChange={(e) => handleRange(columnUid, {
                                            min: entriesUseStates.rangeble[columnUid]?.min || "",
                                            max: e.target.value
                                        })}
                                    />
                                </div>
                            </div>
                        </DropdownItem>
                    )}

                    {hasFilters && (
                        <DropdownItem key="clear-all" textValue="Clear All" className="p-2">
                            <Button
                                size="sm"
                                variant="flat"
                                color="warning"
                                onClick={() => clearEntriesUseStates(columnUid)}
                                className="w-full"
                            >
                                Clear All Filters
                            </Button>
                        </DropdownItem>
                    )}
                </DropdownMenu>
            </Dropdown>
        );
    }

    // Fixed table top controls
    const tableTop = (
        <div className="flex justify-between items-center dark:text-white mx-4 pt-4 pb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedEntries.length} {contents?.components?.collectionTable?.nfts || "items"}
                {selectedEntries.length !== tableEntries.length && (
                    <span className="text-xs ml-1">
                        (filtered from {tableEntries.length})
                    </span>
                )}
            </span>

            <div className="flex items-center gap-4">
                {/* Column Visibility */}
                <Dropdown>
                    <DropdownTrigger>
                        <Button variant="bordered" size="sm">
                            Columns ({visibleColumns.length})
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Column visibility"
                        closeOnSelect={false}
                        selectedKeys={visibleColumns}
                        selectionMode="multiple"
                        onSelectionChange={(keys) => {
                            const newVisibleColumns = Array.from(keys as Set<string>);
                            setVisibleColumns(newVisibleColumns);
                        }}
                    >
                        {tableColumns.map((column) => (
                            <DropdownItem key={column.uid}>
                                {column.name}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>

                {/* Rows per page */}
                <div className="flex items-center gap-2">
                    <span className="text-sm">
                        {contents?.components?.collectionTable?.nftsPerPage || "Rows per page"}
                    </span>
                    <Select
                        size="sm"
                        className="w-20"
                        selectedKeys={[rowsPerPage.toString()]}
                        onChange={(e) => handleRowsPerPageChange(parseInt(e.target.value))}
                        aria-label="Rows per page selection"
                    >
                        {(variables?.tableInfo?.nftsPerPage?.options || [10, 25, 50, 100]).map((option) => (
                            <SelectItem key={option.toString()} value={option.toString()}>
                                {option.toString()}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
            </div>
        </div>
    );

    // Fixed pagination
    const tableBottom = totalPages > 1 ? (
        <div className="flex w-full justify-center py-4">
            <Pagination
                classNames={{
                    base: "mb-2",
                    prev: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                    next: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                    item: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                    forwardIcon: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                    ellipsis: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                    chevronNext: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                }}
                isCompact
                showControls
                showShadow
                page={page}
                total={totalPages}
                onChange={handlePageChange}
            />
        </div>
    ) : null;

    // Fixed table header
    const tableHeader = (
        <TableHeader>
            {tableColumns
                .filter((column) => visibleColumns.includes(column.uid))
                .map((column) => (
                    <TableColumn key={column.uid} align="center" className="dark:bg-gray-800 bg-white dark:text-white">
                        {headerCell(column.uid)}
                    </TableColumn>
                ))}
        </TableHeader>
    );

    // Fixed cell rendering
    function renderCell(entry: TableEntry, columnUid: string) {
        let displayValue: any = entry[columnUid];

        // Handle special column types
        if (columnUid === "identifier") {
            displayValue = (
                <a
                    className="underline hover:text-blue-500 dark:hover:text-blue-500 cursor-pointer"
                    href={`/nft/${displayValue}`}
                >
                    {displayValue}
                </a>
            );
        } else if (columnUid === "thumbnailUrl") {
            const imageUrl = type === "weapons" ? entry["url"] : entry[columnUid];
            displayValue = (
                <Avatar
                    src={imageUrl}
                    alt={entry["name"] || "NFT"}
                    size="lg"
                    radius="sm"
                    className="bg-transparent"
                />
            );
        } else {
            displayValue = formatDisplayValue(displayValue, columnUid);
        }

        return (
            <TableCell key={columnUid}>
                <Chip variant="light" className="dark:text-white">
                    {displayValue}
                </Chip>
            </TableCell>
        );
    }

    // Fixed table body
    const tableBody = (
        <TableBody emptyContent={contents?.components?.collectionTable?.emptyContent || "No items found"}>
            {selectedEntries
                .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                .map((entry) => (
                    <TableRow key={entry.uid || entry.identifier}>
                        {visibleColumns.map((columnUid) => renderCell(entry, columnUid))}
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
                    }}
                >
                    {tableHeader}
                    {tableBody}
                </Table>
            </div>
            {tableBottom}
        </div>
    );
}