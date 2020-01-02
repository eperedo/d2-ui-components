import _ from "lodash";
import { ReferenceObject, TableColumn, TablePagination, TableSorting } from "../types";
import { formatRowValue } from "./formatting";

export function sortObjects<T extends ReferenceObject>(
    rows: T[],
    columns: TableColumn<T>[],
    tablePagination: TablePagination,
    tableSorting: TableSorting<T>
) {
    const { field, order } = tableSorting;
    const { page, pageSize } = tablePagination;
    const column = columns.find(({ name }) => name === field);
    const realPage = page - 1;

    return _(rows)
        .map(row => ({
            ...row,
            [field]: columns ? formatRowValue(column, row) : row[field as keyof T],
        }))
        .orderBy([field], [order])
        .slice(realPage * pageSize, realPage * pageSize + pageSize)
        .value();
}
