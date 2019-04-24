import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withRouter } from "react-router-dom";
import { SearchBox, SimpleCheckBox } from "d2-ui-components";
import memoize from "nano-memoize";

import Pagination from "../data-table/Pagination.component";
import DataTable from "../data-table/DataTable";
import { setupActions } from "./actions";
import ListActionBar from "./ListActionBar.component";
import WithScroll from "../details-box/WithScroll.component";
import DetailsBox from "../details-box/DetailsBox.component";
import i18n from "../utils/i18n";

import "../data-table/Pagination.scss";
import "../data-table/DataTable.scss";
import { getFormatter } from "../helpers/d2";

class ObjectsTable extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        name: PropTypes.string,
        onCreate: PropTypes.func,
        pageSize: PropTypes.number.isRequired,
        model: PropTypes.object.isRequired,
        initialSorting: PropTypes.array.isRequired, // [fieldName, "asc" | "desc"]
        actions: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                text: PropTypes.string.isRequired,
                multiple: PropTypes.bool.isRequired,
                isActive: PropTypes.func,
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
        ),
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
        customFiltersComponent: PropTypes.func,
        customFilters: PropTypes.object,
        onSelectionChange: PropTypes.func,
    };

    static defaultProps = {
        onSelectionChange: () => {},
    };

    constructor(props) {
        super(props);
        this.state = this._getInitialState();
        this.actions = setupActions(props.actions, this.onContextAction);
        this._getColumns = memoize(this.getColumns.bind(this));
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

    getColumns(columns, selectedHeaderChecked) {
        const { model } = this.props;
        const selectedColumnContents = (
            <SimpleCheckBox
                checked={selectedHeaderChecked}
                onClick={() => this.toggleSelectAll(selectedHeaderChecked)}
                iconStyle={styles.selectColumn}
            />
        );

        const selectColumn = {
            name: "selected",
            style: { width: 20 },
            text: "",
            sortable: false,
            contents: selectedColumnContents,
        };

        return [selectColumn].concat(columns).map(column => ({
            ...column,
            getValue: column.getValue || getFormatter(model, column.name),
        }));
    }

    _getInitialState() {
        return {
            isLoading: true,
            page: 1,
            pager: { total: 0 },
            dataRows: [],
            sorting: this.props.initialSorting,
            searchValue: null,
            detailsObject: null,
            selection: new Set(),
            allObjects: new Set(),
        };
    }

    componentDidMount() {
        this.getObjects({});
        this.getAllObjects();
    }

    getObjectsForCurrentPage() {
        this.getObjects({ clearPage: false });
    }

    notifySelectionChange = () => {
        this.props.onSelectionChange(Array.from(this.state.selection));
    };

    async getObjects({ clearPage = true } = {}) {
        const { d2, pageSize, list, customFilters } = this.props;
        const { page, sorting, searchValue } = this.state;
        const newPage = clearPage ? 1 : page;
        const filters = { search: searchValue, ...customFilters };
        const pagination = { page: newPage, pageSize: pageSize, sorting };
        const { pager, objects } = await list(d2, filters, pagination);

        this.setState(
            {
                isLoading: false,
                pager: pager,
                dataRows: objects,
                page: newPage,
            },
            this.notifySelectionChange
        );
    }

    getAllObjects = async () => {
        const { d2, list, customFilters } = this.props;
        const { searchValue } = this.state;
        const filters = { search: searchValue, ...customFilters };
        const pagination = { paging: false };
        const { objects } = await list(d2, filters, pagination);
        const allObjects = new Set(objects.map(dr => dr.id));

        this.setState({ allObjects });
    };

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

    toggleSelectAll = selectedHeaderChecked => {
        const { selection, dataRows } = this.state;
        const selectionInOtherPages = _.difference(
            Array.from(selection),
            dataRows.map(dr => dr.id)
        );

        const currentPageItems = selectedHeaderChecked ? [] : this.state.dataRows.map(dr => dr.id);
        const newSelection = [...currentPageItems, ...selectionInOtherPages];

        this.setState({ selection: new Set(newSelection) }, this.notifySelectionChange);
    };

    selectAllPages = () => {
        const { allObjects } = this.state;

        this.setState({ selection: new Set(allObjects) }, this.notifySelectionChange);
    };

    clearSelection = () => {
        this.setState({ selection: new Set() }, this.notifySelectionChange);
    };

    onActiveRowsChange = objs => {
        this.setState({ selection: new Set(objs.map(obj => obj.id)) });
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
        const messages = [];

        const selectedAllInCurrentPage =
            !_.isEmpty(dataRows) && dataRows.every(row => selection.has(row.id));
        const selectedAllInAllPages = selection.size === pager.total;
        const selectInAllPagesImplemented = allObjects.size === pager.total;

        if (selectedAllInCurrentPage && !selectedAllInAllPages && selectInAllPagesImplemented) {
            messages.push({
                message: i18n.t("All {{count}} items on this page are selected.", {
                    count: dataRows.length,
                }),
                link: i18n.t("Select all {{count}} items in all pages", { count: pager.total }),
                action: this.selectAllPages,
            });
        }

        const selectionInOtherPages = _.difference(
            Array.from(selection),
            dataRows.map(dr => dr.id)
        );

        if (selectionInOtherPages.length > 0) {
            messages.push({
                message: i18n.t("There are {{count}} items on other pages selected.", {
                    count: selectionInOtherPages.length,
                }),
                link: i18n.t("Clear selection in all pages"),
                action: this.clearSelection,
            });
        }

        return messages;
    };

    render() {
        const { onCreate, columns, detailsFields, model, customFiltersComponent } = this.props;
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

        const selectedHeaderChecked =
            !_.isEmpty(dataRows) && dataRows.every(row => selection.has(row.id));

        const allColumns = this.getColumns(columns, selectedHeaderChecked);

        const activeRows = _(rows)
            .keyBy("id")
            .at(dataRows.filter(dr => selection.has(dr.id)).map(dr => dr.id))
            .value();

        return (
            <div>
                <div>
                    <div style={styles.searchBox}>
                        <SearchBox onChange={this.onSearchChange} />
                    </div>

                    <CustomFilters />

                    <div style={styles.pagination}>
                        <Pagination {...paginationProps} />
                    </div>

                    <div style={styles.spinner}>{isLoading && <CircularProgress size={30} />}</div>

                    <div style={styles.clear} />
                </div>

                <div style={styles.listDetailsWrap}>
                    <div style={styles.dataTableWrap} className="objects-table">
                        {notificationMessages.length > 0 && (
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
                            primaryAction={
                                contextActions.length > 0 ? contextActions[0].fn : undefined
                            }
                            isContextActionAllowed={this.isContextActionAllowed}
                            activeRows={activeRows}
                            onActiveRowsChange={this.onActiveRowsChange}
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

                {onCreate && <ListActionBar onClick={onCreate} />}
            </div>
        );
    }
}

function calculatePageValue(pager, defaultPerPage) {
    const { total, pageCount, page, query } = pager;
    const pageSize = query ? query.pageSize : defaultPerPage;
    const pageCalculationValue = total - (total - (pageCount - (pageCount - page)) * pageSize);
    const startItem = 1 + pageCalculationValue - pageSize;
    const endItem = pageCalculationValue;

    return `${startItem} - ${endItem > total ? total : endItem}`;
}

const styles = {
    searchBox: { float: "left", width: "33%" },
    pagination: { float: "right" },
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

export default withRouter(ObjectsTable);
