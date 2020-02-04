import React from "react";
import PropTypes from "prop-types";
import log from "loglevel";
import Button from "@material-ui/core/Button";
import i18n from "../utils/i18n";

import { addToSelection, removeFromSelection } from "./common";

const style = {
    button: {
        position: "relative",
        top: 3,
        marginLeft: 16,
    },
    progress: {
        height: 2,
        backgroundColor: "rgba(0,0,0,0)",
        top: 46,
    },
};
style.button1 = Object.assign({}, style.button, { marginLeft: 0 });

class OrgUnitSelectAll extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            loading: false,
            cache: null,
        };

        this.addToSelection = addToSelection.bind(this);
        this.removeFromSelection = removeFromSelection.bind(this);

        this.handleSelectAll = this.handleSelectAll.bind(this);
        this.handleDeselectAll = this.handleDeselectAll.bind(this);
    }

    handleSelectAll() {
        if (this.props.currentRoot) {
            this.setState({ loading: true });
            this.getDescendantOrgUnits().then(orgUnits => {
                this.setState({ loading: false });
                this.addToSelection(orgUnits);
            });
        } else if (Array.isArray(this.state.cache)) {
            this.props.onUpdateSelection(this.state.cache.slice());
        } else {
            this.setState({ loading: true });

            this.context.api.models.organisationUnits
                .get({ fields: { id: true, path: true }, paging: false })
                .getData()
                .then(({ objects }) => objects)
                .then(orgUnits => {
                    const ous = orgUnits.map(ou => ou.path);
                    this.setState({
                        cache: ous,
                        loading: false,
                    });

                    this.props.onUpdateSelection(ous.slice());
                })
                .catch(err => {
                    this.setState({ loading: false });
                    log.error("Failed to load all org units:", err);
                });
        }
    }

    getDescendantOrgUnits() {
        return this.context.api.models.organisationUnits
            .get({
                root: this.props.currentRoot.id,
                paging: false,
                includeDescendants: true,
                fields: { id: true, path: true },
            })
            .getData()
            .then(({ objects }) => objects);
    }

    handleDeselectAll() {
        if (this.props.currentRoot) {
            this.setState({ loading: true });
            this.getDescendantOrgUnits().then(orgUnits => {
                this.setState({ loading: false });
                this.removeFromSelection(orgUnits);
            });
        } else {
            this.props.onUpdateSelection([]);
        }
    }

    render() {
        return (
            <div>
                <Button
                    variant="contained"
                    style={style.button1}
                    onClick={this.handleSelectAll}
                    disabled={this.state.loading}
                >
                    {i18n.t("Select all")}
                </Button>

                <Button
                    variant="contained"
                    style={style.button}
                    onClick={this.handleDeselectAll}
                    disabled={this.state.loading}
                >
                    {i18n.t("Deselect all")}
                </Button>
            </div>
        );
    }
}

OrgUnitSelectAll.propTypes = {
    // selected is an array of selected organisation unit IDs
    selected: PropTypes.array.isRequired,

    // Whenever the selection changes, onUpdateSelection will be called with
    // one argument: The new array of selected organisation unit paths
    onUpdateSelection: PropTypes.func.isRequired,

    // If currentRoot is set, only org units that are descendants of the
    // current root org unit will be added to or removed from the selection
    currentRoot: PropTypes.object,
};

OrgUnitSelectAll.contextTypes = { api: PropTypes.object.isRequired };

export default OrgUnitSelectAll;
