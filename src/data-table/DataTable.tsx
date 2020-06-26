import { CircularProgress } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import Toolbar from "@material-ui/core/Toolbar";
import _ from "lodash";
import React, { ReactNode, useEffect, useState } from "react";
import { ContextualMenu } from "./ContextualMenu";
import { DataTableBody } from "./DataTableBody";
import { DataTableHeader } from "./DataTableHeader";
import { DataTablePagination } from "./DataTablePagination";
import {
    MouseActionsMapping,
    ReferenceObject,
    RowConfig,
    TableAction,
    TableColumn,
    TableGlobalAction,
    TableInitialState,
    TableNotification,
    TableObject,
    TablePagination,
    TableSelection,
    TableSorting,
    TableState,
} from "./types";
import { defaultRowConfig } from "./utils/formatting";
import { getActionRows, getSelectionMessages, parseActions } from "./utils/selection";
import { sortObjects } from "./utils/sorting";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: "100%",
        },
        toolbar: {
            display: "flex",
            flexWrap: "wrap",
            paddingLeft: 0,
            paddingRight: 0,
        },
        paper: {
            flex: "1 1 0%",
            display: "inline-table",
            marginLeft: "5px",
            marginRight: "5px",
        },
        tableWrapper: {
            display: "flex",
            flex: "1 1 0%",
            paddingBottom: theme.spacing(2),
            marginTop: "5px",
        },
        table: {
            width: "100%",
            minWidth: 750,
        },
        spacer: {
            flex: "1 1 auto",
            order: 10,
        },
        loading: {
            order: 10,
        },
        paginator: {
            order: 10,
            marginLeft: "auto",
        },
    })
);

export interface DataTableProps<T extends ReferenceObject> {
    rows: T[];
    columns: TableColumn<T>[];
    actions?: TableAction<T>[];
    rowConfig?(row: T): RowConfig;
    mouseActionsMapping?: MouseActionsMapping;
    globalActions?: TableGlobalAction[];
    initialState?: TableInitialState<T>;
    forceSelectionColumn?: boolean;
    hideSelectionMessages?: boolean;
    hideColumnVisibilityOptions?: boolean;
    hideSelectAll?: boolean;
    tableNotifications?: TableNotification[];
    filterComponents?: ReactNode; // Portal to the navigation toolbar
    sideComponents?: ReactNode; // Portal to right-most of the Data Table
    ids?: string[]; // Enables selection in all pages (disabled with [])
    loading?: boolean;
    childrenKeys?: string[];
    // State controlled by parent
    sorting?: TableSorting<T>;
    selection?: TableSelection[];
    pagination?: Partial<TablePagination>;
    pageSize?: number;
    pageSizeOptions?: number[];
    onChange?(state: TableState<T>): void;
    resetKey?: string;
}

