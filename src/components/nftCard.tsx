"use client";

import { contents, variables } from "@/app/layout";
import { useState } from "react";
import Image from 'next/image';

export default function NftCard({ nft, type }: { [key: string]: any, type: string }) {

    var nftCard: { [key: string]: any } = contents.components.nftCard;
    nftCard = nftCard[type];

    const talentTypes: { [key: string]: string } = variables.talentTypes;
    
    function About({ about, nft }: { about: { [key: string]: any }, nft: { [key: string]: any } }) {
        const component = Object.entries(about.keys).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([key, value]: [string, any]) => {
            const displayKey: any = value;
            var displayValue: any = nft[key];
            if (key === "collection") {
                displayValue = <a href={"/collection/" + displayValue} className="underline hover:text-blue-500 dark:hover:text-blue-500">{displayValue}</a>;
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
                    displayValue = <a href={"https://xoxno.com/nft/" + nft.identifier} className="underline hover:text-blue-500 dark:hover:text-blue-500">{displayValue}</a>;
                } else {
                    displayValue = about.notForSale;
                }
            }
            if (key === "rank") {
                if (!nft.rank) {
                    displayValue = about.notRanked;
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
        return component;
    }

    function Stats({ stats, nft }: { stats: { [key: string]: any }, nft: { [key: string]: any } }) {
        const component = Object.entries(stats.keys).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([key, value]: [string, any]) => {
            const displayKey: any = value;
            var displayValue: any = nft[key];
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
        });
        return component;
    }

    function Talents({ talents, nft }: { talents: { [key: string]: any }, nft: { [key: string]: any } }) {
        var talentsMap: { [key: string]: number } = {};
        for (const talentName in talents.keys) {
            const talentValue = parseFloat(nft[talentName]);
            if (talentValue > 0) {
                talentsMap[talentName] = talentValue;
            }
        }
        const colors: { [key: string]: string } = {
            valor: "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200",
            tactics: "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200",
            resolve: "bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200"
        };
        const component = Object.entries(talentsMap).sort(([talentNameA], [talentNameB]) => talentsMap[talentNameB] - talentsMap[talentNameA] || talentNameA.localeCompare(talentNameB)).map(([talentName, talentValue]: [string, number]) => {
            return (
                <div className="flex justify-between items-center dark:bg-gray-900 bg-gray-100 rounded-lg m-4 p-4 shadow-lg">
                    <span className="text-sm dark:text-gray-400">
                        <span>
                            <svg data-popover-target={"popover-"+talentName} className="flex-shrink-0 inline w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                            </svg>
                            <div data-popover id={"popover-"+talentName} role="tooltip" className="absolute z-10 invisible inline-block w-64 text-sm text-gray-700 transition-opacity duration-300 bg-white rounded-lg shadow-lg opacity-0 dark:text-gray-200 dark:bg-gray-700">
                                <div className="px-3 py-2">
                                    {talents.keys[talentName].info}
                                </div>
                            </div>
                        </span>
                        <span className="ms-2 me-2">
                            {talents.keys[talentName].text}
                        </span>
                        <span className={"text-xs font-medium px-2.5 py-0.5 rounded-full "+colors[talentTypes[talentName]]}>
                            {talents.types[talentTypes[talentName]]}
                        </span>
                    </span>
                    <span className="text-sm dark:text-gray-400">
                        {talentValue}
                    </span>
                </div>
            );
        });
        return component;
    }

    function Traits({ traits, nft }: { traits: { [key: string]: any }, nft: { [key: string]: any } }) {
        const component = Object.entries(traits.keys).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([key, value]: [string, any]) => {
            const displayKey: any = value;
            var displayValue: any = nft[key];
            if (parseFloat(displayValue)) {
                displayValue = parseFloat(displayValue);
            }
            if (displayValue === null) {
                return null;
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
        return component;
    }

    function DynamicArea({nftCard, nft}: {nftCard: { [key: string]: any }, nft: { [key: string]: any }}) {
        const [activeKey, setactiveKey] = useState("about");
        const classButtonActive = "w-full inline-block p-4 rounded-lg shadow-lg dark:text-white dark:bg-blue-800 bg-blue-500 text-white";
        const classButtonInactive = "w-full inline-block p-4 rounded-lg shadow-lg dark:text-gray-400 dark:bg-gray-900 bg-gray-100 dark:hover:bg-gray-700 hover:bg-gray-200";
        const buttons = Object.entries(nftCard).map(([key, value]: [string, any]) =>
            <li className="flex-grow">
                <button className={activeKey === key ? classButtonActive : classButtonInactive} onClick={() => setactiveKey(key)}>
                    {value.title}
                </button>
            </li>
        );
        const dynamic: { [key: string]: JSX.Element } = {
            about: <About about={nftCard.about} nft={nft} />,
            stats: <Stats stats={nftCard.stats} nft={nft} />,
            talents: <Talents talents={nftCard.talents} nft={nft} />,
            traits: <Traits traits={nftCard.traits} nft={nft} />
        };
        return (
            <div>
                <ul className="text-sm font-medium text-center rounded-lg flex flex-wrap dark:text-gray-400 m-4 justify-between gap-1">
                    {buttons}
                </ul>
                <div>
                    {dynamic[activeKey]}
                </div>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dark:bg-gray-800 bg-white rounded-lg shadow-lg">
            <div className="dark:bg-gray-900 bg-gray-100 rounded-lg m-4 p-4 shadow-lg flex justify-center items-center">
                <a href="{nft.url}"><Image src={nft.url} alt={nft.name} className="w-full h-auto"/></a>
            </div>
            <DynamicArea nftCard={nftCard} nft={nft} />
        </div>
    );
}