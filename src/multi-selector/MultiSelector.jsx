import React from "react";
import PropTypes from "prop-types";
import { Store } from "@dhis2/d2-ui-core";
import { withStyles } from "@material-ui/core/styles";

import GroupEditor from "../group-editor/GroupEditor.component";
import GroupEditorWithOrdering from "../group-editor/GroupEditorWithOrdering.component";
import TextField from "@material-ui/core/TextField";
import i18n from "../utils/i18n";

const styles = () => ({
    searchField: {
        marginTop: 10,
    },
    wrapper: {
        paddingBottom: 20,
    },
});

const optionsPropType = PropTypes.arrayOf(
    PropTypes.shape({
        value: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
    })
);

class MultiSelector extends React.Component {
    isControlled = !!this.props.selected;

    state = {
        selected: [],
        filterText: "",
    };

    static propTypes = {
        d2: PropTypes.object.isRequired,
        height: PropTypes.number,
        ordered: PropTypes.bool,
        options: optionsPropType.isRequired,
        selected: PropTypes.arrayOf(PropTypes.string),
        onChange: PropTypes.func.isRequired,
        searchFilterLabel: PropTypes.oneOf([PropTypes.string, PropTypes.bool]),
    };

    static defaultProps = {
        height: 300,
        ordered: true,
        selected: undefined,
        searchFilterLabel: false,
    };

    // Required by <GroupEditor>
    static childContextTypes = {
        d2: PropTypes.object,
    };

    getChildContext() {
        return {
            d2: i18n.getStubD2WithTranslations(this.props.d2, d2UiTranslations()),
        };
    }

    getSelected = () => {
        return this.isControlled ? this.props.selected : this.state.selected;
    };

    updateSelected = updateFn => {
        const oldSelected = this.getSelected();
        const selected = updateFn(oldSelected);

        if (!this.isControlled) this.setState({ selected });
        this.props.onChange(selected);

        return Promise.resolve();
    };

    assignItems = values => {
        return this.updateSelected(selected => selected.concat(values));
    };

    removeItems = values => {
        const itemValuesToRemove = new Set(values);
        return this.updateSelected(selected =>
            selected.filter(value => !itemValuesToRemove.has(value))
        );
    };

    orderChanged = values => {
        return this.updateSelected(_selected => values);
    };

    textFilterChange = event => {
        this.setState({ filterText: event.target.value });
    };

    render() {
        const { height, options, classes, ordered, searchFilterLabel } = this.props;
        const { filterText } = this.state;

        const selected = this.getSelected();
        const itemStore = Store.create();
        const assignedItemStore = Store.create();
        itemStore.setState(options);
        assignedItemStore.setState(selected);

        const [GroupEditorComponent, extraProps] = ordered
            ? [GroupEditorWithOrdering, { onOrderChanged: this.orderChanged }]
            : [GroupEditor, {}];

        const placeholder =
            searchFilterLabel === true
                ? i18n.t("Search available/selected items")
                : searchFilterLabel;

        return (
            <div className={classes.wrapper} data-multi-selector={true}>
                {searchFilterLabel && (
                    <TextField
                        className={classes.searchField}
                        value={filterText}
                        type="search"
                        onChange={this.textFilterChange}
                        placeholder={placeholder}
                        data-test="search"
                        fullWidth
                    />
                )}

                <GroupEditorComponent
                    itemStore={itemStore}
                    assignedItemStore={assignedItemStore}
                    onAssignItems={this.assignItems}
                    onRemoveItems={this.removeItems}
                    height={height}
                    filterText={filterText}
                    {...extraProps}
                />
            </div>
        );
    }
}

const d2UiTranslations = () => ({
    assign_all: i18n.t("Assign all"),
    remove_all: i18n.t("Remove all"),
    hidden_by_filters: i18n.t("Hidden by filters"),
    selected: i18n.t("selected"),
});

export default withStyles(styles)(MultiSelector);
