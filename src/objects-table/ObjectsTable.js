import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import Checkbox from "material-ui/Checkbox/Checkbox";
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
            <Checkbox
                checked={selectedHeaderChecked}
                onCheck={() => this.onSelectAllToggle(selectedHeaderChecked)}
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
        };
    }

    componentDidMount() {
        this.getObjects({});
    }

    getObjectsForCurrentPage() {
        this.getObjects({ clearPage: false });
    }

    async getObjects({ clearPage = true } = {}) {
        const { d2, pageSize, list, customFilters } = this.props;
        const { page, sorting, searchValue } = this.state;
        const newPage = clearPage ? 1 : page;
        const filters = { search: searchValue, ...customFilters };
        const pagination = { page: newPage, pageSize: pageSize, sorting };
        const { pager, objects } = await list(d2, filters, pagination);
        const dataRows = objects.map(dr => ({ ...dr, selected: false }));

        this.setState({
            isLoading: false,
            pager: pager,
            dataRows: dataRows,
            page: newPage,
        });
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

    onSelectToggle(ev, obj) {
        ev.preventDefault();
        ev.stopPropagation();
        this.setState({
            dataRows: this.state.dataRows.map(dr =>
                dr.id === obj.id ? _.merge(dr, { selected: !dr.selected }) : dr
            ),
        });
    }

    onSelectAllToggle = value => {
        this.setState({
            dataRows: this.state.dataRows.map(dr => _.merge(dr, { selected: !value })),
        });
    };

    onActiveRowsChange = objs => {
        const selectedIds = new Set(objs.map(obj => obj.id));

        this.setState({
            dataRows: this.state.dataRows.map(dr =>
                _.merge(dr, { selected: selectedIds.has(dr.id) })
            ),
        });
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

        const isValidPage = _(["page", "total"])
            .difference(_.keys(pager || {}))
            .isEmpty();
        if (!isValidPage) return {};
        const pageCount = Math.ceil(pager.total / pager.pageSize);

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
            currentlyShown: calculatePageValue(pager, this.props.pageSize),
        };
    }

    isContextActionAllowed = (...args) => {
        return this.actions.isContextActionAllowed(this.props.d2, ...args);
    };

    render() {
        const { onCreate, columns, detailsFields, model, customFiltersComponent } = this.props;
        const { dataRows, sorting } = this.state;
        const paginationProps = this.getPaginationProps();
        const rows = dataRows.map(dr =>
            Object.assign({}, dr, {
                selected: (
                    <SimpleCheckBox
                        onClick={ev => this.onSelectToggle(ev, dr)}
                        checked={dr.selected}
                    />
                ),
            })
        );

        const CustomFilters = customFiltersComponent || (() => null);

        const detailsFieldsProcessed = detailsFields.map(field => ({
            ...field,
            getValue: field.getValue || getFormatter(model, field.name),
        }));

        const selectedHeaderChecked = !_.isEmpty(dataRows) && dataRows.every(row => row.selected);

        const allColumns = this.getColumns(columns, selectedHeaderChecked);

        const activeRows = _(rows)
            .keyBy("id")
            .at(dataRows.filter(dr => dr.selected).map(dr => dr.id))
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

                    <div style={styles.spinner}>
                        {this.state.isLoading && <CircularProgress size={30} />}
                    </div>

                    <div style={styles.clear} />
                </div>

                <div style={styles.listDetailsWrap}>
                    <div style={styles.dataTableWrap} className="objects-table">
                        <DataTable
                            rows={rows}
                            columns={allColumns}
                            sorting={sorting}
                            onColumnSort={this.onColumnSort}
                            contextMenuActions={this.actions.contextActions}
                            contextMenuIcons={this.actions.contextMenuIcons}
                            primaryAction={this.actions.contextActions[0].fn}
                            isContextActionAllowed={this.isContextActionAllowed}
                            activeRows={activeRows}
                            onActiveRowsChange={this.onActiveRowsChange}
                            isMultipleSelectionAllowed={true}
                        />
                        {dataRows.length > 0 || this.state.isLoading ? null : (
                            <div>{i18n.t("No results found")}</div>
                        )}
                    </div>
                    {this.state.detailsObject ? (
                        <div style={styles.detailsBoxWrap}>
                            <WithScroll alignTo=".objects-table">
                                <DetailsBox
                                    alignTo=".objects-table"
                                    fields={detailsFieldsProcessed}
                                    style={styles.detailsBoxWrap}
                                    object={this.state.detailsObject}
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
};

export default withRouter(ObjectsTable);
