import i18n from "@dhis2/d2-i18n";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import CheckBoxTwoToneIcon from "@material-ui/icons/CheckBoxTwoTone";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import _ from "lodash";
import React, { MouseEvent, useState } from "react";
import { ReferenceObject, TableAction, TableColumn, TableSorting } from "./types";
import { formatRowValue } from "./utils/formatting";
import { isEventCtrlClick, parseActions, updateSelection } from "./utils/selection";

const useStyles = makeStyles({
    bottomBorder: {
        borderBottom: "2px solid #E0E0E0",
    },
    flex: {
        display: "flex",
    },
    checkboxCell: {
        paddingLeft: 12,
    },
    centerText: {
        textAlign: "center",
    },
    childrenRow: {
        background: "#E0E0E0",
    },
});

const rotateIconStyle = (isOpen: boolean) => ({
    transform: isOpen ? "rotate(90deg)" : "none",
});

export interface DataTableBodyProps<T extends ReferenceObject> {
    rows: T[];
    columns: TableColumn<T>[];
    visibleColumns: string[];
    sorting: TableSorting<T>;
    availableActions?: TableAction<T>[];
    selected: string[];
    onChange?(newSelection: string[]): void;
    openContextualMenu?(row: T, positionLeft: number, positionTop: number): void;
    enableMultipleAction?: boolean;
    loading?: boolean;
    childrenKeys?: string[];
}

export function DataTableBody<T extends ReferenceObject>(props: DataTableBodyProps<T>) {
    const {
        rows,
        columns,
        visibleColumns,
        sorting,
        availableActions,
        selected,
        onChange = _.noop,
        openContextualMenu = _.noop,
        enableMultipleAction,
        loading,
        childrenKeys,
    } = props;
    const { field, order } = sorting;
    const classes = useStyles({});
    const [expandedRows, updateExpandedRows] = useState<string[]>([]);

    const isSelected = (name: string) => selected.indexOf(name) !== -1;

    function createRow(row: T, index: number | string, level = 0, parentSelected = false) {
        const labelId = `data-table-row-${index}`;
        const defaultAction = parseActions([row], availableActions)[0];
        const primaryAction = _(availableActions).find({ primary: true }) || defaultAction;

        const contextualAction = (event: MouseEvent<unknown>) => {
            event.stopPropagation();
            openContextualMenu(row, event.clientY, event.clientX);
        };

        const handleClick = (event: MouseEvent<unknown>) => {
            const { tagName, type = null } = event.target as HTMLAnchorElement;
            const isCheckboxClick = tagName.localeCompare("input") && type === "checkbox";

            if (event.type === "contextmenu") {
                event.preventDefault();
                contextualAction(event);
            } else if (enableMultipleAction && (isEventCtrlClick(event) || isCheckboxClick)) {
                onChange(updateSelection(selected, row));
            } else if (primaryAction && primaryAction.onClick) {
                primaryAction.onClick([row]);
            }
        };

        const childrenRows = _(row)
            .pick(childrenKeys)
            .values()
            .flatten()
            .orderBy([field], [order])
            .value();

        const isItemSelected = isSelected(row.id);
        const allChildrenSelected =
            childrenRows.length > 0 && _.every(childrenRows, ({ id }) => isSelected(id));
        const someChildrenSelected =
            childrenRows.length > 0 && _.some(childrenRows, ({ id }) => isSelected(id));
        const isCheckboxChecked = isItemSelected || parentSelected || allChildrenSelected;
        const isCheckboxIndeterminate = !isItemSelected && (parentSelected || someChildrenSelected);

        const openChildrenRows = (event: MouseEvent<unknown>) => {
            event.stopPropagation();
            updateExpandedRows(expandedRows => {
                if (expandedRows.includes(row.id)) {
                    return expandedRows.filter(id => id !== row.id);
                } else {
                    return [...expandedRows, row.id];
                }
            });
        };

        return (
            <React.Fragment key={`data-table-row-${index}`}>
                <TableRow
                    className={level === 0 ? classes.bottomBorder : classes.childrenRow}
                    onClick={event => handleClick(event)}
                    onContextMenu={event => handleClick(event)}
                    role="checkbox"
                    selected={isItemSelected}
                    hover
                >
                    {(enableMultipleAction || childrenRows.length > 0) && (
                        <TableCell padding="checkbox" className={classes.checkboxCell}>
                            <div className={classes.flex}>
                                {enableMultipleAction && (
                                    <Checkbox
                                        checked={isCheckboxChecked}
                                        indeterminate={isCheckboxIndeterminate}
                                        indeterminateIcon={<CheckBoxTwoToneIcon />}
                                    />
                                )}
                                {childrenRows.length > 0 && (
                                    <IconButton
                                        style={{
                                            transition: "all ease 200ms",
                                            ...rotateIconStyle(expandedRows.includes(row.id)),
                                        }}
                                        onClick={openChildrenRows}
                                    >
                                        <ChevronRightIcon />
                                    </IconButton>
                                )}
                            </div>
                        </TableCell>
                    )}

                    {columns
                        .filter(({ name }) => visibleColumns.includes(name))
                        .map(column => (
                            <TableCell
                                key={`${labelId}-column-${column.name}`}
                                scope="row"
                                align="left"
                            >
                                {formatRowValue(column, row)}
                            </TableCell>
                        ))}

                    <TableCell key={`${labelId}-actions`} padding="none" align={"center"}>
                        {!!defaultAction && (
                            <Tooltip title={i18n.t("Actions")}>
                                <IconButton onClick={event => contextualAction(event)}>
                                    <MoreVertIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </TableCell>
                </TableRow>

                {expandedRows.includes(row.id) &&
                    childrenRows.map((childrenRow: T, childrenIndex: number) =>
                        createRow(
                            childrenRow,
                            `${index}-${childrenIndex}`,
                            level + 1,
                            isItemSelected
                        )
                    )}
            </React.Fragment>
        );
    }

    return (
        <TableBody>
            {rows.map((row, index) => createRow(row, index))}

            {!loading && rows.length === 0 && (
                <TableRow>
                    <TableCell colSpan={columns.length + 2}>
                        <p className={classes.centerText}>No results found</p>
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    );
}
