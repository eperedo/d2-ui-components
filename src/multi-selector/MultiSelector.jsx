import React from "react";
import PropTypes from "prop-types";
import GroupEditor from "@dhis2/d2-ui-group-editor/GroupEditor.component";
import GroupEditorWithOrdering from "@dhis2/d2-ui-group-editor/GroupEditorWithOrdering.component";
import { Store } from "@dhis2/d2-ui-core";
import { withStyles } from "@material-ui/core/styles";
import i18n from "../utils/i18n";

const styles = () => ({
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
    static propTypes = {
        d2: PropTypes.object.isRequired,
        height: PropTypes.number,
        ordered: PropTypes.bool.isRequired,
        options: optionsPropType.isRequired,
        selected: PropTypes.arrayOf(PropTypes.string).isRequired,
    };

    static defaultProps = {
        height: 300,
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

    assignItems = values => {
        const newValues = this.props.selected.concat(values);
        this.props.onChange(newValues);
        return Promise.resolve();
    };

    unassignItems = values => {
        const itemValuesToRemove = new Set(values);
        const newValues = this.props.selected.filter(value => !itemValuesToRemove.has(value));
        this.props.onChange(newValues);
        return Promise.resolve();
    };

    orderChanged = values => {
        this.props.onChange(values);
        return Promise.resolve();
    };

    render() {
        const { height, options, selected, classes, ordered } = this.props;

        const itemStore = Store.create();
        const assignedItemStore = Store.create();
        itemStore.setState(options);
        assignedItemStore.setState(selected);

        const [GroupEditorComponent, extraProps] = ordered
            ? [GroupEditorWithOrdering, { onOrderChanged: this.orderChanged }]
            : [GroupEditor, {}];

        return (
            <div className={classes.wrapper} data-multi-selector={true}>
                <GroupEditorComponent
                    itemStore={itemStore}
                    assignedItemStore={assignedItemStore}
                    onAssignItems={this.assignItems}
                    onRemoveItems={this.unassignItems}
                    height={height}
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
