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
    User,
    Pagination,
    Selection,
    ChipProps,
    SortDescriptor
  } from "@nextui-org/react";
import {PlusIcon} from "@components/icon/plusIcon";
import {VerticalDotsIcon} from "@components/icon/verticalDotsIcon";
import {ChevronDownIcon} from "@components/icon/chevronDownIcon";
import {SearchIcon} from "@components/icon/searchIcon";

export default function CollectionTable({ tableColumns, tableEntries, type }: { tableColumns: { uid: string, name: string, sortable: boolean }[], tableEntries: any[], type: string }) {
    
    function capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }      

    return (
        <Table isHeaderSticky>
            <TableHeader>
                {tableColumns.map((column) => {
                    return (
                        <TableColumn key={column.uid}>{capitalize(column.name)}</TableColumn>
                    );
                })}
            </TableHeader>
            <TableBody>
                
            </TableBody>
        </Table>
    );


}
