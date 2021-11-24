import React from "react";

import { ReferenceObject, TableColumn } from "..";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { Checkbox } from "@material-ui/core";

import i18n from "../utils/i18n";

interface TableColumnSelectorProps<T extends ReferenceObject> {
    columns: TableColumn<T>[];
    visibleColumns: (keyof T)[];
    onChange: (visibleColumns: (keyof T)[]) => void;
}

export function TableColumnSelector<T extends ReferenceObject>(props: TableColumnSelectorProps<T>) {
    const { columns, visibleColumns, onChange } = props;

    const toggleElement = (name: keyof T) => {
        const newSelection = !visibleColumns.includes(name)
            ? [...visibleColumns, name]
            : visibleColumns.filter(item => item !== name);

        console.debug("NEW SELECTION");
        console.debug(newSelection);
        onChange(newSelection);
    };

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell colSpan={12}>{i18n.t("Column")}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {columns.map(({ name, text }) => {
                    const checked = visibleColumns.includes(name);
                    const disabled = visibleColumns.length <= 1 && checked;

                    return (
                        <TableRow key={`cell-${name}`}>
                            <TableCell
                                component="th"
                                scope="row"
                                onClick={() => !disabled && toggleElement(name)}
                            >
                                <Checkbox
                                    color={"primary"}
                                    checked={checked}
                                    disabled={disabled}
                                    tabIndex={-1}
                                />
                                {text}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
