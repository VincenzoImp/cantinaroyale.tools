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
import { contents, variables } from "@/lib/data";

// Complete TypeScript interfaces
interface TableColumn {
    uid: string;
    name: string;
    searchable: boolean;
    sortable: boolean;
    filterable: boolean;
    rangeable: boolean;
}

interface TableEntry {
    [key: string]: any;
    uid?: string;
    identifier?: string;
}

interface SortConfig {
    column: string;
    direction: "asc" | "desc";
    priority: number;
}


interface FilterStates {
    searchable: { [key: string]: string };
    sortable: SortConfig[];
    filterable: { [key: string]: string[] };
    rangeable: { [key: string]: { min: string; max: string } };
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
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);


    // URL parameter management
    const updateURL = React.useCallback((filterStates: FilterStates, page: number, rowsPerPage: number, visibleColumns: string[]) => {
        try {
            const params = new URLSearchParams();

            // Add searchable filters
            Object.entries(filterStates.searchable).forEach(([key, value]) => {
                if (value) params.set(`search_${key}`, value);
            });

            // Add sortable filters
            if (filterStates.sortable.length > 0) {
                const sortString = filterStates.sortable
                    .sort((a, b) => a.priority - b.priority)
                    .map(s => `${s.column}:${s.direction}:${s.priority}`)
                    .join(',');
                params.set('sort', sortString);
            }

            // Add filterable filters
            Object.entries(filterStates.filterable).forEach(([key, values]) => {
                if (values.length > 0) {
                    params.set(`filter_${key}`, values.join(','));
                }
            });

            // Add rangeable filters
            Object.entries(filterStates.rangeable).forEach(([key, range]) => {
                if (range.min || range.max) {
                    params.set(`range_${key}`, `${range.min || ''}-${range.max || ''}`);
                }
            });


            // Add pagination
            if (page > 1) params.set('page', page.toString());
            if (rowsPerPage !== INITIAL_ROWS_PER_PAGE) params.set('rows', rowsPerPage.toString());

            // Add visible columns
            if (visibleColumns.length !== tableColumns.length) {
                params.set('columns', visibleColumns.join(','));
            }

            const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
            window.history.replaceState({}, '', newURL);
        } catch (error) {
            console.error('Error updating URL:', error);
        }
    }, [INITIAL_ROWS_PER_PAGE, tableColumns.length]);

    // Initialize filter states with proper type safety
    const initializeFilterStates = React.useCallback((): FilterStates => {
        const initialStates: FilterStates = {
            searchable: {},
            sortable: [],
            filterable: {},
            rangeable: {},
        };

        tableColumns.forEach((column) => {
            if (column.searchable) {
                initialStates.searchable[column.uid] = "";
            }
            if (column.filterable) {
                initialStates.filterable[column.uid] = [];
            }
            if (column.rangeable) {
                initialStates.rangeable[column.uid] = { min: "", max: "" };
            }
        });

        return initialStates;
    }, [tableColumns]);

    // Load state from URL parameters
    const loadStateFromURL = React.useCallback(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const newFilterStates = initializeFilterStates();

            // Load searchable filters
            Object.keys(newFilterStates.searchable).forEach(key => {
                const value = params.get(`search_${key}`);
                if (value) newFilterStates.searchable[key] = value;
            });

            // Load sortable filters
            const sortParam = params.get('sort');
            if (sortParam) {
                newFilterStates.sortable = sortParam.split(',').map(sortStr => {
                    const [column, direction, priority] = sortStr.split(':');
                    return { column, direction: direction as 'asc' | 'desc', priority: parseInt(priority) };
                });
            }

            // Load filterable filters
            Object.keys(newFilterStates.filterable).forEach(key => {
                const value = params.get(`filter_${key}`);
                if (value) newFilterStates.filterable[key] = value.split(',');
            });

            // Load rangeable filters
            Object.keys(newFilterStates.rangeable).forEach(key => {
                const value = params.get(`range_${key}`);
                if (value) {
                    const [min, max] = value.split('-');
                    newFilterStates.rangeable[key] = { min: min || '', max: max || '' };
                }
            });


            return newFilterStates;
        } catch (error) {
            console.error('Error loading state from URL:', error);
            return initializeFilterStates();
        }
    }, [initializeFilterStates]);

    // Initialize state from URL or defaults
    const [filterStates, setFilterStates] = React.useState<FilterStates>(initializeFilterStates);

    // Load URL parameters on mount
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlState = loadStateFromURL();
            setFilterStates(urlState);

            // Load other state from URL
            const params = new URLSearchParams(window.location.search);
            const urlPage = params.get('page');
            const urlRows = params.get('rows');
            const urlColumns = params.get('columns');

            if (urlPage) setPage(parseInt(urlPage));
            if (urlRows) setRowsPerPage(parseInt(urlRows));
            if (urlColumns) setVisibleColumns(urlColumns.split(','));
        }
    }, [loadStateFromURL]);

    // Update URL when state changes
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            updateURL(filterStates, page, rowsPerPage, visibleColumns);
        }
    }, [filterStates, page, rowsPerPage, visibleColumns, updateURL]);

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
                        return price.toFixed(2);
                    }
                    break;
                case "level":
                case "stars":
                case "experience":
                    if (typeof value === "number" || !isNaN(parseFloat(value))) {
                        return Math.round(parseFloat(value)).toString();
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

    // Display formatting function - only round at final visualization
    const formatDisplayOnly = React.useCallback((value: any, columnUid: string): any => {
        if (value === null || value === undefined || value === "") {
            return "-";
        }

        // Handle owner address shortening
        if (columnUid === "owner" && typeof value === "string" && value.length > 12) {
            return `${value.slice(0, 6)}...${value.slice(-6)}`;
        }

        // Only round numeric values at the final display step
        if (typeof value === "number" || (!isNaN(parseFloat(value)) && value !== null && value !== "")) {
            const numValue = parseFloat(value);
            // Round to 2 decimal places for display
            return numValue.toFixed(2);
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
                if (searchTerm && searchTerm.trim() !== "" && visibleColumns.includes(columnUid)) {
                    result = result.filter((entry) => {
                        const value = entry[columnUid];
                        // Exclude rows with no value for this specific filter
                        if (value === null || value === undefined || value === "") return false;
                        const displayValue = formatDisplayValue(value, columnUid);
                        return String(displayValue).toLowerCase().includes(searchTerm.toLowerCase());
                    });
                }
            });

            // Apply filterable filters
            Object.entries(filterStates.filterable).forEach(([columnUid, filterValues]) => {
                if (filterValues && filterValues.length > 0 && visibleColumns.includes(columnUid)) {
                    result = result.filter((entry) => {
                        const value = entry[columnUid];
                        // Exclude rows with no value for this specific filter
                        if (value === null || value === undefined || value === "") return false;
                        return filterValues.includes(String(value));
                    });
                }
            });

            // Apply range filters
            Object.entries(filterStates.rangeable).forEach(([columnUid, range]) => {
                if (range && (range.min || range.max) && visibleColumns.includes(columnUid)) {
                    result = result.filter((entry) => {
                        const value = entry[columnUid];
                        // Exclude rows with no value for this specific filter
                        if (value === null || value === undefined || value === "") return false;

                        const numValue = parseFloat(String(value));
                        if (isNaN(numValue)) return false;

                        const min = range.min && range.min.trim() !== "" ? parseFloat(range.min) : -Infinity;
                        const max = range.max && range.max.trim() !== "" ? parseFloat(range.max) : Infinity;

                        // Handle edge cases
                        if (min === -Infinity && max === Infinity) return true;
                        if (min > max) return false;

                        return numValue >= min && numValue <= max;
                    });
                }
            });



            // Apply multi-level sorting with priority
            if (filterStates.sortable.length > 0) {
                const sortedSorts = [...filterStates.sortable].sort((a, b) => a.priority - b.priority);

                result.sort((a, b) => {
                    for (const sortConfig of sortedSorts) {
                        if (!visibleColumns.includes(sortConfig.column)) continue;

                        const valA = a[sortConfig.column];
                        const valB = b[sortConfig.column];

                        // Handle null/undefined values
                        if (valA === null || valA === undefined) {
                            if (valB === null || valB === undefined) continue;
                            return sortConfig.direction === "asc" ? 1 : -1;
                        }
                        if (valB === null || valB === undefined) {
                            return sortConfig.direction === "asc" ? -1 : 1;
                        }

                        const displayA = formatDisplayValue(valA, sortConfig.column);
                        const displayB = formatDisplayValue(valB, sortConfig.column);

                        const numA = parseFloat(String(displayA));
                        const numB = parseFloat(String(displayB));

                        let comparison = 0;
                        if (!isNaN(numA) && !isNaN(numB)) {
                            comparison = numA - numB;
                        } else {
                            const strA = String(displayA).toLowerCase();
                            const strB = String(displayB).toLowerCase();
                            comparison = strA.localeCompare(strB);
                        }

                        if (comparison !== 0) {
                            return sortConfig.direction === "asc" ? comparison : -comparison;
                        }
                    }
                    return 0;
                });
            }

            return result;
        } catch (error) {
            console.error("Error filtering entries:", error);
            return tableEntries;
        }
    }, [tableEntries, filterStates, visibleColumns, formatDisplayValue]);

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
            setIsLoading(true);
            setError(null);
            setFilterStates((prev) => ({
                ...prev,
                searchable: { ...prev.searchable, [column]: value }
            }));
            setPage(1);
        } catch (error) {
            console.error("Error handling search:", error);
            setError("Failed to apply search filter");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSort = React.useCallback((columnUid: string, direction: "asc" | "desc", priority?: number) => {
        try {
            setIsLoading(true);
            setError(null);
            setFilterStates((prev) => {
                const existingSort = prev.sortable.find(s => s.column === columnUid);
                const newPriority = priority ?? (prev.sortable.length > 0 ? Math.max(...prev.sortable.map(s => s.priority)) + 1 : 1);

                if (existingSort) {
                    // Update existing sort - only one option per column
                    return {
                        ...prev,
                        sortable: prev.sortable.map(s =>
                            s.column === columnUid
                                ? { ...s, direction, priority: newPriority }
                                : s
                        )
                    };
                } else {
                    // Add new sort - only one option per column
                    return {
                        ...prev,
                        sortable: [...prev.sortable, { column: columnUid, direction, priority: newPriority }]
                    };
                }
            });
        } catch (error) {
            console.error("Error handling sort:", error);
            setError("Failed to apply sort");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeSort = React.useCallback((columnUid: string) => {
        try {
            setIsLoading(true);
            setError(null);
            setFilterStates((prev) => ({
                ...prev,
                sortable: prev.sortable.filter(s => s.column !== columnUid)
            }));
        } catch (error) {
            console.error("Error removing sort:", error);
            setError("Failed to remove sort");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFilterAdd = React.useCallback((columnUid: string, value: string) => {
        try {
            setIsLoading(true);
            setError(null);
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
            setError("Failed to add filter");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFilterRemove = React.useCallback((columnUid: string, value: string) => {
        try {
            setIsLoading(true);
            setError(null);
            setFilterStates((prev) => ({
                ...prev,
                filterable: {
                    ...prev.filterable,
                    [columnUid]: prev.filterable[columnUid]?.filter((val) => val !== value) || []
                }
            }));
            setPage(1);
        } catch (error) {
            console.error("Error removing filter:", error);
            setError("Failed to remove filter");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleRange = React.useCallback((columnUid: string, range: { min: string; max: string }) => {
        try {
            setIsLoading(true);
            setError(null);
            setFilterStates((prev) => ({
                ...prev,
                rangeable: {
                    ...prev.rangeable,
                    [columnUid]: {
                        min: range.min || "",
                        max: range.max || ""
                    }
                }
            }));
            setPage(1);
        } catch (error) {
            console.error("Error handling range:", error);
            setError("Failed to apply range filter");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearColumnFilters = React.useCallback((columnUid: string) => {
        try {
            setIsLoading(true);
            setError(null);
            setFilterStates((prev) => ({
                ...prev,
                searchable: { ...prev.searchable, [columnUid]: "" },
                sortable: prev.sortable.filter((state) => state.column !== columnUid),
                filterable: { ...prev.filterable, [columnUid]: [] },
                rangeable: { ...prev.rangeable, [columnUid]: { min: "", max: "" } }
            }));
            setPage(1);
        } catch (error) {
            console.error("Error clearing filters:", error);
            setError("Failed to clear filters");
        } finally {
            setIsLoading(false);
        }
    }, []);


    const clearAllFilters = React.useCallback(() => {
        try {
            setIsLoading(true);
            setError(null);
            setFilterStates(initializeFilterStates());
            setPage(1);
        } catch (error) {
            console.error("Error clearing all filters:", error);
            setError("Failed to clear all filters");
        } finally {
            setIsLoading(false);
        }
    }, [initializeFilterStates]);

    // Filter presets management
    const saveFilterPreset = React.useCallback((presetName: string) => {
        try {
            if (typeof window === 'undefined') return false;

            const preset = {
                name: presetName,
                filterStates,
                visibleColumns,
                rowsPerPage,
                timestamp: new Date().toISOString()
            };

            const existingPresets = JSON.parse(localStorage.getItem('filterPresets') || '[]');
            const updatedPresets = [...existingPresets.filter((p: any) => p.name !== presetName), preset];
            localStorage.setItem('filterPresets', JSON.stringify(updatedPresets));

            return true;
        } catch (error) {
            console.error('Error saving filter preset:', error);
            setError('Failed to save filter preset');
            return false;
        }
    }, [filterStates, visibleColumns, rowsPerPage]);

    const loadFilterPreset = React.useCallback((presetName: string) => {
        try {
            if (typeof window === 'undefined') return false;

            const presets = JSON.parse(localStorage.getItem('filterPresets') || '[]');
            const preset = presets.find((p: any) => p.name === presetName);

            if (preset) {
                setFilterStates(preset.filterStates);
                setVisibleColumns(preset.visibleColumns);
                setRowsPerPage(preset.rowsPerPage);
                setPage(1);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error loading filter preset:', error);
            setError('Failed to load filter preset');
            return false;
        }
    }, []);

    const getFilterPresets = React.useCallback(() => {
        try {
            if (typeof window === 'undefined') return [];
            return JSON.parse(localStorage.getItem('filterPresets') || '[]');
        } catch (error) {
            console.error('Error getting filter presets:', error);
            return [];
        }
    }, []);

    const deleteFilterPreset = React.useCallback((presetName: string) => {
        try {
            if (typeof window === 'undefined') return false;

            setIsLoading(true);
            setError(null);

            const existingPresets = JSON.parse(localStorage.getItem('filterPresets') || '[]');
            const updatedPresets = existingPresets.filter((p: any) => p.name !== presetName);
            localStorage.setItem('filterPresets', JSON.stringify(updatedPresets));

            return true;
        } catch (error) {
            console.error('Error deleting filter preset:', error);
            setError('Failed to delete filter preset');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);


    const handlePageChange = React.useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleRowsPerPageChange = React.useCallback((newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(1);
    }, []);

    // Helper function to render dropdown items
    const renderDropdownItems = React.useCallback((columnUid: string, column: any) => {
        const activeSort = filterStates.sortable.find(s => s.column === columnUid);
        const hasFilters = column.searchable || column.sortable || column.filterable || column.rangeable;

        const items = [];

        // Header with active sort info
        if (activeSort) {
            items.push(
                <DropdownItem
                    key="sort-info"
                    isReadOnly
                    className="p-3 mb-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50"
                    textValue="Sort info"
                >
                    <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Sort Priority {activeSort.priority}: {activeSort.direction === 'asc' ? 'Ascending' : 'Descending'}
                        </span>
                        <Button
                            size="sm"
                            variant="light"
                            className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 p-1"
                            onClick={() => removeSort(columnUid)}
                        >
                            ×
                        </Button>
                    </div>
                </DropdownItem>
            );
        }

        // Sort Section
        if (column.sortable) {
            items.push(
                <DropdownItem
                    key="sort-section"
                    isReadOnly
                    className="p-4 mb-3 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50"
                    textValue="Sort section"
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sorting Options
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                size="sm"
                                variant={activeSort?.direction === 'asc' ? 'solid' : 'bordered'}
                                color={activeSort?.direction === 'asc' ? 'primary' : 'default'}
                                onClick={() => handleSort(columnUid, "asc")}
                                className="text-xs"
                                startContent={<span>↑</span>}
                            >
                                Ascending
                            </Button>
                            <Button
                                size="sm"
                                variant={activeSort?.direction === 'desc' ? 'solid' : 'bordered'}
                                color={activeSort?.direction === 'desc' ? 'primary' : 'default'}
                                onClick={() => handleSort(columnUid, "desc")}
                                className="text-xs"
                                startContent={<span>↓</span>}
                            >
                                Descending
                            </Button>
                        </div>
                        {activeSort && (
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600 dark:text-gray-400">Priority:</label>
                                <Select
                                    size="sm"
                                    selectedKeys={[activeSort.priority.toString()]}
                                    onSelectionChange={(keys: any) => {
                                        const newPriority = parseInt(Array.from(keys)[0] as string);
                                        handleSort(columnUid, activeSort.direction, newPriority);
                                    }}
                                    className="w-20"
                                >
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <SelectItem key={num.toString()}>
                                            {num}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </div>
                </DropdownItem>
            );
        }

        // Search Section
        if (column.searchable) {
            items.push(
                <DropdownItem
                    key="search-section"
                    isReadOnly
                    className="p-4 mb-3 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50"
                    textValue="Search section"
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Basic Search
                            </label>
                        </div>
                        <Input
                            size="sm"
                            placeholder={`Search ${column.name.toLowerCase()}...`}
                            value={filterStates.searchable[columnUid] || ""}
                            onChange={(e) => handleSearch(columnUid, e.target.value)}
                            classNames={{
                                input: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                                inputWrapper: "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl"
                            }}
                        />
                    </div>
                </DropdownItem>
            );

        }

        // Filter Section (Categorical filters)
        if (column.filterable) {
            items.push(
                <DropdownItem
                    key="filter-section"
                    isReadOnly
                    className="p-4 mb-3 bg-green-50/30 dark:bg-green-900/10 rounded-xl border border-green-200/50 dark:border-green-800/50"
                    textValue="Filter section"
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Categorical Filters
                            </label>
                            {filterStates.filterable[columnUid]?.length > 0 && (
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                                    {filterStates.filterable[columnUid].length} selected
                                </span>
                            )}
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                            {getUniqueValues(columnUid).map((value) => (
                                <div key={value} className="flex items-center justify-between p-2 hover:bg-white dark:hover:bg-gray-600 transition-colors rounded-lg">
                                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate flex-1 mr-3">{value}</span>
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
                                        classNames={{
                                            base: "inline-flex flex-row-reverse max-w-md",
                                            wrapper: "bg-gray-200 dark:bg-gray-600",
                                            thumb: "bg-white"
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </DropdownItem>
            );
        }

        // Range Section (Numeric filters)
        if (column.rangeable) {
            items.push(
                <DropdownItem
                    key="range-section"
                    isReadOnly
                    className="p-4 mb-3 bg-orange-50/30 dark:bg-orange-900/10 rounded-xl border border-orange-200/50 dark:border-orange-800/50"
                    textValue="Range section"
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Numeric Range
                            </label>
                            {(filterStates.rangeable[columnUid]?.min || filterStates.rangeable[columnUid]?.max) && (
                                <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                                    Active
                                </span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Minimum</label>
                                    <Input
                                        size="sm"
                                        placeholder="Min value"
                                        type="number"
                                        value={filterStates.rangeable[columnUid]?.min || ""}
                                        onChange={(e) => handleRange(columnUid, {
                                            ...filterStates.rangeable[columnUid],
                                            min: e.target.value
                                        })}
                                        classNames={{
                                            input: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                                            inputWrapper: "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 rounded-xl"
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Maximum</label>
                                    <Input
                                        size="sm"
                                        placeholder="Max value"
                                        type="number"
                                        value={filterStates.rangeable[columnUid]?.max || ""}
                                        onChange={(e) => handleRange(columnUid, {
                                            ...filterStates.rangeable[columnUid],
                                            max: e.target.value
                                        })}
                                        classNames={{
                                            input: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                                            inputWrapper: "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 rounded-xl"
                                        }}
                                    />
                                </div>
                            </div>
                            {(filterStates.rangeable[columnUid]?.min || filterStates.rangeable[columnUid]?.max) && (
                                <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                                    💡 Range: {filterStates.rangeable[columnUid]?.min || '∞'} to {filterStates.rangeable[columnUid]?.max || '∞'}
                                </div>
                            )}
                        </div>
                    </div>
                </DropdownItem>
            );
        }

        // Clear Section
        if (hasFilters) {
            items.push(
                <DropdownItem
                    key="clear-all-section"
                    isReadOnly
                    className="p-4 mt-3 bg-red-50/30 dark:bg-red-900/10 rounded-xl border border-red-200/50 dark:border-red-800/50"
                    textValue="Clear all section"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Clear Filters
                            </label>
                        </div>
                        <Button
                            size="sm"
                            variant="flat"
                            className="w-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors rounded-xl"
                            onClick={() => clearColumnFilters(columnUid)}
                        >
                            Clear All Filters for {column.name}
                        </Button>
                    </div>
                </DropdownItem>
            );
        }

        return items;
    }, [filterStates, handleSort, handleSearch, removeSort, clearColumnFilters, getUniqueValues, handleFilterAdd, handleFilterRemove, handleRange]);

    // Column header with advanced dropdown
    const renderColumnHeader = React.useCallback((columnUid: string) => {
        const column = tableColumns.find((col) => col.uid === columnUid);
        if (!column) return columnUid;

        const hasFilters = column.searchable || column.sortable || column.filterable || column.rangeable;
        const activeSort = filterStates.sortable.find(s => s.column === columnUid);
        const hasActiveFilters = filterStates.searchable[columnUid] ||
            filterStates.filterable[columnUid]?.length > 0 ||
            activeSort ||
            (filterStates.rangeable[columnUid]?.min || filterStates.rangeable[columnUid]?.max);

        if (!hasFilters) {
            return (
                <div className="flex items-center justify-center">
                    <span className="font-medium text-theme-text text-xs sm:text-sm truncate">{column.name}</span>
                </div>
            );
        }

        return (
            <Dropdown closeOnSelect={false}>
                <DropdownTrigger>
                    <Button
                        variant="light"
                        className="h-auto p-1 sm:p-3 min-w-0 font-medium text-theme-text hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors rounded-xl relative text-xs sm:text-sm"
                        endContent={
                            <div className="flex items-center gap-1">
                                {activeSort && (
                                    <span className="text-xs text-blue-600 dark:text-blue-400">
                                        {activeSort.direction === 'asc' ? '↑' : '↓'}
                                        {activeSort.priority}
                                    </span>
                                )}
                                <span className="text-xs ml-1 text-theme-muted">▼</span>
                            </div>
                        }
                    >
                        <span className="truncate max-w-[60px] sm:max-w-none">{column.name}</span>
                        {/* Active filter indicator */}
                        {hasActiveFilters && (
                            <span className="ml-1 sm:ml-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0"></span>
                        )}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label={`${column.name} filters`}
                    className="w-72 sm:w-80 md:w-96 max-h-[400px] sm:max-h-[600px] overflow-y-auto"
                    variant="flat"
                    classNames={{
                        base: "bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-2 sm:p-3 border border-gray-200 dark:border-gray-700",
                        list: "bg-white dark:bg-gray-800 gap-1"
                    }}
                >
                    {renderDropdownItems(columnUid, column)}
                </DropdownMenu>
            </Dropdown>
        );
    }, [tableColumns, filterStates, renderDropdownItems]);

    // Render table cell
    const renderCell = React.useCallback((entry: TableEntry, columnUid: string) => {
        try {
            let displayValue: any = entry[columnUid];

            if (columnUid === "identifier") {
                displayValue = (
                    <a
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer transition-colors font-medium underline decoration-transparent hover:decoration-current"
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
                        radius="md"
                        className="bg-transparent"
                        fallback={<span className="text-xs">NFT</span>}
                    />
                );
            } else {
                displayValue = formatDisplayOnly(displayValue, columnUid);
            }

            return (
                <TableCell key={columnUid} className="text-theme-text text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2">
                    {displayValue}
                </TableCell>
            );
        } catch (error) {
            console.error(`Error rendering cell for column ${columnUid}:`, error);
            return (
                <TableCell key={columnUid} className="text-red-600 dark:text-red-400">
                    Error
                </TableCell>
            );
        }
    }, [type, formatDisplayOnly]);

    // Table controls - mobile responsive
    const tableControls = (
        <Card className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
            <CardBody className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center gap-4">
                    {/* Left side - Status and filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:flex-1">
                        <div className="bg-blue-50 dark:bg-blue-900/20 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-xl">
                            <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
                                {filteredEntries.length} {contents?.components?.collectionTable?.nfts || "items"}
                                {filteredEntries.length !== tableEntries.length && (
                                    <span className="text-xs ml-1 text-blue-600 dark:text-blue-400 hidden sm:inline">
                                        (filtered from {tableEntries.length})
                                    </span>
                                )}
                            </span>
                        </div>

                        {/* Active Filters Summary */}
                        {Object.values(filterStates.searchable).some(v => v) ||
                            Object.values(filterStates.filterable).some(v => v.length > 0) ||
                            filterStates.sortable.length > 0 ||
                            Object.values(filterStates.rangeable).some(v => v.min || v.max) ? (
                            <div className="flex flex-col gap-1 sm:gap-2 bg-green-50 dark:bg-green-900/20 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></span>
                                    <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                                        Active Filters
                                    </span>
                                </div>

                                {/* Sort Summary */}
                                {filterStates.sortable.length > 0 && (
                                    <div className="text-xs text-green-600 dark:text-green-400 hidden sm:block">
                                        Sort: {filterStates.sortable
                                            .sort((a, b) => a.priority - b.priority)
                                            .map(s => {
                                                const column = tableColumns.find(c => c.uid === s.column);
                                                return `${column?.name || s.column} (${s.direction === 'asc' ? '↑' : '↓'})`;
                                            })
                                            .join(', ')}
                                    </div>
                                )}

                                {/* Filter Count Summary */}
                                <div className="text-xs text-green-600 dark:text-green-400">
                                    {[
                                        Object.values(filterStates.searchable).filter(v => v).length > 0 && `${Object.values(filterStates.searchable).filter(v => v).length} search`,
                                        Object.values(filterStates.filterable).filter(v => v.length > 0).length > 0 && `${Object.values(filterStates.filterable).filter(v => v.length > 0).length} filters`,
                                        Object.values(filterStates.rangeable).filter(v => v.min || v.max).length > 0 && `${Object.values(filterStates.rangeable).filter(v => v.min || v.max).length} ranges`
                                    ].filter(Boolean).join(', ')}
                                </div>
                            </div>
                        ) : null}

                    </div>

                    {/* Right side - Actions and status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:flex-shrink-0">
                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-xl">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Processing...
                                </span>
                            </div>
                        )}

                        {/* Error Indicator */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-xl">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
                                <span className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300 truncate">
                                    {error}
                                </span>
                                <Button
                                    size="sm"
                                    variant="light"
                                    className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 p-1 flex-shrink-0"
                                    onClick={() => setError(null)}
                                >
                                    ×
                                </Button>
                            </div>
                        )}

                        {/* Clear All Filters Button */}
                        <Button
                            size="sm"
                            variant="flat"
                            className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors rounded-xl text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                            onClick={clearAllFilters}
                            isDisabled={Object.values(filterStates.searchable).every(v => !v) &&
                                Object.values(filterStates.filterable).every(v => v.length === 0) &&
                                filterStates.sortable.length === 0 &&
                                Object.values(filterStates.rangeable).every(v => !v.min && !v.max)}
                        >
                            <span className="hidden sm:inline">Clear All Filters</span>
                            <span className="sm:hidden">Clear</span>
                        </Button>


                        {/* Filter Presets */}
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    variant="bordered"
                                    size="sm"
                                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                                >
                                    <span className="hidden sm:inline">💾 Presets</span>
                                    <span className="sm:hidden">💾</span>
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Filter presets"
                                classNames={{
                                    base: "bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-1",
                                    list: "bg-white dark:bg-gray-800"
                                }}
                            >
                                <DropdownItem
                                    key="save-preset"
                                    isReadOnly
                                    className="p-3 mb-2"
                                    textValue="Save preset"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Save Current Filters
                                        </label>
                                        <div className="flex gap-2">
                                            <Input
                                                size="sm"
                                                placeholder="Preset name"
                                                id="preset-name"
                                                classNames={{
                                                    input: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                                                    inputWrapper: "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl"
                                                }}
                                            />
                                            <Button
                                                size="sm"
                                                className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl"
                                                onClick={() => {
                                                    const input = document.getElementById('preset-name') as HTMLInputElement;
                                                    if (input?.value) {
                                                        saveFilterPreset(input.value);
                                                        input.value = '';
                                                    }
                                                }}
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                </DropdownItem>
                                {getFilterPresets().map((preset: any) => (
                                    <DropdownItem
                                        key={preset.name}
                                        isReadOnly
                                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors rounded-xl mx-1 my-1"
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3 flex-1">
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors rounded-xl flex-1 justify-start"
                                                    onClick={() => loadFilterPreset(preset.name)}
                                                >
                                                    <span className="truncate">{preset.name}</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 p-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Are you sure you want to delete the preset "${preset.name}"?`)) {
                                                            deleteFilterPreset(preset.name);
                                                        }
                                                    }}
                                                >
                                                    🗑️
                                                </Button>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                {new Date(preset.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </DropdownItem>
                                ))}

                                {getFilterPresets().length > 0 && (
                                    <DropdownItem
                                        key="clear-all-presets"
                                        isReadOnly
                                        className="p-3 mt-2 bg-red-50/30 dark:bg-red-900/10 rounded-xl border border-red-200/50 dark:border-red-800/50"
                                        textValue="Clear all presets"
                                    >
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            className="w-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors rounded-xl"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete ALL filter presets? This action cannot be undone.')) {
                                                    localStorage.removeItem('filterPresets');
                                                }
                                            }}
                                        >
                                            🗑️ Clear All Presets
                                        </Button>
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </Dropdown>

                        {/* Column Visibility */}
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    variant="bordered"
                                    size="sm"
                                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                                >
                                    <span className="hidden sm:inline">Columns ({visibleColumns.length}/{tableColumns.length})</span>
                                    <span className="sm:hidden">Cols ({visibleColumns.length})</span>
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
                                classNames={{
                                    base: "bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-1",
                                    list: "bg-white dark:bg-gray-800"
                                }}
                            >
                                {tableColumns.map((column) => (
                                    <DropdownItem
                                        key={column.uid}
                                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors rounded-xl mx-1 my-1"
                                    >
                                        {column.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>

                        {/* Rows per page */}
                        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 bg-gray-50 dark:bg-gray-700 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-xl">
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">Rows:</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 sm:hidden">Per page:</span>
                            <Select
                                size="sm"
                                selectedKeys={[rowsPerPage.toString()]}
                                onSelectionChange={(keys: any) => {
                                    const value = Array.from(keys)[0] as string;
                                    handleRowsPerPageChange(parseInt(value));
                                }}
                                className="w-12 sm:w-16 lg:w-20"
                                classNames={{
                                    trigger: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-xl",
                                    popoverContent: "bg-white dark:bg-gray-800 shadow-xl rounded-2xl"
                                }}
                            >
                                {(variables?.tableInfo?.nftsPerPage?.options || [10, 25, 50, 100]).map((option) => (
                                    <SelectItem
                                        key={option.toString()}
                                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl mx-1 my-1"
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

    // Table header - mobile responsive
    const tableHeader = (
        <TableHeader>
            {visibleColumns.map((columnUid) => (
                <TableColumn
                    key={columnUid}
                    align="center"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium py-2 sm:py-4 px-1 sm:px-2 text-xs sm:text-sm"
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
                    <TableRow
                        key={entry.uid || entry.identifier || `row-${index}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                        {visibleColumns.map((columnUid) => renderCell(entry, columnUid))}
                    </TableRow>
                ))}
        </TableBody>
    );

    // Pagination
    const pagination = totalPages > 1 ? (
        <div className="flex w-full justify-center py-6">
            <Pagination
                isCompact
                showControls
                showShadow
                page={page}
                total={totalPages}
                onChange={handlePageChange}
                classNames={{
                    base: "gap-2",
                    prev: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors rounded-xl",
                    next: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors rounded-xl",
                    item: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors rounded-xl",
                    forwardIcon: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                    ellipsis: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                    chevronNext: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                    cursor: "bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 rounded-xl"
                }}
            />
        </div>
    ) : null;

    return (
        <div className="space-y-4 sm:space-y-6">
            {tableControls}
            <Card className="bg-white dark:bg-gray-800 shadow-xl overflow-hidden rounded-2xl">
                <CardBody className="p-0">
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <Table
                            shadow="none"
                            classNames={{
                                table: "bg-white dark:bg-gray-800 min-w-full",
                                wrapper: "bg-white dark:bg-gray-800 rounded-2xl overflow-x-auto",
                                th: "bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-medium",
                                td: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 sm:py-4 px-1 sm:px-4 text-xs sm:text-sm"
                            }}
                        >
                            {tableHeader}
                            {tableBody}
                        </Table>
                    </div>
                    {pagination}
                </CardBody>
            </Card>
        </div>
    );
}