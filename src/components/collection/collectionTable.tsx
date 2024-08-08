"use client";

import React from "react";
import { contents } from "@/app/layout";

export default function CollectionTable({ collectionData, type } : { collectionData: { [key: string]: any }, type: string }) {
    var columns: { key: string; value: string; }[] = [];
    if (type === "characters") {
        for (var [key, value] of Object.entries(contents.components.collectionTable.characters.columns)) {
            columns.push({ key: key, value: value });
        }
    } else if (type === "weapons") {
        for (var [key, value] of Object.entries(contents.components.collectionTable.weapons.columns)) {
            columns.push({ key: key, value: value });
        }
    } else {
        return <></>;
    }

    const thead = columns.map((column) => {
        return (
            <th key={column.key} className="px-4 py-2 dark:text-gray-400">
                {column.value}
            </th>
        );
    });

    const tbody = Object.values(collectionData).map((collectionNfts : { [key: string]: any }) => {
        return Object.entries(collectionNfts.nfts).map(([nftIdentifier, nftData]) => {
            return (
                <tr key={nftIdentifier} className="bg-white dark:bg-gray-800">
                    {columns.map((column) => {
                        return (
                            <td key={column.key} className="border px-4 py-2">
                                {(nftData as any)[column.key]}
                            </td>
                        );
                    })}
                </tr>
            );
        });
    });

    return (
        <div className="overflow-x-auto">
            <table className="table-auto w-full">
                <thead>
                    {thead}
                </thead>
                <tbody>
                    {/* {tbody} */}
                </tbody>
            </table>
        </div>
    );
}