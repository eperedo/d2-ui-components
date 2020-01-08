import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import CircularProgress from "@material-ui/core/CircularProgress";
import { SearchBox, SimpleCheckBox } from "d2-ui-components";

import Pagination from "../old-data-table/Pagination.component";
import DataTable from "../old-data-table/DataTable";
import { setupActions } from "./actions";
import ListActionBar from "./ListActionBar.component";
import WithScroll from "../details-box/WithScroll.component";
import DetailsBox from "../details-box/DetailsBox.component";
import i18n from "../utils/i18n";

import "../old-data-table/Pagination.scss";
import "../old-data-table/DataTable.scss";
import { getFormatter } from "../helpers/d2";

class ObjectsTable extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        onButtonClick: PropTypes.func,
        pageSize: PropTypes.number.isRequired,
        model: PropTypes.object,
        initialSorting: PropTypes.array, // [columnName: string, "asc" | "desc"]
        actions: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                text: PropTypes.string.isRequired,
                multiple: PropTypes.bool.isRequired,
                isActive: PropTypes.func,
                isPrimary: PropTypes.bool,
                type: PropTypes.oneOf(["details"]),
                onClick: PropTypes.func,
            })
        ),
        columns: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                text: PropTypes.string.isRequired,
                sortable: PropTypes.bool.isRequired,
                getValue: PropTypes.func,
                style: PropTypes.object,
                contents: PropTypes.element,
            })
        ).isRequired,
        /*  list: async function that returns paginated D2 objects.

            list(
                d2,
                filters: {search: string, [...customFilters]},
                pagination: {page: number, pageSize: number, sorting: [field, "asc" | "desc"]}
            ): {
                pager: {
                    page: number
                    pageCount: number
                    total: number
                    pageSize: number,
                },
                objects: object[],
            }
        */
        list: PropTypes.func.isRequired,
        disableMultiplePageSelection: PropTypes.bool,
        customFiltersComponent: PropTypes.func,
        customFilters: PropTypes.object,
        onSelectionChange: PropTypes.func,
        initialSelection: PropTypes.array,
        buttonLabel: PropTypes.node,
        hideSearchBox: PropTypes.bool,
        forceSelectionColumn: PropTypes.bool,
    };

    static defaultProps = {
        onSelectionChange: () => {},
        buttonLabel: null,
        hideSearchBox: false,
        initialSelection: [],
        forceSelectionColumn: undefined,
        disableMultiplePageSelection: false,
    };

    constructor(props) {
        super(props);
        this.state = this._getInitialState();
        this.actions = setupActions(props.actions, this.onContextAction);
        this.columnsWithFormatter = props.columns.map(column => ({
            ...column,
            getValue: column.getValue || getFormatter(props.model, column.name),
        }));
    }

    closeDetails = () => {
        this.setState({ detailsObject: null });
    };

    onContextAction = (name, data) => {
        const action = _(this.props.actions)
            .keyBy("name")
            .get(name);

        if (action.type === "details") {
            this.setState({ detailsObject: data });
        } else if (action.onClick) {
            action.onClick(data);
        }
    };

    getSelectColumn() {
        const { actions, forceSelectionColumn } = this.props;
        const isSomeActionMultiple = _(actions).some("multiple");
        const columnIsVisible =
            forceSelectionColumn || (_.isNil(forceSelectionColumn) && isSomeActionMultiple);

        if (!columnIsVisible) return null;

        const selectedColumnContents = (
            <SimpleCheckBox
                checked={this.allSelected()}
                onClick={this.toggleSelectAll}
                iconStyle={styles.selectColumn}
            />
        );

        return {
            name: "selected",
            style: { width: 20 },
            text: "",
            sortable: false,
            contents: selectedColumnContents,
        };
    }

    getColumns() {
        return _.compact([this.getSelectColumn(), ...this.columnsWithFormatter]);
    }

    getDefaultSorting() {
        const columnName = _(this.props.columns)
            .map(column => (column.sortable ? column.name : null))
            .compact()
            .first();
        return columnName ? [columnName, "asc"] : null;
    }

    _getInitialState() {
        return {
            isLoading: true,
            page: 1,
            pager: { total: 0 },
            dataRows: [],
            sorting: this.props.initialSorting || this.getDefaultSorting(),
            searchValue: null,
            detailsObject: null,
            selection: new Set(this.props.initialSelection),
            allObjects: new Set(),
        };
    }

    componentDidMount() {
        this.getObjects({});
    }

    getObjectsForCurrentPage() {
        this.getObjects({ clearPage: false });
    }

    notifySelectionChange = () => {
        this.props.onSelectionChange(Array.from(this.state.selection));
    };

    async getObjects({ clearPage = true } = {}) {
        const { d2, pageSize, list, customFilters, disableMultiplePageSelection } = this.props;
        const { page, sorting, searchValue } = this.state;
        const newPage = clearPage ? 1 : page;
        const filters = { search: searchValue, ...customFilters };
        const pagination = { page: newPage, pageSize: pageSize, sorting };
        const { pager, objects } = await list(d2, filters, pagination);

        let selection,
            allObjects = [];
        if (!disableMultiplePageSelection) {
            const allObjectsFilters = { ...filters, fields: ["id"] };
            const allObjectsPagination = { paging: false };
            const { objects: ids } = await list(d2, allObjectsFilters, allObjectsPagination);
            allObjects = new Set(ids.map(dr => dr.id));
            selection = this.state.selection;
        } else {
            allObjects = [];
            selection = new Set();
        }

        this.setState(
            {
                isLoading: false,
                pager: pager,
                dataRows: objects,
                page: newPage,
                allObjects,
                detailsObject: null,
                selection,
            },
            this.notifySelectionChange
        );
    }

    onSearchChange = value => {
        this.setState(
            {
                isLoading: true,
                searchValue: value,
            },
            this.getObjects
        );
    };

    toggleSelect(ev, obj) {
        ev.preventDefault();
        ev.stopPropagation();

        const selection = new Set(this.state.selection);
        const found = selection.delete(obj.id);
        if (!found) selection.add(obj.id);

        this.setState({ selection }, this.notifySelectionChange);
    }

    allSelected() {
        const { dataRows, selection } = this.state;
        return !_.isEmpty(dataRows) && dataRows.every(row => selection.has(row.id));
    }

    toggleSelectAll = () => {
        const { dataRows, selection } = this.state;

        const selectionInOtherPages = _.difference(
            Array.from(selection),
            dataRows.map(dr => dr.id)
        );

        const currentPageItems = this.allSelected() ? [] : this.state.dataRows.map(dr => dr.id);

        this.setState(
            { selection: new Set([...currentPageItems, ...selectionInOtherPages]) },
            this.notifySelectionChange
        );
    };

    selectAllPages = () => {
        const { selection, allObjects } = this.state;

        this.setState(
            { selection: new Set([...selection, ...allObjects]) },
            this.notifySelectionChange
        );
    };

    clearSelection = () => {
        this.setState({ selection: new Set() }, this.notifySelectionChange);
    };

    onColumnSort = sorting => {
        this.setState({ sorting, isLoading: true }, this.getObjects);
    };

    componentDidUpdate = prevProps => {
        if (this.props.customFilters !== prevProps.customFilters) {
            this.setState({ isLoading: true }, this.getObjects);
        }
    };

    getPaginationProps() {
        const { pager } = this.state;
        const { pageSize } = this.props;

        const isPagerValid = _(["page", "total"])
            .difference(_.keys(pager || {}))
            .isEmpty();
        if (!isPagerValid) return {};
        const pageCount = Math.ceil(pager.total / pageSize);

        return {
            hasNextPage: () => pager.page < pageCount,
            hasPreviousPage: () => pager.page > 1,
            onNextPageClick: () => {
                this.setState(
                    {
                        isLoading: true,
                        page: pager.page + 1,
                    },
                    this.getObjectsForCurrentPage
                );
            },
            onPreviousPageClick: () => {
                this.setState(
                    {
                        isLoading: true,
                        page: pager.page - 1,
                    },
                    this.getObjectsForCurrentPage
                );
            },
            total: pager.total,
            currentlyShown: calculatePageValue(pager, pageSize),
        };
    }

    isContextActionAllowed = (...args) => {
        return this.actions.isContextActionAllowed(this.props.d2, ...args);
    };

    getSelectionMessages = () => {
        const { allObjects, dataRows, selection, pager } = this.state;
        const { disableMultiplePageSelection } = this.props;
        if (_.isEmpty(dataRows) || disableMultiplePageSelection) return [];

        const allSelected = selection.size === pager.total;
        const selectionInOtherPages = _.difference(
            [...selection],
            dataRows.map(dr => dr.id)
        );
        const allSelectedInPage = dataRows.every(row => selection.has(row.id));
        const multiplePagesAvailable = pager.total > dataRows.length;
        const selectAllImplemented = allObjects.size === pager.total;

        return _.compact([
            allSelected
                ? {
                      message: i18n.t("There are {{total}} items selected in all pages.", {
                          total: selection.size,
                      }),
                      link: i18n.t("Clear selection"),
                      action: this.clearSelection,
                  }
                : null,
            !allSelected && selectionInOtherPages.length > 0
                ? {
                      message: i18n.t(
                          "There are {{count}} items selected ({{invisible}} on other pages).",
                          { count: selection.size, invisible: selectionInOtherPages.length }
                      ),
                      link: i18n.t("Clear selection"),
                      action: this.clearSelection,
                  }
                : null,
            !allSelected && allSelectedInPage && multiplePagesAvailable && selectAllImplemented
                ? {
                      message: i18n.t("All {{total}} items on this page are selected.", {
                          total: dataRows.length,
                      }),
                      link: i18n.t("Select all {{total}} items in all pages", {
                          total: pager.total,
                      }),
                      action: this.selectAllPages,
                  }
                : null,
        ]);
    };

    render() {
        const {
            onButtonClick,
            detailsFields,
            customFiltersComponent,
            buttonLabel,
            hideSearchBox,
            model,
        } = this.props;
        const { dataRows, sorting, selection, isLoading, detailsObject } = this.state;
        const { contextActions, contextMenuIcons } = this.actions;
        const notificationMessages = this.getSelectionMessages();

        const paginationProps = this.getPaginationProps();
        const rows = dataRows.map(dr =>
            Object.assign({}, dr, {
                selected: (
                    <SimpleCheckBox
                        onClick={ev => this.toggleSelect(ev, dr)}
                        checked={selection.has(dr.id)}
                    />
                ),
            })
        );

        const CustomFilters = customFiltersComponent || (() => null);

        const detailsFieldsProcessed = detailsFields.map(field => ({
            ...field,
            getValue: field.getValue || getFormatter(model, field.name),
        }));

        const allColumns = this.getColumns();

        const activeRows = _(rows)
            .keyBy("id")
            .at(dataRows.filter(dr => selection.has(dr.id)).map(dr => dr.id))
            .value();

        const defaultAction = _(contextActions).find({ isPrimary: true }) || contextActions[0];
        const primaryAction = defaultAction ? defaultAction.fn : undefined;

        return (
            <div style={styles.mainWrapper}>
                <div>
                    {!hideSearchBox && (
                        <div style={styles.searchBox}>
                            <SearchBox onChange={this.onSearchChange} />
                        </div>
                    )}

                    <CustomFilters />

                    <div style={styles.pagination}>
                        <Pagination {...paginationProps} />
                    </div>

                    <div style={styles.spinner}>{isLoading && <CircularProgress size={30} />}</div>

                    <div style={styles.clear} />
                </div>

                <div style={styles.listDetailsWrap}>
                    <div style={styles.dataTableWrap} className="objects-table">
                        {dataRows.length > 0 && notificationMessages.length > 0 && (
                            <div style={styles.notificationPanel}>
                                {notificationMessages.map((notification, index) => (
                                    <div style={styles.notification} key={"notification-" + index}>
                                        <span style={styles.notificationText}>
                                            {notification.message}
                                        </span>
                                        <span
                                            style={styles.notificationLink}
                                            onClick={notification.action}
                                        >
                                            {notification.link}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <DataTable
                            rows={rows}
                            columns={allColumns}
                            sorting={sorting}
                            onColumnSort={this.onColumnSort}
                            contextMenuActions={contextActions}
                            contextMenuIcons={contextMenuIcons}
                            primaryAction={primaryAction}
                            isContextActionAllowed={this.isContextActionAllowed}
                            activeRows={activeRows}
                            isMultipleSelectionAllowed={true}
                        />

                        {dataRows.length > 0 || isLoading ? null : (
                            <div>{i18n.t("No results found")}</div>
                        )}
                    </div>

                    {detailsObject ? (
                        <div style={styles.detailsBoxWrap}>
                            <WithScroll alignTo=".objects-table">
                                <DetailsBox
                                    alignTo=".objects-table"
                                    fields={detailsFieldsProcessed}
                                    style={styles.detailsBoxWrap}
                                    object={detailsObject}
                                    onClose={this.closeDetails}
                                />
                            </WithScroll>
                        </div>
                    ) : null}
                </div>

                {onButtonClick && <ListActionBar onClick={onButtonClick} label={buttonLabel} />}
            </div>
        );
    }
}

function calculatePageValue(pager, pageSize) {
    const { total, page } = pager;
    const pageCount = Math.ceil(total / pageSize);
    const pageCalculationValue = total - (total - (pageCount - (pageCount - page)) * pageSize);
    const startItem = 1 + pageCalculationValue - pageSize;
    const endItem = pageCalculationValue;

    return `${startItem} - ${endItem > total ? total : endItem}`;
}

const styles = {
    searchBox: { float: "left", width: "33%" },
    pagination: { float: "right" },
    mainWrapper: { marginTop: -10 },
    spinner: { float: "right" },
    clear: { clear: "both" },
    selectColumn: { width: "auto" },
    dataTableWrap: {
        display: "flex",
        flexDirection: "column",
        flex: 2,
    },
    detailsBoxWrap: {
        flex: 1,
        marginLeft: "1rem",
        marginRight: "1rem",
        marginTop: 5,
        opacity: 1,
        flexGrow: 0,
        maxWidth: 500,
        minWidth: 300,
    },
    listDetailsWrap: {
        flex: 1,
        display: "flex",
        flexOrientation: "row",
    },
    notificationPanel: {
        captionSide: "top",
        display: "table-caption",
        textAlign: "center",
        padding: "0.5rem",
        backgroundColor: "#E0E0E0",
        margin: "0.25rem 0 0.5rem",
    },
    notification: {
        padding: "0.75rem",
    },
    notificationText: {
        letterSpacing: ".25px",
        color: "#5F6368",
    },
    notificationLink: {
        letterSpacing: ".25px",
        cursor: "pointer",
        fontWeight: 500,
        color: "#1A73E8",
        padding: "0 8px",
    },
};

export default ObjectsTable;
