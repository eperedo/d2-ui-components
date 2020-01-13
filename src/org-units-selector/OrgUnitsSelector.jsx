import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";

import { Card, CardContent } from "@material-ui/core";

import { OrgUnitTree } from "../org-unit-tree";
import { OrgUnitSelectByLevel } from "../org-unit-select";
import { OrgUnitSelectByGroup } from "../org-unit-select";
import { OrgUnitSelectAll } from "../org-unit-select";
import { incrementMemberCount, decrementMemberCount } from "../org-unit-tree";

import i18n from "../utils/i18n";
import SearchBox from "../search-box/SearchBox";

// Base code taken from d2-ui/examples/create-react-app/src/components/org-unit-selector.js

export default class OrgUnitsSelector extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        selected: PropTypes.arrayOf(PropTypes.string).isRequired,
        levels: PropTypes.arrayOf(PropTypes.number),
        rootIds: PropTypes.arrayOf(PropTypes.string),
        listParams: PropTypes.object,
        controls: PropTypes.shape({
            filterByLevel: PropTypes.bool,
            filterByGroup: PropTypes.bool,
            selectAll: PropTypes.bool,
        }),
        withElevation: PropTypes.bool,
        height: PropTypes.number,
        hideCheckboxes: PropTypes.bool,
        fullWidth: PropTypes.bool,
        square: PropTypes.bool,
    };

    static defaultProps = {
        levels: null,
        controls: {
            filterByLevel: true,
            filterByGroup: true,
            selectAll: true,
        },
        withElevation: true,
        height: 350,
        hideCheckboxes: false,
        fullWidth: true,
        square: false,
    };

    static childContextTypes = {
        d2: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            d2: props.d2,
            levels: null,
            roots: null,
            groups: null,
            currentRoot: null,
        };
        this.contentsStyle = { ...styles.contents, height: props.height };

        const { filterByLevel, filterByGroup } = props.controls;

        Promise.all([
            !filterByLevel
                ? Promise.resolve([])
                : props.d2.models.organisationUnitLevels.list({
                      paging: false,
                      fields: "id,level,displayName",
                      order: "level:asc",
                      // bug in old versions of dhis2, cannot use filter=level:in:[1,2] -> HTTP 500
                      ...(props.levels
                          ? {
                                filter: props.levels.map(level => `level:eq:${level}`),
                                rootJunction: "OR",
                            }
                          : {}),
                  }),
            !filterByGroup
                ? Promise.resolve([])
                : props.d2.models.organisationUnitGroups.list({
                      pageSize: 1,
                      paging: false,
                      fields: "id,displayName",
                  }),
            this.getRoots(),
        ]).then(([levels, groups, defaultRoots]) => {
            this.setState({
                roots: defaultRoots,
                levels,
                groups,
            });
        });
    }

    getRoots({ filter } = {}) {
        const { d2, listParams, rootIds } = this.props;
        const pagingOptions = { paging: true, pageSize: 10 };
        let options;

        if (!filter && !rootIds) {
            options = { level: 1, paging: false };
        } else if (!filter && rootIds) {
            options = { filter: `id:in:[${rootIds.join(",")}]`, paging: false };
        } else if (filter && !rootIds) {
            options = { filter, ...pagingOptions };
        } else if (filter && rootIds) {
            // We cannot both filter by name and check inclusion on rootIds on the same request, so
            // let's make a request filtering only by name and later check the rootIds
            // in the response. Also, limit pageSize to avoid an uncontrolled big request.
            options = {
                filter,
                paging: true,
                pageSize: 1000,
                postFilter: orgUnits =>
                    _(orgUnits)
                        .filter(orgUnit => rootIds.some(ouId => orgUnit.path.includes(ouId)))
                        .take(pagingOptions.pageSize)
                        .value(),
            };
        }

        const listOptions = {
            paging: false,
            fields: "id,level, displayName,path",
            ...listParams,
            ..._.omit(options, ["postFilter"]),
        };

        return d2.models.organisationUnits
            .list(listOptions)
            .then(collection => collection.toArray())
            .then(options.postFilter || _.identity);
    }

    getChildContext() {
        return {
            d2: this.props.d2,
        };
    }

    handleSelectionUpdate = newSelection => {
        this.props.onChange(newSelection);
    };

    handleOrgUnitClick = (root, event, orgUnit) => {
        if (this.props.selected.includes(orgUnit.path)) {
            const newSelected = [...this.props.selected];
            newSelected.splice(this.props.selected.indexOf(orgUnit.path), 1);
            decrementMemberCount(root, orgUnit);
            this.props.onChange(newSelected);
        } else {
            incrementMemberCount(root, orgUnit);
            const newSelected = this.props.selected.concat(orgUnit.path);
            this.props.onChange(newSelected);
        }
    };

    handleChildrenLoaded = (root, children) => {
        this.setState(state => ({
            roots: state.roots.map(r => (r.path === root.path ? mergeChildren(r, children) : r)),
        }));
    };

    renderOrgUnitSelectTitle = () => {
        const { currentRoot } = this.state;

        return currentRoot ? (
            <div>
                {i18n.t("For organisation units within")}
                <span style={styles.ouLabel}>{currentRoot.displayName}</span>:{" "}
            </div>
        ) : (
            <div>{i18n.t("For all organisation units")}:</div>
        );
    };

    changeRoot = currentRoot => {
        this.setState({ currentRoot });
    };

    filterOrgUnits = async value => {
        const opts = value ? { filter: `displayName:ilike:${value}` } : undefined;
        const roots = await this.getRoots(opts);
        this.setState({ roots });
    };

    render() {
        if (!this.state.levels) return null;

        const { levels, currentRoot, roots, groups } = this.state;
        const {
            selected,
            controls,
            withElevation,
            selectableLevels,
            typeInput,
            hideCheckboxes,
            fullWidth,
            square,
        } = this.props;
        const { filterByLevel, filterByGroup, selectAll } = controls;
        const someControlsVisible = filterByLevel || filterByGroup || selectAll;
        const { renderOrgUnitSelectTitle: OrgUnitSelectTitle } = this;
        const initiallyExpanded = roots.length > 1 ? [] : roots.map(ou => ou.path);
        const getClass = root => `ou-root-${root.path.split("/").length - 1}`;

        const leftStyles = {
            ...styles.left,
            width: someControlsVisible ? 500 : fullWidth ? 1000 : undefined,
        };

        const cardWideStyle = {
            ...styles.cardWide,
            boxShadow: !withElevation ? "none" : undefined,
            width: someControlsVisible ? 1052 : undefined,
        };

        return (
            <Card style={cardWideStyle} square={square}>
                <CardContent style={styles.cardText}>
                    <div style={styles.searchBox}>
                        <SearchBox onChange={this.filterOrgUnits} />
                    </div>

                    <div style={this.contentsStyle}>
                        <div style={leftStyles}>
                            {roots.map(root => (
                                <div key={root.path} className={`ou-root ${getClass(root)}`}>
                                    <OrgUnitTree
                                        root={root}
                                        selected={selected}
                                        currentRoot={currentRoot}
                                        initiallyExpanded={initiallyExpanded}
                                        onSelectClick={this.handleOrgUnitClick.bind(this, root)}
                                        selectableLevels={selectableLevels}
                                        typeInput={typeInput}
                                        onChangeCurrentRoot={this.changeRoot}
                                        onChildrenLoaded={this.handleChildrenLoaded.bind(
                                            this,
                                            root
                                        )}
                                        hideCheckboxes={hideCheckboxes}
                                    />
                                </div>
                            ))}
                        </div>

                        {someControlsVisible && (
                            <div style={styles.right}>
                                {(filterByLevel || filterByGroup) && (
                                    <div>
                                        <OrgUnitSelectTitle />

                                        {filterByLevel && (
                                            <div style={styles.selectByLevel}>
                                                <OrgUnitSelectByLevel
                                                    levels={levels}
                                                    selected={selected}
                                                    currentRoot={currentRoot}
                                                    onUpdateSelection={this.handleSelectionUpdate}
                                                />
                                            </div>
                                        )}

                                        {filterByGroup && (
                                            <div>
                                                <OrgUnitSelectByGroup
                                                    groups={groups}
                                                    selected={selected}
                                                    currentRoot={currentRoot}
                                                    onUpdateSelection={this.handleSelectionUpdate}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectAll && (
                                    <div style={styles.selectAll}>
                                        <OrgUnitSelectAll
                                            selected={selected}
                                            currentRoot={currentRoot}
                                            onUpdateSelection={this.handleSelectionUpdate}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }
}

// This is a modified version of mergeChildren from @dhis2/d2-ui-org-unit-tree.
// The original function works when root is the absolute root of the tree (level 1), but
// here we will have any organisation unit as root when filtering.
function mergeChildren(root, children) {
    function assignChildren(root, targetPath, children) {
        if (root.path === "/" + targetPath.join("/")) {
            root.children = children;
        } else {
            const rootLevel = root.path.split("/").length - 1;
            const nextRoot = root.children.get(targetPath.slice(rootLevel)[0]);
            if (nextRoot) {
                assignChildren(nextRoot, targetPath, children);
            } else {
                /* eslint-disable no-console */
                console.error("Cannot find root children", root, targetPath);
            }
        }
        return root;
    }

    const firstChild = children.toArray()[0];
    if (!firstChild) {
        return root;
    } else {
        const childPath = firstChild.path.slice(1).split("/");
        const parentPath = childPath.slice(0, childPath.length - 1);
        return assignChildren(root, parentPath, children);
    }
}

const styles = {
    cardWide: {
        display: "inline-block",
        margin: 0,
        transition: "all 175ms ease-out",
    },
    cardText: {
        paddingTop: 10,
        height: "auto",
        position: "relative",
    },
    cardHeader: {
        padding: "16px",
        margin: "16px -16px",
        borderBottom: "1px solid #eeeeee",
    },
    searchBox: {
        width: 300,
        marginBottom: 10,
    },
    contents: {
        height: 350,
        position: "relative",
        overflowY: "auto",
    },
    left: {
        display: "inline-block",
        position: "absolute",
        overflowY: "auto",
    },
    right: {
        display: "inline-block",
        position: "absolute",
        width: 500,
        right: 16,
    },
    ouLabel: {
        background: "rgba(0,0,0,0.05)",
        borderRadius: 5,
        border: "1px solid rgba(0,0,0,0.1)",
        padding: "1px 6px 1px 3px",
        fontStyle: "italic",
        margin: 4,
    },
    selectByLevel: {
        marginBottom: -24,
        marginTop: 0,
    },
    selectAll: {
        marginTop: 20,
    },
};
