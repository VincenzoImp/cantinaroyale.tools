// src/components/footer.tsx
import { contents } from "@/lib/data";
import SimpleThemeToggle from './SimpleThemeToggle';

const footer = contents.components.footer;

export default function Footer() {
    return (
        <div className="w-full mx-auto max-w-screen-xl bg-theme-surface border border-theme-border rounded-lg m-4 p-4 shadow-lg transition-all duration-300">
            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center justify-between">
                <span className="text-sm text-theme-muted">
                    {footer.madeForText}{" "}
                    <a
                        href={footer.madeForLink}
                        className="underline hover:text-theme-primary transition-colors duration-200"
                    >
                        {footer.madeForName}
                    </a>
                </span>

                {/* Centered Theme Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-theme-muted">
                        Theme
                    </span>
                    <SimpleThemeToggle />
                </div>

                <span className="text-sm text-theme-muted">
                    {footer.donationText}{" "}
                    <a
                        href={footer.donationLink}
                        className="underline hover:text-theme-primary transition-colors duration-200"
                    >
                        {footer.donationName}
                    </a>
                </span>
            </div>

            {/* Mobile Layout */}
            <div className="sm:hidden flex flex-col items-center space-y-3">
                <span className="text-sm text-theme-muted text-center">
                    {footer.madeForText}{" "}
                    <a
                        href={footer.madeForLink}
                        className="underline hover:text-theme-primary transition-colors duration-200"
                    >
                        {footer.madeForName}
                    </a>
                </span>

                <span className="text-sm text-theme-muted text-center">
                    {footer.donationText}{" "}
                    <a
                        href={footer.donationLink}
                        className="underline hover:text-theme-primary transition-colors duration-200"
                    >
                        {footer.donationName}
                    </a>
                </span>

                {/* Centered Theme Toggle on Mobile */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-theme-muted">
                        Theme
                    </span>
                    <SimpleThemeToggle />
                </div>
            </div>
        </div>
    );
}