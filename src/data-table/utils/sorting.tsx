import _ from "lodash";
import { ReferenceObject, TableColumn, TablePagination, TableSorting } from "../types";
import { formatRowValue } from "./formatting";
import { ReactNode } from "react";

export function sortObjects<T extends ReferenceObject>(
    rows: T[],
    columns: TableColumn<T>[],
    tablePagination: Pick<TablePagination, "page" | "pageSize">,
    tableSorting: TableSorting<T>
) {
    const { field, order } = tableSorting;
    const { page, pageSize } = tablePagination;
    const column = columns.find(({ name }) => name === field);
    const realPage = page - 1;

    return _(rows)
        .orderBy([row => getValue(row, column, field)], [order])
        .slice(realPage * pageSize, realPage * pageSize + pageSize)
        .value();
}

export const nullColumn = { name: "", text: "", sortable: false };

function getValue<T extends ReferenceObject>(
    row: T,
    column: TableColumn<T> | undefined,
    field: keyof T
) {
    if (column) {
        const node = formatRowValue(column, row);
        return hasKey(node) ? node.key : node;
    } else {
        return row[field];
    }
}

function hasKey(node: ReactNode): node is { key: string } {
    return _.isObject(node) && node.hasOwnProperty("key");
}
