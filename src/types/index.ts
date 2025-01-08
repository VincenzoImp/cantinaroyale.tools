// src/types/index.ts

export interface CollectionInfo {
    collection: string;
    name: string;
    ticker: string;
    holderCount: number;
    nftCount: number;
    assets: {
        website: string;
        description: string;
    };
}

export interface CollectionData {
    info: CollectionInfo;
    nfts: Record<string, any>;
}

export interface AppData {
    [collectionName: string]: CollectionData;
}

export interface WeaponData {
    damage: number;
    cooldownAfterLastBullet: number;
    reloadTime: number;
    ammo: number;
    projectile_speed: number;
    projectile_range: number;
    projectile_spawn_delay_after_shot: number;
}

export interface CharacterData {
    name: string;
    level: number;
    health: number;
    shield: number;
    speed: number;
    ultimate: {
        name: string;
        description: string;
        cooldown: number;
    };
}

export interface NFTData {
    identifier: string;
    name: string;
    description?: string;
    image?: string;
    attributes?: Array<{
        trait_type: string;
        value: string | number;
    }>;
    [key: string]: any;
}

export interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, item: any) => React.ReactNode;
}

export interface TableEntry {
    [key: string]: any;
}

export interface CollectionTableProps {
    tableColumns: TableColumn[];
    tableEntries: TableEntry[];
    type: 'characters' | 'weapons';
}

export interface Theme {
    light: 'light';
    dark: 'dark';
}

export interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

// Error types
export interface AppError {
    message: string;
    code?: string;
    details?: any;
}

export interface LoadingState {
    isLoading: boolean;
    error?: AppError;
}

// API Response types
export interface ApiResponse<T = any> {
    data?: T;
    error?: AppError;
    loading: boolean;
}

// Chart types
export interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: number;
    }>;
}

export interface ChartOptions {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
        legend?: {
            position?: 'top' | 'bottom' | 'left' | 'right';
            labels?: {
                color?: string;
                font?: {
                    size?: number;
                    weight?: string;
                };
            };
        };
        tooltip?: {
            backgroundColor?: string;
            titleColor?: string;
            bodyColor?: string;
            borderColor?: string;
            borderWidth?: number;
        };
    };
    scales?: {
        r?: {
            beginAtZero?: boolean;
            min?: number;
            max?: number;
            angleLines?: {
                color?: string;
                lineWidth?: number;
            };
            grid?: {
                color?: string;
                lineWidth?: number;
            };
            pointLabels?: {
                color?: string;
                font?: {
                    size?: number;
                    weight?: string;
                };
            };
            ticks?: {
                backdropColor?: string;
                color?: string;
                font?: {
                    size?: number;
                };
                stepSize?: number;
            };
        };
    };
    elements?: {
        line?: {
            borderWidth?: number;
            tension?: number;
        };
        point?: {
            radius?: number;
            hoverRadius?: number;
        };
    };
    interaction?: {
        intersect?: boolean;
    };
}
