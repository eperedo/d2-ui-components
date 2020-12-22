import _ from "lodash";
import log from "loglevel";
import PropTypes from "prop-types";
import React from "react";
import i18n from "../utils/i18n";
import {
    addToSelection,
    handleChangeSelection,
    removeFromSelection,
    renderDropdown,
} from "./common";

class OrgUnitSelectByProgram extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            loading: false,
            selection: undefined,
        };
        this.programCache = {};

        this.addToSelection = addToSelection.bind(this);
        this.removeFromSelection = removeFromSelection.bind(this);
        this.handleChangeSelection = handleChangeSelection.bind(this);

        this.getOrgUnitsForProgram = this.getOrgUnitsForProgram.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleDeselect = this.handleDeselect.bind(this);
    }

    getOrgUnitsForProgram(programId, ignoreCache = false) {
        const { api } = this.context;
        return new Promise(resolve => {
            if (this.props.currentRoot) {
                log.debug(
                    `Loading org units for program ${programId} within ${this.props.currentRoot.displayName}`
                );
                this.setState({ loading: true });

                api.get("/organisationUnits/" + this.props.currentRoot.id, {
                    paging: false,
                    includeDescendants: true,
                    fields: "id,path",
                    filter: `programs.id:eq:${programId}`,
                })
                    .getData()
                    .then(({ organisationUnits }) => organisationUnits)
                    .then(orgUnits => {
                        log.debug(
                            `Loaded ${orgUnits.length} org units for program ${programId} within ${this.props.currentRoot.displayName}`
                        );
                        this.setState({ loading: false });

                        resolve(orgUnits.slice());
                    });
            } else if (!ignoreCache && this.programCache.hasOwnProperty(programId)) {
                resolve(this.programCache[programId].slice());
            } else {
                log.debug(`Loading org units for program ${programId}`);
                this.setState({ loading: true });

                const { api } = this.context;
                api.models.programs
                    .get({
                        fields: { organisationUnits: { id: true, path: true } },
                        filter: { id: { eq: programId } },
                    })
                    .getData()
                    .then(({ objects }) => _.first(objects) || {})
                    .then(({ organisationUnits = [] }) => {
                        log.debug(
                            `Loaded ${organisationUnits.length} org units for program ${programId}`
                        );
                        this.setState({ loading: false });
                        this.programCache[programId] = organisationUnits;

                        // Make a copy of the returned array to ensure that the cache won't be modified from elsewhere
                        resolve(organisationUnits.slice());
                    })
                    .catch(err => {
                        this.setState({ loading: false });
                        log.error(`Failed to load org units in program ${programId}:`, err);
                    });
            }
        });
    }

    handleSelect() {
        this.getOrgUnitsForProgram(this.state.selection).then(this.addToSelection);
    }

    handleDeselect() {
        this.getOrgUnitsForProgram(this.state.selection).then(this.removeFromSelection);
    }

    render() {
        const menuItems = this.props.programs;
        const label = i18n.t("Program");

        // The minHeight on the wrapping div below is there to compensate for the fact that a
        // Material-UI SelectField will change height depending on whether or not it has a value
        return renderDropdown.call(this, menuItems, label);
    }
}

OrgUnitSelectByProgram.propTypes = {
    // programs is an array of either ModelCollection objects or plain objects,
    // where each object should contain `id` and `displayName` properties
    programs: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,

    // selected is an array of selected organisation unit IDs
    selected: PropTypes.array.isRequired,

    // Whenever the selection changes, onUpdateSelection will be called with
    // one argument: The new array of selected organisation unit paths
    onUpdateSelection: PropTypes.func.isRequired,

    // When a the selected item of the dropdown is changed, onItemSelection will be called with
    // one argument: The selected program id in the dropdown
    onItemSelection: PropTypes.func.isRequired,

    // If currentRoot is set, only org units that are descendants of the
    // current root org unit will be added to or removed from the selection
    currentRoot: PropTypes.object,

    // TODO: Add program cache prop?
};

OrgUnitSelectByProgram.contextTypes = { api: PropTypes.any.isRequired };

export default OrgUnitSelectByProgram;
