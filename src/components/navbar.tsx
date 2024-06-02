import { info } from "../app/layout";

export default function Navbar() {
    const contents = info.contents.en.components.navbar;
    const toast = info.contents.en.components.toast;
    
    function handleSearch(event: { key: string; target: { value: string; }; }) {
        const nft_ids = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        // Check if the pressed key is Enter
        if (event.key === 'Enter') {
            // Get the entered text
            var searchText = event.target.value.trim();
            // If the text is not empty, redirect to the corresponding page
            if (searchText !== '') {
                if (nft_ids.includes(searchText)) {
                    window.location.href = '/' + searchText; // Redirect to the page
                } else {
                    showToast(); // Show the toast if the item is not found
                }
            }
        }
    }

    function showToast() {
        var toast = document.getElementById('toast-danger');
        if (toast) {
            toast.classList.remove('hidden');
            setTimeout(function() {
                hideToast();
            }, 3000);
        }
    }
    function hideToast() {
        var toast = document.getElementById('toast-danger');
        if (toast) {
            toast.classList.add('hidden');
        }
    }

    // Add event listeners function to toggle dropdown visibility
    function toggleDropdown(dropdownId: string) {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }

    return (
        <>
        <nav
            className="w-full mx-auto max-w-screen-xl dark:bg-gray-800 bg-white rounded-lg shadow-lg border-gray-200 m-4 bg-white">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span
                        className="self-center text-2xl font-semibold whitespace-nowrap dark:text-gray-400">{contents.title}</span>
                </a>
                <div className="flex md:order-2">
                    <div className="relative hidden md:block">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input type="text" id="search-navbar" onKeyPress={handleSearch}
                            className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder={contents.search_placeholder}>
                        </input>
                    </div>
                    <button data-collapse-toggle="navbar-search" type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        aria-controls="navbar-search" aria-expanded="false">
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 17 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M1 1h15M1 7h15M1 13h15" />
                        </svg>
                    </button>
                </div>
                <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-search">
                    <div className="relative mt-3 md:hidden">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input type="text" id="search-navbar" onkeypress="handleSearch(event)"
                            className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder={contents.search_placeholder}>
                        </input>
                    </div>
                    <ul
                        className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 bg-white dark:border-gray-700">
                        <li>
                            <a href="/" id="homeNavbarLink"
                                className="block py-2 px-3 dark:text-white text-white bg-blue-500 rounded md:bg-transparent md:text-blue-500 md:p-0 md:dark:text-blue-500 dark:bg-blue-800 md:dark:bg-transparent"
                                aria-current="page">{contents.home}</a>
                        </li>
                        <li>
                            <button id="charactersNavbarLink" data-dropdown-toggle="charactersNavbar" onClick={() => toggleDropdown('charactersNavbar')}
                                className="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-500 md:p-0 md:w-auto dark:text-gray-400 md:dark:hover:text-blue-500 dark:focus:dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
                                {contents.characters}
                                <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2" d="m1 1 4 4 4-4" />
                                </svg>
                            </button>
                            <div id="charactersNavbar"
                                className="z-10 hidden font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                                <ul id="charactersList" className="py-2 text-sm text-gray-700 dark:text-gray-400"
                                    aria-labelledby="dropdownLargeButton">
                                </ul>
                                <div className="py-2">
                                    <a href="/All-Characters"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">{contents.all_characters}</a>
                                </div>
                            </div>
                        </li>
                        <li>
                            <button id="weaponsNavbarLink" data-dropdown-toggle="weaponsNavbar" onClick={() => toggleDropdown('weaponsNavbar')}
                                className="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-500 md:p-0 md:w-auto dark:text-gray-400 md:dark:hover:text-blue-500 dark:focus:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
                                {contents.weapons}
                                <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        strokeWidth="2" d="m1 1 4 4 4-4" />
                                </svg>
                            </button>
                            <div id="weaponsNavbar"
                                className="z-10 hidden font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                                <ul id="weaponsList" className="py-2 text-sm text-gray-700 dark:text-gray-400"
                                    aria-labelledby="dropdownLargeButton">
                                </ul>
                                <div className="py-2">
                                    <a href="/All-Weapons"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">{contents.all_weapons}</a>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <div id="toast-danger" className="hidden absolute flex items-center top-30 left-1/2 transform -translate-x-1/2 p-4 mb-4 rounded-lg shadow-lg text-red-800 dark:text-red-200 bg-red-200 dark:bg-red-800" role="alert">
            <div className="text-sm font-normal pe-2">{toast.nft_id_not_found}</div>
            <button type="button" onClick={hideToast} className="ms-auto -mx-1.5 -my-1.5 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-lg focus:ring-2 focus:ring-red-800 dark:focus:ring-red-200 p-1.5 hover:bg-red-400 dark:hover:bg-red-400 inline-flex items-center justify-center h-8 w-8">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
            </button>
        </div>

        <script>
            document.addEventListener("DOMContentLoaded", function () {
                var characters = ['All-Characters', 'Bounty-Hunters', 'Empire', 'Galactic-Republic', 'Jedi', 'Rebels', 'Resistance', 'Sith', 'Smugglers', 'Separatists'];
                var weapons = ['All-Weapons', 'Blaster', 'Blaster-Pistol', 'Blaster-Rifle', 'Melee', 'Saber', 'Staff', 'Sword', 'Whip'];
                var charactersList = document.getElementById("charactersList");
                characters.forEach(function (collection_name) {
                    var li = document.createElement("li");
                    var a = document.createElement("a");
                    a.href = "/" + collection_name;
                    a.textContent = collection_name;
                    a.className = "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white";
                    li.appendChild(a);
                    charactersList.appendChild(li);
                });
                var weaponsList = document.getElementById("weaponsList");
                weapons.forEach(function (collection_name) {
                    var li = document.createElement("li");
                    var a = document.createElement("a");
                    a.href = "/" + collection_name;
                    a.textContent = collection_name;
                    a.className = "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white";
                    li.appendChild(a);
                    weaponsList.appendChild(li);
                });
            });
        </script>

        </>
    );
}