export function DataTable<T extends ReferenceObject = TableObject>(props: DataTableProps<T>) {
    const classes = useStyles();
    const {
        rows,
        columns,
        rowConfig = defaultRowConfig,
        actions: availableActions = [],
        globalActions = [],
        initialState = {},
        forceSelectionColumn,
        hideSelectionMessages,
        hideColumnVisibilityOptions,
        hideSelectAll,
        tableNotifications = [],
        filterComponents,
        sideComponents,
        ids = rows.map(row => row.id),
        loading = false,
        childrenKeys = [],
        sorting: controlledSorting,
        selection: controlledSelection,
        pagination: controlledPagination,
        pageSize = 25,
        pageSizeOptions = [10, 25, 50, 100],
        onChange = _.noop,
        resetKey,
        mouseActionsMapping,
    } = props;

    const [stateSelection, updateSelection] = useState(initialState.selection || []);
    const [statePagination, updatePagination] = useState(initialState.pagination);
    const [visibleColumns, updateVisibleColumns] = useState([]);
    const [stateSorting, updateSorting] = useState(
        initialState.sorting || {
            field: columns[0].name,
            order: "asc" as const,
        }
    );

    useEffect(() => updatePagination(pagination => ({ ...pagination, page: 1 })), [resetKey]);
    useEffect(() => {
        const newVisibleColumns = columns.filter(({ hidden }) => !hidden).map(({ name }) => name);
        updateVisibleColumns(visibleColumns => _.uniq([...visibleColumns, ...newVisibleColumns]));
    }, [columns]);

    const sorting = controlledSorting || stateSorting;
    const selection = controlledSelection || stateSelection;
    const pagination = {
        total: undefined,
        page: 1,
        ...statePagination,
        ...controlledPagination,
    };

    const rowObjects = controlledPagination
        ? rows
        : sortObjects(rows, columns, pagination, sorting);
    const selectableRows = React.useMemo(() => {
        return rowObjects.filter(row => row.selectable !== false);
    }, [rowObjects]);
    const allSelected =
        rowObjects.length > 0 && _.differenceBy(selectableRows, selection, "id").length === 0;
    const enableMultipleAction = _.isUndefined(forceSelectionColumn)
        ? _.some(availableActions, "multiple")
        : forceSelectionColumn;

    const selectionMessages = hideSelectionMessages
        ? []
        : getSelectionMessages(rowObjects, selection, pagination, ids, childrenKeys);

    // Contextual menu
    const [contextMenuTarget, setContextMenuTarget] = useState<number[] | null>(null);
    const [contextMenuActions, setContextMenuActions] = useState<TableAction<T>[]>([]);
    const [contextMenuRows, setContextMenuRows] = useState<T[]>([]);

    const handleSelectionChange = (selection: TableSelection[]) => {
        updateSelection(selection);
        onChange({ selection, pagination, sorting });
    };

    const handlePaginationChange = (pagination: TablePagination) => {
        updatePagination(pagination);
        onChange({ selection, pagination, sorting });
    };

    const handleSortingChange = (sorting: TableSorting<T>) => {
        const newPagination = { ...pagination, page: 1 };
        updateSorting(sorting);
        updatePagination(newPagination);
        onChange({ selection, pagination: newPagination, sorting });
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        const ids = rowObjects
            .filter(row => {
                const { selectable = true } = rowConfig(row);
                return selectable;
            })
            .map(({ id }) => ({ id }));

        handleSelectionChange(
            event.target.checked
                ? _.uniq(selection.concat(ids))
                : _.differenceBy(selection, ids, "id")
        );
    };

    const handleCloseContextMenu = () => {
        setContextMenuTarget(null);
    };

    const handleOpenContextualMenu = (
        selectedRow: T,
        positionLeft: number,
        positionTop: number
    ) => {
        const actionRows = getActionRows(selectedRow, rows, selection, childrenKeys);
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
                    {loading && <CircularProgress size={30} className={classes.loading} />}
                    <div className={classes.paginator}>
                        <DataTablePagination
                            pageSize={pageSize}
                            pageSizeOptions={pageSizeOptions}
                            pagination={pagination}
                            defaultTotal={rows.length}
                            onChange={handlePaginationChange}
                        />
                    </div>
                </React.Fragment>
            </Toolbar>
            <div className={classes.tableWrapper}>
                <Paper className={classes.paper} square>
                    <Table className={classes.table} size={"medium"}>
                        <DataTableHeader
                            columns={columns}
                            globalActions={globalActions}
                            ids={ids}
                            visibleColumns={visibleColumns}
                            onVisibleColumnsChange={updateVisibleColumns}
                            sorting={sorting}
                            onSortingChange={handleSortingChange}
                            onSelectAllClick={handleSelectAllClick}
                            allSelected={allSelected}
                            tableNotifications={[...tableNotifications, ...selectionMessages]}
                            handleSelectionChange={handleSelectionChange}
                            enableMultipleAction={enableMultipleAction}
                            hideColumnVisibilityOptions={hideColumnVisibilityOptions}
                            hideSelectAll={hideSelectAll}
                        />
                        <DataTableBody
                            rows={rowObjects}
                            columns={columns}
                            rowConfig={rowConfig}
                            visibleColumns={visibleColumns}
                            sorting={sorting}
                            selected={selection}
                            onChange={handleSelectionChange}
                            openContextualMenu={handleOpenContextualMenu}
                            availableActions={availableActions}
                            mouseActionsMapping={mouseActionsMapping}
                            enableMultipleAction={enableMultipleAction}
                            loading={loading}
                            childrenKeys={childrenKeys}
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
                    selection={selection}
                />
            )}
        </div>
    );
}
