"use client";

import { contents } from "@/app/layout";

const weapon_nft = contents.pages.weapon_nft;

export default function WeaponNft({ nft }: { [key: string]: any }) {

    const classButtonActive = "w-full inline-block p-4 rounded-lg shadow-lg dark:text-white dark:bg-blue-800 bg-blue-500 text-white"
    const classButtonInactive = "w-full inline-block p-4 rounded-lg shadow-lg dark:text-gray-400 dark:bg-gray-900 bg-gray-100 dark:hover:bg-gray-700 hover:bg-gray-200"
    const classContentActive = ""
    const classContentInactive = "hidden"

    // generate about content as a list of key-value pairs list item iterating over keys
    // iterate over key value of weapon_nft.about.keys and generate a list of key-value pairs

    const about = Object.entries(weapon_nft.about.keys).map(([key, value]) => {
        const displayKey = value;
        var displayValue = nft[key];
        if (key === "collection") {
            displayValue = <a href={"/" + displayValue} className="underline hover:text-blue-500 dark:hover:text-blue-500">{displayValue}</a>;
        }
        if (key === "owner") {
            displayValue = displayValue.slice(0, 6) + "..." + displayValue.slice(-6);
            displayValue = <a href={"https://explorer.multiversx.com/accounts/" + nft[key]} className="underline hover:text-blue-500 dark:hover:text-blue-500">{displayValue}</a>;
        
        }
        if (parseFloat(displayValue)) {
            displayValue = parseFloat(displayValue);
        }
        if (key === "price") {
            if (nft.priceCurrency) {
                displayValue = nft.priceAmount + " " + nft.priceCurrency;
            } else {
                displayValue = weapon_nft.about.notForSale;
            }
        }
        if (key === "rank") {
            if (!nft.rank) {
                displayValue = weapon_nft.about.notRanked;
            }
        }
        return (
            <div className="flex justify-between items-center dark:bg-gray-900 bg-gray-100 rounded-lg m-4 p-4 shadow-lg">
                <span className="text-sm dark:text-gray-400">
                    {displayKey}
                </span>
                <span className="text-sm dark:text-gray-400">
                    {displayValue}
                </span>
            </div>
        );
    });
    
    const stats = Object.entries(weapon_nft.stats.keys).map(([key, value]) => {
        const displayKey = value;
        var displayValue = nft[key];
        if (parseFloat(displayValue)) {
            displayValue = parseFloat(displayValue);
        }
        return (
            <div className="flex justify-between items-center dark:bg-gray-900 bg-gray-100 rounded-lg m-4 p-4 shadow-lg">
                <span className="text-sm dark:text-gray-400">
                    {displayKey}
                </span>
                <span className="text-sm dark:text-gray-400">
                    {displayValue}
                </span>
            </div>
        );
    }
    );
        

    // <script>
    //     document.addEventListener("DOMContentLoaded", function () {
    //         var stats = JSON.parse('{{page.stats | tojson}}');
    //         var nft = '{{nft | tojson | safe}}'.replace(/NaN/g, null).replace(/'/g, '"').replace(/None/g, null).replace(/True/g, true).replace(/False/g, false);
    //         nft = JSON.parse(nft);
    //         for (const [key, value] of Object.entries(stats.keys)) {
    //             var div = document.createElement("div");
    //             div.className = "flex justify-between items-center dark:bg-gray-900 bg-gray-100 rounded-lg m-4 p-4 shadow-lg";
    //             var span1 = document.createElement("span");
    //             span1.className = "text-sm dark:text-gray-400";
    //             span1.textContent = value;
    //             var span2 = document.createElement("span");
    //             span2.className = "text-sm dark:text-gray-400";
    //             var text = nft[key];
    //             if (parseFloat(text)) {
    //                 text = parseFloat(text);
    //             };
    //             span2.textContent = text;
    //             div.appendChild(span1);
    //             div.appendChild(span2);
    //             document.getElementById("stats").appendChild(div);
    //         };
    //     });
    // </script>
    
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
                                    {weapon_nft.about.title}
                            </button>
                        </li>
                        <li className="flex-grow">
                            <button id="statsButton" className={classButtonInactive} onClick={() => displayStats()}>
                                {weapon_nft.stats.title}
                            </button>
                        </li>
                    </ul>
                    <div id="about" className={classContentActive}>
                        {about}
                    </div>
                    <div id="stats" className={classContentInactive}>
                        {stats}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <section className="items-center justify-center min-h-screen w-full mx-auto max-w-screen-xl m-12">
            {title}
            {card}
        </section>
    );
}