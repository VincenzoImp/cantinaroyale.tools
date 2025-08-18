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
                        return price.toFixed(2).replace(/\.00$/, "");
                    }
                    break;
                case "level":
                case "stars":
                case "experience":
                    if (typeof value === "number" || !isNaN(parseFloat(value))) {
                        return parseFloat(value).toString();
                    }
                    break;
                default:
                    return value;
            }
        } catch (error) {
            console.error(`Error formatting value for column ${columnUid}:`, error);
        }

        return value;
    }, []);

    // Get unique values for filterable columns
    const getUniqueValues = React.useCallback((columnUid: string): string[] => {
        try {
            const values = new Set<string>();
            tableEntries.forEach((entry) => {
                const value = entry[columnUid];
                if (value !== null && value !== undefined && value !== "") {
                    values.add(String(value));
                }
            });
            return Array.from(values).sort();
        } catch (error) {
            console.error(`Error getting unique values for column ${columnUid}:`, error);
            return [];
        }
    }, [tableEntries]);

    // Filter and sort entries
    const filteredEntries = React.useMemo(() => {
        try {
            let result = [...tableEntries];

            // Apply searchable filters
            Object.entries(filterStates.searchable).forEach(([columnUid, searchTerm]) => {
                if (searchTerm && visibleColumns.includes(columnUid)) {
                    result = result.filter((entry) => {
                        const value = formatDisplayValue(entry[columnUid], columnUid);
                        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                    });
                }
            });

            // Apply filterable filters
            Object.entries(filterStates.filterable).forEach(([columnUid, filterValues]) => {
                if (filterValues.length > 0 && visibleColumns.includes(columnUid)) {
                    result = result.filter((entry) => {
                        const value = String(entry[columnUid] || "");
                        return filterValues.includes(value);
                    });
                }
            });

            // Apply range filters
            Object.entries(filterStates.rangeble).forEach(([columnUid, range]) => {
                if ((range.min || range.max) && visibleColumns.includes(columnUid)) {
                    result = result.filter((entry) => {
                        const value = parseFloat(entry[columnUid]);
                        if (isNaN(value)) return false;

                        const min = range.min ? parseFloat(range.min) : -Infinity;
                        const max = range.max ? parseFloat(range.max) : Infinity;

                        return value >= min && value <= max;
                    });
                }
            });

            // Apply sorting
            filterStates.sortable.forEach(({ column, direction }) => {
                if (visibleColumns.includes(column)) {
                    result.sort((a, b) => {
                        const valA = formatDisplayValue(a[column], column);
                        const valB = formatDisplayValue(b[column], column);

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
                }
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
        if (!column) return columnUid;

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
                    className="w-80 max-h-96 overflow-y-auto bg-theme-surface border-theme-border"
                    variant="flat"
                >
                    {/* Search Section */}
                    {column.searchable ? (
                        <DropdownItem
                            key="search-section"
                            isReadOnly
                            className="p-3 bg-theme-surface"
                            textValue="Search section"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-theme-muted">Search</label>
                                <Input
                                    size="sm"
                                    placeholder={`Search ${column.name.toLowerCase()}...`}
                                    value={filterStates.searchable[columnUid] || ""}
                                    onChange={(e) => handleSearch(columnUid, e.target.value)}
                                    className="bg-theme-surface text-theme-text"
                                />
                            </div>
                        </DropdownItem>
                    ) : null}

                    {/* Sort Section */}
                    {column.sortable ? (
                        <>
                            <DropdownItem
                                key="sort-asc"
                                onClick={() => handleSort(columnUid, "asc")}
                                className="bg-theme-surface text-theme-text hover:bg-theme-surfaceElevated"
                            >
                                Sort Ascending
                            </DropdownItem>
                            <DropdownItem
                                key="sort-desc"
                                onClick={() => handleSort(columnUid, "desc")}
                                className="bg-theme-surface text-theme-text hover:bg-theme-surfaceElevated"
                            >
                                Sort Descending
                            </DropdownItem>
                        </>
                    ) : null}

                    {/* Filter Section */}
                    {column.filterable ? (
                        <DropdownItem
                            key="filter-section"
                            isReadOnly
                            className="p-3 bg-theme-surface"
                            textValue="Filter section"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-theme-muted">Filters</label>
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                    {getUniqueValues(columnUid).map((value) => (
                                        <div key={value} className="flex items-center justify-between">
                                            <span className="text-sm text-theme-text truncate">{value}</span>
                                            <Switch
                                                size="sm"
                                                isSelected={filterStates.filterable[columnUid]?.includes(value)}
                                                onChange={(isSelected) => {
                                                    if (isSelected) {
                                                        handleFilterAdd(columnUid, value);
                                                    } else {
                                                        handleFilterRemove(columnUid, value);
                                                    }
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </DropdownItem>
                    ) : null}

                    {/* Range Section */}
                    {column.rangeble ? (
                        <DropdownItem
                            key="range-section"
                            isReadOnly
                            className="p-3 bg-theme-surface"
                            textValue="Range section"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-theme-muted">Range</label>
                                <div className="flex gap-2">
                                    <Input
                                        size="sm"
                                        placeholder="Min"
                                        type="number"
                                        value={filterStates.rangeble[columnUid]?.min || ""}
                                        onChange={(e) => handleRange(columnUid, {
                                            ...filterStates.rangeble[columnUid],
                                            min: e.target.value
                                        })}
                                        className="bg-theme-surface text-theme-text"
                                    />
                                    <Input
                                        size="sm"
                                        placeholder="Max"
                                        type="number"
                                        value={filterStates.rangeble[columnUid]?.max || ""}
                                        onChange={(e) => handleRange(columnUid, {
                                            ...filterStates.rangeble[columnUid],
                                            max: e.target.value
                                        })}
                                        className="bg-theme-surface text-theme-text"
                                    />
                                </div>
                            </div>
                        </DropdownItem>
                    ) : null}

                    {/* Clear Section */}
                    {hasFilters ? (
                        <DropdownItem
                            key="clear-all-section"
                            isReadOnly
                            className="p-3 bg-theme-surface"
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
                    <Chip variant="light" className="bg-theme-surface text-theme-text border-theme-border">
                        {displayValue}
                    </Chip>
                </TableCell>
            );
        } catch (error) {
            console.error(`Error rendering cell for column ${columnUid}:`, error);
            return (
                <TableCell key={columnUid}>
                    <Chip variant="light" className="bg-theme-surface text-theme-text border-theme-border">
                        Error
                    </Chip>
                </TableCell>
            );
        }
    }, [type, formatDisplayValue]);

    // Table controls
    const tableControls = (
        <Card className="mb-4 bg-theme-surface border-theme-border">
            <CardBody className="p-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <span className="text-sm text-theme-muted">
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
                                <Button variant="bordered" size="sm" className="bg-theme-surface text-theme-text border-theme-border">
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
                                className="bg-theme-surface border-theme-border"
                            >
                                {tableColumns.map((column) => (
                                    <DropdownItem
                                        key={column.uid}
                                        className="bg-theme-surface text-theme-text hover:bg-theme-surfaceElevated"
                                    >
                                        {column.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>

                        {/* Rows per page */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-theme-muted">Rows:</span>
                            <Select
                                size="sm"
                                selectedKeys={[rowsPerPage.toString()]}
                                onSelectionChange={(keys) => {
                                    const value = Array.from(keys)[0] as string;
                                    handleRowsPerPageChange(parseInt(value));
                                }}
                                className="w-20"
                                classNames={{
                                    trigger: "bg-theme-surface text-theme-text border-theme-border",
                                    popoverContent: "bg-theme-surface border-theme-border"
                                }}
                            >
                                {(variables?.tableInfo?.nftsPerPage?.options || [10, 25, 50, 100]).map((option) => (
                                    <SelectItem
                                        key={option.toString()}
                                        className="bg-theme-surface text-theme-text hover:bg-theme-surfaceElevated"
                                    >
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
                    className="bg-theme-surface text-theme-text border-theme-border"
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
                    prev: "bg-theme-surface text-theme-text border-theme-border hover:bg-theme-surfaceElevated",
                    next: "bg-theme-surface text-theme-text border-theme-border hover:bg-theme-surfaceElevated",
                    item: "bg-theme-surface text-theme-text border-theme-border hover:bg-theme-surfaceElevated",
                    forwardIcon: "bg-theme-surface text-theme-text",
                    ellipsis: "bg-theme-surface text-theme-text",
                    chevronNext: "bg-theme-surface text-theme-text",
                    cursor: "bg-blue-600 text-white hover:bg-blue-700"
                }}
            />
        </div>
    ) : null;

    return (
        <div className="space-y-4">
            {tableControls}
            <Card className="bg-theme-surface border-theme-border">
                <CardBody className="p-0">
                    <Table
                        shadow="none"
                        classNames={{
                            table: "bg-theme-surface text-theme-text",
                            wrapper: "bg-theme-surface border-theme-border rounded-lg p-4"
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