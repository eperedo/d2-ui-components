import i18n from "@dhis2/d2-i18n";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ViewColumnIcon from "@material-ui/icons/ViewColumn";
import SettingsIcon from "@material-ui/icons/Settings";
import _ from "lodash";
import React, { MouseEvent, useState } from "react";
import ColumnSelectorDialog from "./ColumnSelectorDialog";
import { ContextualMenu } from "./ContextualMenu";
import { DataTableNotifications } from "./DataTableNotifications";
import {
    ReferenceObject,
    TableColumn,
    TableGlobalAction,
    TableNotification,
    TableSelection,
    TableSorting,
} from "./types";

const useStyles = makeStyles({
    visuallyHidden: {
        border: 0,
        clip: "rect(0 0 0 0)",
        height: 1,
        margin: -1,
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        top: 20,
        width: 1,
    },
    bottomBorder: {
        borderBottom: "3px solid #E0E0E0",
    },
    checkboxCell: {
        paddingLeft: "12px",
    },
});

export interface DataTableHeaderProps<T extends ReferenceObject> {
    columns: TableColumn<T>[];
    globalActions: TableGlobalAction[];
    ids: string[];
    visibleColumns: (keyof T)[];
    onVisibleColumnsChange?(newVisibleColumns: (keyof T)[]): void;
    sorting: TableSorting<T>;
    onSortingChange?(newSorting: TableSorting<T>): void;
    allSelected?: boolean;
    tableNotifications?: TableNotification[];
    handleSelectionChange?(newSelection: TableSelection[]): void;
    onSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    enableMultipleAction: boolean;
    hideColumnVisibilityOptions?: boolean;
    hideSelectAll?: boolean;
}

export function DataTableHeader<T extends ReferenceObject>(props: DataTableHeaderProps<T>) {
    const classes = useStyles();
    const {
        columns,
        globalActions,
        ids,
        visibleColumns,
        onVisibleColumnsChange = _.noop,
        sorting,
        onSortingChange = _.noop,
        allSelected = false,
        tableNotifications = [],
        handleSelectionChange = _.noop,
        onSelectAllClick = _.noop,
        enableMultipleAction,
        hideColumnVisibilityOptions = false,
        hideSelectAll = false,
    } = props;

    const { field, order } = sorting;
    const [openColumnReorder, setOpenColumnReorder] = useState<boolean>(false);
    const [contextMenuTarget, setContextMenuTarget] = useState<number[] | null>(null);
    const contextMenuRows = ids.map(id => ({ id }));

    const createSortHandler = (property: keyof T) => (_event: React.MouseEvent<unknown>) => {
        const isDesc = field === property && order === "desc";
        onSortingChange({ field: property, order: isDesc ? "asc" : "desc" });
    };

    const tableActions = [
        ...globalActions,
        {
            name: "reorder-columns",
            text: i18n.t("Reorder columns"),
            onClick: () => setOpenColumnReorder(true),
            visible: !hideColumnVisibilityOptions,
            icon: <ViewColumnIcon />,
        },
    ];

    const openTableActions = (event: MouseEvent<HTMLTableHeaderCellElement>) => {
        setContextMenuTarget([event.clientX, event.clientY + event.currentTarget.clientHeight / 2]);
    };

    const closeTableActions = () => {
        setContextMenuTarget(null);
    };

    return (
        <React.Fragment>
            {openColumnReorder && (
                <ColumnSelectorDialog
                    columns={columns}
                    visibleColumns={visibleColumns}
                    onChange={onVisibleColumnsChange}
                    onCancel={() => setOpenColumnReorder(false)}
                />
            )}
            <TableHead>
                <TableRow className={classes.bottomBorder}>
                    {enableMultipleAction && (
                        <TableCell className={classes.checkboxCell} padding="checkbox">
                            {!hideSelectAll && (
                                <Checkbox checked={allSelected} onChange={onSelectAllClick} />
                            )}
                        </TableCell>
                    )}
                    {columns
                        .filter(({ name }) => visibleColumns.includes(name))
                        .map(column => (
                            <TableCell
                                key={`data-table-cell-${column.name}`}
                                align="left"
                                sortDirection={field === column.name ? order : false}
                            >
                                <TableSortLabel
                                    active={field === column.name}
                                    direction={order}
                                    onClick={createSortHandler(column.name)}
                                    IconComponent={ExpandMoreIcon}
                                    disabled={column.sortable === false}
                                >
                                    {column.text}
                                </TableSortLabel>
                            </TableCell>
                        ))}
                    <TableCell padding="none" align={"center"} onClick={openTableActions}>
                        {tableActions.length > 0 && (
                            <IconButton>
                                <SettingsIcon />
                            </IconButton>
                        )}
                    </TableCell>
                </TableRow>
                {tableNotifications.length > 0 && (
                    <TableRow>
                        <TableCell padding="none" colSpan={columns.length + 2}>
                            <DataTableNotifications
                                messages={tableNotifications}
                                updateSelection={handleSelectionChange}
                            />
                        </TableCell>
                    </TableRow>
                )}
            </TableHead>
            {contextMenuTarget && (
                <ContextualMenu
                    isOpen={!!contextMenuTarget}
                    positionLeft={contextMenuTarget[0]}
                    positionTop={contextMenuTarget[1]}
                    rows={contextMenuRows}
                    selection={contextMenuRows}
                    actions={tableActions}
                    onClose={closeTableActions}
                />
            )}
        </React.Fragment>
    );
}
