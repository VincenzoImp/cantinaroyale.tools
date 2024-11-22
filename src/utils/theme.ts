// src/utils/theme.ts

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

export const themeColors = {
    light: {
        background: 'bg-slate-50',
        surface: 'bg-white',
        surfaceElevated: 'bg-gray-50',
        primary: 'bg-blue-600',
        primaryHover: 'hover:bg-blue-700',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        textMuted: 'text-gray-500',
        border: 'border-gray-200',
        borderHover: 'hover:border-gray-300',
        shadow: 'shadow-gray-200',
    },
    dark: {
        background: 'bg-slate-900',
        surface: 'bg-slate-800',
        surfaceElevated: 'bg-gray-800',
        primary: 'bg-blue-500',
        primaryHover: 'hover:bg-blue-600',
        text: 'text-slate-100',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        border: 'border-slate-600',
        borderHover: 'hover:border-slate-500',
        shadow: 'shadow-slate-900',
    }
} as const;

// Responsive theme classes for common UI patterns
export const themeClasses = {
    // Card styling
    card: 'bg-theme-surface border border-theme-border rounded-lg shadow-lg transition-all duration-300',

    // Button variants
    buttonPrimary: 'btn-primary transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    buttonSecondary: 'btn-secondary transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',

    // Navigation
    navLink: 'nav-link transition-colors duration-200',
    navLinkActive: 'nav-link active font-medium',

    // Forms
    input: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200',

    // Text variants
    textPrimary: 'text-theme-text',
    textSecondary: 'text-theme-muted',
    textAccent: 'text-theme-primary',

    // Layout
    pageBackground: 'bg-theme-background min-h-screen',
    containerBackground: 'bg-theme-surface',
} as const;

// Helper function to get system theme preference
export const getSystemTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Helper function to get stored theme or system preference
export const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';

    try {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
        return storedTheme || getSystemTheme();
    } catch {
        return getSystemTheme();
    }
};

// Helper function to apply theme to document
export const applyTheme = (theme: Theme): void => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
};

// Helper function to save theme preference
export const saveThemePreference = (theme: Theme): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        console.warn('Failed to save theme preference:', error);
    }
};

// Theme-aware className utilities
export const cn = (...classes: (string | undefined | false | null)[]): string => {
    return classes.filter(Boolean).join(' ');
};

// Color scheme configurations for charts and data visualization
export const chartColors = {
    light: {
        primary: '#3b82f6',
        secondary: '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        background: '#ffffff',
        text: '#1f2937',
        grid: '#f3f4f6',
    },
    dark: {
        primary: '#60a5fa',
        secondary: '#9ca3af',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        background: '#1e293b',
        text: '#f1f5f9',
        grid: '#374151',
    },
};

// Animation classes for theme transitions
export const transitionClasses = {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-300 ease-in-out',
    slow: 'transition-all duration-500 ease-in-out',
    colors: 'transition-colors duration-200 ease-in-out',
    transform: 'transition-transform duration-200 ease-in-out',
};