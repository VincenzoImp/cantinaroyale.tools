"use client";

import { contents, variables, identifiers } from "../lib/data";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import SimpleThemeToggle from "./SimpleThemeToggle";
import ErrorBoundary from "./ErrorBoundary";

const navbar = contents.components.navbar;

export default function Navbar({ activeItemID }: { activeItemID: string }) {
    const [activeToast, setActiveToast] = useState(false);
    const [mobileDropdown, setMobileDropdown] = useState(false);
    const router = useRouter();

    const activeClass = "py-2 px-3 dark:text-white text-white bg-blue-500 rounded md:bg-transparent md:text-blue-500 md:p-0 md:dark:text-blue-500 dark:bg-blue-800 md:dark:bg-transparent";
    const inactiveClass = "py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-500 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent";

    const characters = variables.collections.characters;
    const weapons = variables.collections.weapons;

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const searchText = (e.target as HTMLInputElement).value.trim();
            if (searchText !== '') {
                let found = false;
                for (const collection in identifiers) {
                    if (searchText.startsWith(collection) && identifiers[collection].includes(searchText)) {
                        found = true;
                        router.push(`/nft/${searchText}`);
                        break;
                    }
                }
                if (!found) {
                    setActiveToast(true);
                    setTimeout(() => setActiveToast(false), 3000);
                }
            }
        }
    };

    const renderTitle = () => (
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                {navbar.title}
            </span>
        </a>
    );

    const renderHomeItem = () => (
        <li key="home">
            <a href="/" className={`block ${activeItemID === "home" ? activeClass : inactiveClass}`}>
                {navbar.home}
            </a>
        </li>
    );

    const renderCollectionList = (collections: string[]) =>
        collections.map((collectionName) => (
            <li key={collectionName}>
                <a
                    href={`/collection/${collectionName}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                >
                    {collectionName}
                </a>
            </li>
        ));

    const renderPopoverItem = (type: "characters" | "weapons") => {
        const config = {
            characters: {
                name: navbar.characters,
                list: renderCollectionList(characters),
                allName: navbar.allCharacters,
                allUrl: variables.collections.allCharacters,
            },
            weapons: {
                name: navbar.weapons,
                list: renderCollectionList(weapons),
                allName: navbar.allWeapons,
                allUrl: variables.collections.allWeapons,
            }
        };

        const { name, list, allName, allUrl } = config[type];

        return (
            <Popover placement="bottom" key={type}>
                <PopoverTrigger>
                    <button className={`flex items-center justify-between w-full ${activeItemID === type ? activeClass : inactiveClass}`}>
                        {name}
                        <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                        </svg>
                    </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 m-0">
                    <div className="font-normal bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600 text-center">
                        <ul className="py-2 text-sm text-gray-700 dark:text-white">
                            {list}
                        </ul>
                        <div className="py-2">
                            <a
                                href={`/collection/${allUrl}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                            >
                                {allName}
                            </a>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        );
    };

    const renderSearchItem = () => (
        <div className="relative flex">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg className="w-4 h-4 text-theme-muted" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
            </div>
            <input
                type="text"
                onKeyDown={handleSearch}
                className="block w-full p-2 ps-10 text-sm text-theme-text border border-theme-border rounded-lg bg-theme-surface focus:ring-theme-primary focus:border-theme-primary transition-colors duration-200"
                placeholder={navbar.searchPlaceholder}
            />
        </div>
    );

    const renderToastError = () => (
        <div className="absolute flex items-center top-30 left-1/2 transform -translate-x-1/2 p-4 mb-4 rounded-lg shadow-lg text-red-800 dark:text-red-200 bg-red-200 dark:bg-red-800" role="alert">
            <div className="text-sm font-normal pe-2">{navbar.toastText}</div>
            <button
                type="button"
                onClick={() => setActiveToast(false)}
                className="ms-auto -mx-1.5 -my-1.5 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-lg focus:ring-2 focus:ring-red-800 dark:focus:ring-red-200 p-1.5 hover:bg-red-400 dark:hover:bg-red-400 inline-flex items-center justify-center h-8 w-8"
            >
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
            </button>
        </div>
    );

    const renderListItem = () => (
        <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 bg-white dark:border-gray-700">
            {renderHomeItem()}
            {renderPopoverItem("characters")}
            {renderPopoverItem("weapons")}
        </ul>
    );

    const baseNavClass = "w-full mx-auto max-w-screen-xl dark:bg-gray-800 bg-white rounded-lg shadow-lg border-gray-200 m-4";

    return (
        <ErrorBoundary>
            {/* Mobile Navbar */}
            <div className="md:hidden outline-none">
                <nav className={baseNavClass}>
                    <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
                        {renderTitle()}
                        <button
                            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-theme-muted rounded-lg hover:bg-theme-surface transition-colors duration-200"
                            onClick={() => setMobileDropdown(!mobileDropdown)}
                        >
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                            </svg>
                        </button>
                    </div>
                    <div className={`px-4 pb-4 ${mobileDropdown ? "" : "hidden"}`}>
                        <div className="flex items-center gap-4 mb-4">
                            {renderSearchItem()}
                        </div>
                        {renderListItem()}
                    </div>
                </nav>
            </div>

            {/* Desktop Navbar */}
            <div className="hidden md:block outline-none">
                <nav className={baseNavClass}>
                    <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                        {renderTitle()}
                        {renderListItem()}
                        <div className="flex items-center gap-4">
                            {renderSearchItem()}
                        </div>
                    </div>
                </nav>
            </div>

            {activeToast && renderToastError()}
        </ErrorBoundary>
    );
}