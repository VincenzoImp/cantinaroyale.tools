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
    Card,
    CardBody,
    Switch,
} from "@heroui/react";
import { contents, variables } from "@/app/layout";

// Complete TypeScript interfaces
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

interface SortConfig {
    column: string;
    direction: "asc" | "desc";
}

interface FilterStates {
    searchable: { [key: string]: string };
    sortable: SortConfig[];
    filterable: { [key: string]: string[] };
    rangeble: { [key: string]: { min: string; max: string } };
}

interface CollectionTableProps {
    tableColumns: TableColumn[];
    tableEntries: TableEntry[];
    type: string;
}

export default function CollectionTable({ tableColumns, tableEntries, type }: CollectionTableProps) {
    // Constants
    const INITIAL_ROWS_PER_PAGE = variables?.tableInfo?.nftsPerPage?.default || 25;
    const INITIAL_PAGE = 1;
    const INITIAL_VISIBLE_COLUMNS = tableColumns.map((column) => column.uid);

    // State management
    const [visibleColumns, setVisibleColumns] = React.useState<string[]>(INITIAL_VISIBLE_COLUMNS);
    const [rowsPerPage, setRowsPerPage] = React.useState(INITIAL_ROWS_PER_PAGE);
    const [page, setPage] = React.useState(INITIAL_PAGE);
    const [totalPages, setTotalPages] = React.useState(1);

    // Initialize filter states with proper type safety
    const initializeFilterStates = React.useCallback((): FilterStates => {
        const initialStates: FilterStates = {
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
    }, [tableColumns]);

    const [filterStates, setFilterStates] = React.useState<FilterStates>(initializeFilterStates);

    // Utility functions
    const formatDisplayValue = React.useCallback((value: any, columnUid: string): any => {
        if (value === null || value === undefined || value === "") {
            return "-";
        }

        try {
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
                    const collectionNames: { [key: string]: string } = {
                        "GSPACEAPE-08bc2b": "Genesis Space Apes",
                        "CEA-2d29f9": "CEA Collection",
                        "CRHEROES-9edff2": "Cantina Royale Heroes",
                        "CRWEAPONS-e5ab49": "Cantina Weapons",
                        "CRMYTH-546419": "Mythical Weapons"
                    };
                    return collectionNames[value] || value;
                case "value":
                case "discount":
                case "progress":
                    if (typeof value === "number" || (!isNaN(parseFloat(value)) && isFinite(value))) {
                        const numValue = parseFloat(value);
                        return numValue.toFixed(2).replace(/\.?0+$/, "");
                    }
                    break;
                default:
                    if (typeof value === "number" || (!isNaN(parseFloat(value)) && isFinite(value))) {
                        const numValue = parseFloat(value);
                        if (Number.isInteger(numValue) && numValue < 1000) {
                            return numValue.toString();
                        }
                        return numValue.toFixed(2).replace(/\.?0+$/, "");
                    }
                    break;
            }
        } catch (error) {
            console.warn(`Error formatting value for column ${columnUid}:`, error);
        }

        return value;
    }, []);

    const getUniqueValues = React.useCallback((columnUid: string): string[] => {
        try {
            const values = tableEntries
                .map((entry) => entry[columnUid])
                .filter((value) => value !== null && value !== undefined && value !== "")
                .map((value) => formatDisplayValue(value, columnUid));

            const uniqueValues = [...new Set(values)];

            return uniqueValues.sort((a, b) => {
                const numA = parseFloat(a);
                const numB = parseFloat(b);

                if (!isNaN(numA) && !isNaN(numB)) {
                    return numA - numB;
                }

                return a.toString().localeCompare(b.toString());
            });
        } catch (error) {
            console.warn(`Error getting unique values for column ${columnUid}:`, error);
            return [];
        }
    }, [tableEntries, formatDisplayValue]);

    // Advanced filtering and sorting logic
    const filteredEntries = React.useMemo(() => {
        try {
            let result = [...tableEntries];

            // Apply search filters
            tableColumns.forEach((column) => {
                if (!visibleColumns.includes(column.uid)) return;

                const searchValue = filterStates.searchable[column.uid];
                const filterValues = filterStates.filterable[column.uid];
                const rangeValues = filterStates.rangeble[column.uid];

                // Search filter
                if (column.searchable && searchValue && searchValue.trim() !== "") {
                    result = result.filter((entry) => {
                        const value = entry[column.uid];
                        if (!value) return false;
                        return value.toString().toLowerCase().includes(searchValue.toLowerCase());
                    });
                }

                // Multi-select filter
                if (column.filterable && filterValues && filterValues.length > 0) {
                    result = result.filter((entry) => {
                        const displayValue = formatDisplayValue(entry[column.uid], column.uid);
                        return filterValues.includes(displayValue);
                    });
                }

                // Range filter
                if (column.rangeble && rangeValues && rangeValues.min !== "" && rangeValues.max !== "") {
                    const min = parseFloat(rangeValues.min);
                    const max = parseFloat(rangeValues.max);
                    if (!isNaN(min) && !isNaN(max)) {
                        result = result.filter((entry) => {
                            const value = parseFloat(entry[column.uid]);
                            return !isNaN(value) && value >= min && value <= max;
                        });
                    }
                }
            });

            // Apply sorting
            filterStates.sortable.forEach(({ column, direction }) => {
                result.sort((a, b) => {
                    const valA = a[column];
                    const valB = b[column];

                    if (valA === null || valA === undefined) return 1;
                    if (valB === null || valB === undefined) return -1;

                    const numA = parseFloat(valA);
                    const numB = parseFloat(valB);

                    if (!isNaN(numA) && !isNaN(numB)) {
                        return direction === "asc" ? numA - numB : numB - numA;
                    }

                    const strA = valA.toString().toLowerCase();
                    const strB = valB.toString().toLowerCase();

                    if (direction === "asc") {
                        return strA.localeCompare(strB);
                    } else {
                        return strB.localeCompare(strA);
                    }
                });
            });

            return result;
        } catch (error) {
            console.error("Error filtering entries:", error);
            return tableEntries;
        }
    }, [tableEntries, filterStates, visibleColumns, tableColumns, formatDisplayValue]);

    // Update pagination when entries change
    React.useEffect(() => {
        const newTotalPages = Math.ceil(filteredEntries.length / rowsPerPage);
        setTotalPages(newTotalPages);
        if (page > newTotalPages && newTotalPages > 0) {
            setPage(1);
        }
    }, [filteredEntries.length, rowsPerPage, page]);

    // Handler functions with error handling
    const handleSearch = React.useCallback((column: string, value: string) => {
        try {
            setFilterStates((prev) => ({
                ...prev,
                searchable: { ...prev.searchable, [column]: value }
            }));
            setPage(1);
        } catch (error) {
            console.error("Error handling search:", error);
        }
    }, []);

    const handleSort = React.useCallback((columnUid: string, direction: "asc" | "desc") => {
        try {
            setFilterStates((prev) => ({
                ...prev,
                sortable: [
                    ...prev.sortable.filter(s => s.column !== columnUid),
                    { column: columnUid, direction }
                ]
            }));
        } catch (error) {
            console.error("Error handling sort:", error);
        }
    }, []);

    const handleFilterAdd = React.useCallback((columnUid: string, value: string) => {
        try {
            setFilterStates((prev) => ({
                ...prev,
                filterable: {
                    ...prev.filterable,
                    [columnUid]: [...(prev.filterable[columnUid] || []), value]
                }
            }));
            setPage(1);
        } catch (error) {
            console.error("Error adding filter:", error);
        }
    }, []);

    const handleFilterRemove = React.useCallback((columnUid: string, value: string) => {
        try {
            setFilterStates((prev) => ({
                ...prev,
                filterable: {
                    ...prev.filterable,
                    [columnUid]: prev.filterable[columnUid]?.filter((val) => val !== value) || []
                }
            }));
        } catch (error) {
            console.error("Error removing filter:", error);
        }
    }, []);

    const handleRange = React.useCallback((columnUid: string, range: { min: string; max: string }) => {
        try {
            setFilterStates((prev) => ({
                ...prev,
                rangeble: { ...prev.rangeble, [columnUid]: range }
            }));
            setPage(1);
        } catch (error) {
            console.error("Error handling range:", error);
        }
    }, []);

    const clearColumnFilters = React.useCallback((columnUid: string) => {
        try {
            setFilterStates((prev) => ({
                ...prev,
                searchable: { ...prev.searchable, [columnUid]: "" },
                sortable: prev.sortable.filter((state) => state.column !== columnUid),
                filterable: { ...prev.filterable, [columnUid]: [] },
                rangeble: { ...prev.rangeble, [columnUid]: { min: "", max: "" } },
            }));
        } catch (error) {
            console.error("Error clearing filters:", error);
        }
    }, []);

    const handlePageChange = React.useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleRowsPerPageChange = React.useCallback((newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(1);
    }, []);

    // Column header with advanced dropdown
    const renderColumnHeader = React.useCallback((columnUid: string) => {
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
            <Dropdown closeOnSelect={false}>
                <DropdownTrigger>
                    <Button
                        variant="light"
                        className="h-auto p-2 min-w-0 font-semibold data-[hover=true]:bg-transparent"
                        endContent={<span className="text-xs ml-1">▼</span>}
                    >
                        {column.name}
                        {/* Active filter indicator */}
                        {(filterStates.searchable[columnUid] ||
                            filterStates.filterable[columnUid]?.length > 0 ||
                            filterStates.sortable.some(s => s.column === columnUid) ||
                            (filterStates.rangeble[columnUid]?.min || filterStates.rangeble[columnUid]?.max)) && (
                                <span className="ml-1 text-blue-500">●</span>
                            )}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label={`${column.name} filters`}
                    className="w-80 max-h-96 overflow-y-auto"
                    variant="flat"
                >
                    {/* Search Section */}
                    {column.searchable ? (
                        <DropdownItem
                            key="search-section"
                            isReadOnly
                            className="p-3 border-b border-divider"
                            textValue="Search section"
                        >
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-foreground">Search</p>
                                <Input
                                    placeholder={`Search ${column.name.toLowerCase()}...`}
                                    value={filterStates.searchable[columnUid] || ""}
                                    onChange={(e) => handleSearch(columnUid, e.target.value)}
                                    size="sm"
                                    className="w-full"
                                    variant="bordered"
                                />
                            </div>
                        </DropdownItem>
                    ) : null}

                    {/* Sort Section */}
                    {column.sortable ? (
                        <DropdownItem
                            key="sort-section"
                            isReadOnly
                            className="p-3 border-b border-divider"
                            textValue="Sort section"
                        >
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-foreground">Sort</p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={filterStates.sortable.some(s => s.column === columnUid && s.direction === "asc") ? "solid" : "bordered"}
                                        onClick={() => handleSort(columnUid, "asc")}
                                        className="flex-1"
                                    >
                                        ↑ Ascending
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={filterStates.sortable.some(s => s.column === columnUid && s.direction === "desc") ? "solid" : "bordered"}
                                        onClick={() => handleSort(columnUid, "desc")}
                                        className="flex-1"
                                    >
                                        ↓ Descending
                                    </Button>
                                </div>
                            </div>
                        </DropdownItem>
                    ) : null}

                    {/* Filter Section */}
                    {column.filterable ? (
                        <DropdownItem
                            key="filter-section"
                            isReadOnly
                            className="p-3 border-b border-divider"
                            textValue="Filter section"
                        >
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-foreground">Filter</p>
                                <div className="max-h-32 overflow-y-auto">
                                    <div className="flex flex-wrap gap-1">
                                        {getUniqueValues(columnUid).map((value) => {
                                            const isSelected = filterStates.filterable[columnUid]?.includes(value);
                                            return (
                                                <Chip
                                                    key={value}
                                                    size="sm"
                                                    variant={isSelected ? "solid" : "bordered"}
                                                    color={isSelected ? "primary" : "default"}
                                                    className="cursor-pointer"
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
                                </div>
                                {filterStates.filterable[columnUid]?.length > 0 ? (
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="danger"
                                        onClick={() => setFilterStates(prev => ({
                                            ...prev,
                                            filterable: { ...prev.filterable, [columnUid]: [] }
                                        }))}
                                        className="w-full"
                                    >
                                        Clear Filters
                                    </Button>
                                ) : null}
                            </div>
                        </DropdownItem>
                    ) : null}

                    {/* Range Section */}
                    {column.rangeble ? (
                        <DropdownItem
                            key="range-section"
                            isReadOnly
                            className="p-3 border-b border-divider"
                            textValue="Range section"
                        >
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-foreground">Range</p>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Min"
                                        type="number"
                                        size="sm"
                                        value={filterStates.rangeble[columnUid]?.min || ""}
                                        onChange={(e) => handleRange(columnUid, {
                                            min: e.target.value,
                                            max: filterStates.rangeble[columnUid]?.max || ""
                                        })}
                                        variant="bordered"
                                    />
                                    <Input
                                        placeholder="Max"
                                        type="number"
                                        size="sm"
                                        value={filterStates.rangeble[columnUid]?.max || ""}
                                        onChange={(e) => handleRange(columnUid, {
                                            min: filterStates.rangeble[columnUid]?.min || "",
                                            max: e.target.value
                                        })}
                                        variant="bordered"
                                    />
                                </div>
                            </div>
                        </DropdownItem>
                    ) : null}

                    {/* Clear All Section */}
                    {hasFilters ? (
                        <DropdownItem
                            key="clear-all-section"
                            isReadOnly
                            className="p-3"
                            textValue="Clear all section"
                        >
                            <Button
                                size="sm"
                                variant="flat"
                                color="warning"
                                onClick={() => clearColumnFilters(columnUid)}
                                className="w-full"
                            >
                                Clear All Filters
                            </Button>
                        </DropdownItem>
                    ) : null}
                </DropdownMenu>
            </Dropdown>
        );
    }, [tableColumns, filterStates, handleSearch, handleSort, handleFilterAdd, handleFilterRemove, handleRange, clearColumnFilters, getUniqueValues]);

    // Render table cell
    const renderCell = React.useCallback((entry: TableEntry, columnUid: string) => {
        try {
            let displayValue: any = entry[columnUid];

            if (columnUid === "identifier") {
                displayValue = (
                    <a
                        className="underline hover:text-blue-500 dark:hover:text-blue-500 cursor-pointer transition-colors"
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
                        fallback={<span className="text-xs">NFT</span>}
                    />
                );
            } else {
                displayValue = formatDisplayValue(displayValue, columnUid);
            }

            return (
                <TableCell key={columnUid}>
                    <Chip variant="light" className="dark:text-white text-foreground">
                        {displayValue}
                    </Chip>
                </TableCell>
            );
        } catch (error) {
            console.error(`Error rendering cell for column ${columnUid}:`, error);
            return (
                <TableCell key={columnUid}>
                    <Chip variant="light" className="dark:text-white text-foreground">
                        Error
                    </Chip>
                </TableCell>
            );
        }
    }, [type, formatDisplayValue]);

    // Table controls
    const tableControls = (
        <Card className="mb-4">
            <CardBody className="p-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredEntries.length} {contents?.components?.collectionTable?.nfts || "items"}
                            {filteredEntries.length !== tableEntries.length && (
                                <span className="text-xs ml-1">
                                    (filtered from {tableEntries.length})
                                </span>
                            )}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Column Visibility */}
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant="bordered" size="sm">
                                    Columns ({visibleColumns.length}/{tableColumns.length})
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Column visibility"
                                closeOnSelect={false}
                                selectedKeys={new Set(visibleColumns)}
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
                            <span className="text-sm whitespace-nowrap">
                                {contents?.components?.collectionTable?.nftsPerPage || "Rows per page:"}
                            </span>
                            <Select
                                size="sm"
                                className="w-20"
                                selectedKeys={[rowsPerPage.toString()]}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    if (selected) {
                                        handleRowsPerPageChange(parseInt(selected));
                                    }
                                }}
                                aria-label="Rows per page selection"
                            >
                                {(variables?.tableInfo?.nftsPerPage?.options || [10, 25, 50, 100]).map((option) => (
                                    <SelectItem key={option.toString()}>
                                        {option.toString()}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );

    // Table header
    const tableHeader = (
        <TableHeader>
            {visibleColumns.map((columnUid) => (
                <TableColumn
                    key={columnUid}
                    align="center"
                    className="dark:bg-gray-800 bg-white dark:text-white"
                >
                    {renderColumnHeader(columnUid)}
                </TableColumn>
            ))}
        </TableHeader>
    );

    // Table body
    const tableBody = (
        <TableBody emptyContent={contents?.components?.collectionTable?.emptyContent || "No items found"}>
            {filteredEntries
                .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                .map((entry, index) => (
                    <TableRow key={entry.uid || entry.identifier || `row-${index}`}>
                        {visibleColumns.map((columnUid) => renderCell(entry, columnUid))}
                    </TableRow>
                ))}
        </TableBody>
    );

    // Pagination
    const pagination = totalPages > 1 ? (
        <div className="flex w-full justify-center py-4">
            <Pagination
                isCompact
                showControls
                showShadow
                page={page}
                total={totalPages}
                onChange={handlePageChange}
                classNames={{
                    base: "mb-2",
                    prev: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                    next: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                    item: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                    forwardIcon: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                    ellipsis: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                    chevronNext: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                }}
            />
        </div>
    ) : null;

    return (
        <div className="space-y-4">
            {tableControls}
            <Card>
                <CardBody className="p-0">
                    <Table
                        shadow="none"
                        classNames={{
                            table: "dark:bg-gray-900 bg-gray-100 dark:text-white",
                            wrapper: "dark:bg-gray-900 bg-gray-100 rounded-lg p-4"
                        }}
                    >
                        {tableHeader}
                        {tableBody}
                    </Table>
                    {pagination}
                </CardBody>
            </Card>
        </div>
    );
}