import { CircularProgress } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import Toolbar from "@material-ui/core/Toolbar";
import _ from "lodash";
import React, { ReactNode, useState } from "react";
import { ContextualMenu } from "./ContextualMenu";
import { DataTableBody } from "./DataTableBody";
import { DataTableHeader } from "./DataTableHeader";
import { DataTablePagination } from "./DataTablePagination";
import {
    ReferenceObject,
    TableAction,
    TableColumn,
    TableInitialState,
    TableNotification,
    TableObject,
    TablePagination,
    TableSorting,
    TableState,
} from "./types";
import { getActionRows, getSelectionMessages, parseActions } from "./utils/selection";
import { sortObjects } from "./utils/sorting";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: "100%",
        },
        toolbar: {
            paddingLeft: 0,
            paddingRight: 0,
        },
        paper: {
            flex: "1 1 0%",
            display: "inline-table",
        },
        tableWrapper: {
            display: "flex",
            flex: "1 1 0%",
            overflowX: "auto",
            paddingBottom: theme.spacing(2),
            marginTop: "5px",
        },
        table: {
            width: "100%",
            minWidth: 750,
        },
        spacer: {
            flex: "1 1 auto",
        },
    })
);

export interface DataTableProps<T extends ReferenceObject> {
    rows: T[];
    columns: TableColumn<T>[];
    actions?: TableAction<T>[];
    initialState?: TableInitialState<T>;
    forceSelectionColumn?: boolean;
    hideSelectionMessages?: boolean;
    tableNotifications?: TableNotification[];
    filterComponents?: ReactNode; // Portal to the navigation toolbar
    sideComponents?: ReactNode; // Portal to right-most of the Data Table
    ids?: string[]; // Enables selection in all pages (disabled with [])
    loading?: boolean;
    childrenTags?: string[];
    // State controlled by parent
    sorting?: TableSorting<T>;
    selection?: string[];
    pagination?: TablePagination;
    onChange?(state: TableState<T>): void;
}

export function DataTable<T extends ReferenceObject = TableObject>(props: DataTableProps<T>) {
    const classes = useStyles({});
    const {
        rows,
        columns,
        actions: availableActions = [],
        initialState = {},
        forceSelectionColumn,
        hideSelectionMessages,
        tableNotifications = [],
        filterComponents,
        sideComponents,
        ids = rows.map(row => row.id),
        loading = false,
        childrenTags = [],
        sorting: controlledSorting,
        selection: controlledSelection,
        pagination: controlledPagination,
        onChange = _.noop,
    } = props;

    const initialSorting = initialState.sorting || {
        field: columns[0].name,
        order: "asc" as const,
    };
    const initialSelection = initialState.selection || [];
    const initialPagination: TablePagination = {
        pageSize: 10,
        total: rows.length,
        page: 1,
        pageSizeOptions: [10, 25, 50, 100],
        ...initialState.pagination,
    };

    const [stateSorting, updateSorting] = useState(initialSorting);
    const [stateSelection, updateSelection] = useState(initialSelection);
    const [statePagination, updatePagination] = useState(initialPagination);

    const sorting = controlledSorting || stateSorting;
    const selection = controlledSelection || stateSelection;
    const pagination = controlledPagination || statePagination;

    const rowObjects = controlledPagination ? rows : sortObjects(rows, pagination, sorting);
    const primaryAction = _(availableActions).find({ primary: true }) || availableActions[0];
    const allSelected =
        rowObjects.length > 0 &&
        _.difference(rowObjects.map(row => row.id), selection).length === 0;
    const enableMultipleAction = _.isUndefined(forceSelectionColumn)
        ? _.some(availableActions, "multiple")
        : forceSelectionColumn;

    const selectionMessages = hideSelectionMessages
        ? []
        : getSelectionMessages(rowObjects, selection, pagination, ids);

    // Contextual menu
    const [contextMenuTarget, setContextMenuTarget] = useState<number[] | null>(null);
    const [contextMenuActions, setContextMenuActions] = useState<TableAction<T>[]>([]);
    const [contextMenuRows, setContextMenuRows] = useState<T[]>([]);

    const handleSelectionChange = (selection: string[]) => {
        updateSelection(selection);
        onChange({ selection, pagination, sorting });
    };

    const handlePaginationChange = (pagination: TablePagination) => {
        updatePagination(pagination);
        onChange({ selection, pagination, sorting });
    };

    const handleSortingChange = (sorting: TableSorting<T>) => {
        updateSorting(sorting);
        const newPagination = { ...pagination, page: 1 };
        onChange({ selection, pagination: newPagination, sorting });
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        const ids = rowObjects.map(n => n.id);
        const newSelection = event.target.checked
            ? _.uniq(selection.concat(ids))
            : _.difference(selection, ids);
        handleSelectionChange(newSelection);
    };

    const handleCloseContextMenu = () => {
        setContextMenuTarget(null);
    };

    const handleOpenContextualMenu = (row: T, positionLeft: number, positionTop: number) => {
        const actionRows = getActionRows(row, rows, selection);
        const actions = parseActions(actionRows, availableActions);
        if (actions.length > 0) {
            setContextMenuTarget([positionTop, positionLeft]);
            setContextMenuActions(actions);
            setContextMenuRows(actionRows);
        }
    };

    return (
        <div className={classes.root}>
            <Toolbar className={classes.toolbar}>
                <React.Fragment>
                    {filterComponents}
                    <div className={classes.spacer}></div>
                    {loading && <CircularProgress size={30} />}
                    <DataTablePagination
                        pagination={{ total: rows.length, ...pagination }} // TODO: Verify this
                        onChange={handlePaginationChange}
                    />
                </React.Fragment>
            </Toolbar>
            <div className={classes.tableWrapper}>
                <Paper className={classes.paper} square>
                    <Table className={classes.table} size={"medium"}>
                        <DataTableHeader
                            columns={columns}
                            sorting={sorting}
                            onChange={handleSortingChange}
                            onSelectAllClick={handleSelectAllClick}
                            allSelected={allSelected}
                            tableNotifications={[...tableNotifications, ...selectionMessages]}
                            handleSelectionChange={handleSelectionChange}
                            enableMultipleAction={enableMultipleAction}
                        />
                        <DataTableBody
                            rows={rowObjects}
                            columns={columns}
                            selected={selection}
                            onChange={handleSelectionChange}
                            openContextualMenu={handleOpenContextualMenu}
                            primaryAction={primaryAction}
                            enableMultipleAction={enableMultipleAction}
                            loading={loading}
                            childrenTags={childrenTags}
                        />
                    </Table>
                </Paper>
                {sideComponents}
            </div>
            {contextMenuTarget && (
                <ContextualMenu
                    isOpen={!!contextMenuTarget}
                    rows={contextMenuRows}
                    actions={contextMenuActions}
                    positionLeft={contextMenuTarget[0]}
                    positionTop={contextMenuTarget[1]}
                    onClose={handleCloseContextMenu}
                />
            )}
        </div>
    );
}
