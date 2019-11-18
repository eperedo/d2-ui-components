import i18n from "@dhis2/d2-i18n";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import _ from "lodash";
import React, { MouseEvent } from "react";
import { ReferenceObject, TableAction, TableColumn } from "./types";
import { formatRowValue } from "./utils/formatting";
import { isEventCtrlClick, updateSelection } from "./utils/selection";

const useStyles = makeStyles({
    bottomBorder: {
        borderBottom: "2px solid #E0E0E0",
    },
    checkboxCell: {
        paddingLeft: "12px",
    },
    centerText: {
        textAlign: "center",
    },
});

export interface DataTableBodyProps<T extends ReferenceObject> {
    rows: T[];
    columns: TableColumn<T>[];
    primaryAction?: TableAction<T>;
    selected: string[];
    onChange?(newSelection: string[]): void;
    openContextualMenu?(row: T, positionLeft: number, positionTop: number): void;
    enableMultipleAction?: boolean;
    loading?: boolean;
}

export function DataTableBody<T extends ReferenceObject>(props: DataTableBodyProps<T>) {
    const {
        rows,
        columns,
        primaryAction,
        selected,
        onChange = _.noop,
        openContextualMenu = _.noop,
        enableMultipleAction,
        loading,
    } = props;
    const classes = useStyles({});
    const isSelected = (name: string) => selected.indexOf(name) !== -1;

    const contextualAction = (row: T, event: MouseEvent<unknown>) => {
        event.stopPropagation();
        openContextualMenu(row, event.clientY, event.clientX);
    };

    const handleClick = (event: MouseEvent<unknown>, row: T) => {
        const { tagName, type = null } = event.target as HTMLAnchorElement;
        const isCheckboxClick = tagName.localeCompare("input") && type === "checkbox";

        if (event.type === "contextmenu") {
            event.preventDefault();
            contextualAction(row, event);
        } else if (enableMultipleAction && (isEventCtrlClick(event) || isCheckboxClick)) {
            onChange(updateSelection(selected, row));
        } else if (primaryAction && primaryAction.onClick) {
            primaryAction.onClick([row]);
        }
    };

    return (
        <TableBody>
            {!loading && rows.length === 0 && (
                <TableRow>
                    <TableCell colSpan={columns.length + 2}>
                        <p className={classes.centerText}>No results found</p>
                    </TableCell>
                </TableRow>
            )}
            {rows.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `data-table-row-${index}`;

                return (
                    <TableRow
                        className={classes.bottomBorder}
                        hover
                        onClick={event => handleClick(event, row)}
                        onContextMenu={event => handleClick(event, row)}
                        role="checkbox"
                        tabIndex={-1}
                        key={`table-row-${row.id}`}
                        selected={isItemSelected}
                    >
                        {enableMultipleAction && (
                            <TableCell
                                className={classes.checkboxCell}
                                key={`${labelId}-checkbox`}
                                padding="checkbox"
                            >
                                <Checkbox checked={isItemSelected} />
                            </TableCell>
                        )}
                        {columns.map(column => (
                            <TableCell
                                key={`${labelId}-column-${column.name}`}
                                scope="row"
                                align="left"
                            >
                                {formatRowValue(column, row)}
                            </TableCell>
                        ))}
                        <TableCell key={`${labelId}-actions`} padding="none" align={"center"}>
                            {primaryAction && (
                                <Tooltip title={i18n.t("Actions")}>
                                    <IconButton onClick={event => contextualAction(row, event)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </TableCell>
                    </TableRow>
                );
            })}
        </TableBody>
    );
}
