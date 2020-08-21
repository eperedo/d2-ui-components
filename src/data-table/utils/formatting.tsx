import _ from "lodash";
import moment from "moment";
import React, { ReactNode } from "react";
import Linkify from "react-linkify";
import { ReferenceObject, RowConfig, TableColumn } from "../types";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function defaultFormatter(value: any): ReactNode {
    if (_.isNil(value)) {
        return null;
    } else if (Array.isArray(value)) {
        return (
            <ul>
                {value.map((item, idx) => (
                    <li key={`list-item-${defaultFormatter(item)}-${idx}`}>
                        {defaultFormatter(item)}
                    </li>
                ))}
            </ul>
        );
    } else if (value.displayName || value.name || value.id) {
        return value.displayName || value.name || value.id;
    } else if (moment.isDate(value) || moment.isMoment(value) || isStringDate(value)) {
        return moment(value).format("YYYY-MM-DD HH:mm:ss");
    } else {
        return <Linkify key={value}>{value}</Linkify>;
    }
}

export function formatRowValue<T extends ReferenceObject>(
    column: Pick<TableColumn<T>, "name" | "getValue">,
    row: T
): ReactNode {
    const defaultValue = defaultFormatter(row[column.name]);
    return column.getValue ? column.getValue(row, defaultValue) : defaultValue;
}

export const defaultRowConfig = () => ({} as RowConfig);

function isStringDate(value: any): boolean {
    // Avoid dubious positives by skipping strings that do not contain at least year, month and day.
    if (typeof value === "string" && value.length >= "YYYY-MM-DD".length) {
        return moment(value, moment.ISO_8601, true).isValid();
    } else {
        return false;
    }
}
