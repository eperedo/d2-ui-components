import _ from "lodash";
import moment from "moment";
import React, { ReactNode } from "react";
import { ReferenceObject, RowConfig, TableColumn } from "../types";

const urlRegex = /https?:\/\/[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#()?&//=]*)/;

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
    } else if (
        moment.isDate(value) ||
        moment.isMoment(value) ||
        moment(value, moment.ISO_8601, true).isValid()
    ) {
        return moment(value).format("YYYY-MM-DD HH:mm:ss");
    } else if (urlRegex.test(value)) {
        return (
            <a
                rel="noopener noreferrer"
                style={{ wordBreak: "break-all" }}
                href={value}
                target="_blank"
            >
                {value}
            </a>
        );
    } else {
        return value;
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
