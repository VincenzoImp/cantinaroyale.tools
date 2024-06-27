"use client";

import { contents } from "@/app/layout";

const page = contents.pages.weapon_nft;
const components = contents.components;

function hideToast() {
    
}

export default function WeaponNft({ nft }: { [key: string]: any }) {
    const classButtonActive = "w-full inline-block p-4 rounded-lg shadow-lg dark:text-white dark:bg-blue-800 bg-blue-500 text-white"
    const classButtonInactive = "w-full inline-block p-4 rounded-lg shadow-lg dark:text-gray-400 dark:bg-gray-900 bg-gray-100 dark:hover:bg-gray-700 hover:bg-gray-200"
    const classContentActive = ""
    const classContentInactive = "hidden"
    
    function displayAbout() {
        const aboutButton = document.getElementById("aboutButton");
        const statsButton = document.getElementById("statsButton");
        const aboutContent = document.getElementById("about");
        const statsContent = document.getElementById("stats");

        if (aboutButton && statsButton && aboutContent && statsContent) {
            aboutButton.className = classButtonActive;
            statsButton.className = classButtonInactive;
            aboutContent.className = classContentActive;
            statsContent.className = classContentInactive;
        }
    }

    function displayStats() {
        const aboutButton = document.getElementById("aboutButton");
        const statsButton = document.getElementById("statsButton");
        const aboutContent = document.getElementById("about");
        const statsContent = document.getElementById("stats");

        if (aboutButton && statsButton && aboutContent && statsContent) {
            aboutButton.className = classButtonInactive;
            statsButton.className = classButtonActive;
            aboutContent.className = classContentInactive;
            statsContent.className = classContentActive;
        }
    }

    const explorerUrl = `https://explorer.multiversx.com/nfts/${nft.identifier}`;
    const title = (
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 dark:text-gray-400">{nft.name}</h1>
            <p className="text-lg mb-4 dark:text-gray-400"><a href={explorerUrl} className="underline hover:text-blue-500 dark:hover:text-blue-500">{nft.identifier}</a></p>
        </div>
    );
    const card = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dark:bg-gray-800 bg-white rounded-lg shadow-lg">
            <div className="dark:bg-gray-900 bg-gray-100 rounded-lg m-4 p-4 shadow-lg flex justify-center items-center">
                <a href="{nft.url}"><img src={nft.url} alt={nft.name} className="w-full h-auto"/></a>
            </div>

            <div>
                <div>
                    <ul className="text-sm font-medium text-center rounded-lg flex flex-wrap dark:text-gray-400 m-4 justify-between gap-1">
                        <li className="flex-grow">
                            <button id="aboutButton" className={classButtonActive} onClick={() => displayAbout()}>
                                    {page.about.title}
                            </button>
                        </li>
                        <li className="flex-grow">
                            <button id="statsButton" className={classButtonInactive} onClick={() => displayStats()}>
                                {page.stats.title}
                            </button>
                        </li>
                    </ul>
                    <div id="about" className={classContentActive}>
                        about
                    </div>
                    <div id="stats" className={classContentInactive}>
                        stats
                    </div>
                </div>
            </div>          
        </div>
    );
    const toast = (
        <div id="toast-danger" className="hidden absolute top-0 flex items-center max-w-xs p-4 mb-4 rounded-lg shadow-lg text-red-800 dark:text-red-200 bg-red-200 dark:bg-red-800 " role="alert">
            <div className="text-sm font-normal pe-2">{components.toast.nft_id_not_found}</div>
            <button type="button" onClick={() => hideToast()} className="ms-auto -mx-1.5 -my-1.5 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-lg focus:ring-2 focus:ring-red-800 dark:focus:ring-red-200 p-1.5 hover:bg-red-400 dark:hover:bg-red-400 inline-flex items-center justify-center h-8 w-8">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
            </button>
        </div>
    );

    return (
        <section className="items-center justify-center min-h-screen w-full mx-auto max-w-screen-xl m-12">
            {title}
            {card}
            {toast}
        </section>
    );
}