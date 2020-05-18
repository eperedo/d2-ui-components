import React from "react";
import Button from "@material-ui/core/Button";
import { LinearProgress, Select, MenuItem, FormControl, InputLabel } from "@material-ui/core";
import i18n from "../utils/i18n";

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

function addToSelection(orgUnits) {
    const { selectableIds, selected } = this.props;
    const additions = orgUnits.filter(({ id }) =>
        selectableIds ? selectableIds.includes(id) : true
    );

    this.props.onUpdateSelection(_.uniq([...selected, ...additions.map(ou => ou.path)]));
}

function removeFromSelection(orgUnits) {
    const removedOus = orgUnits.filter(ou => this.props.selected.includes(ou.path));
    const removed = removedOus.map(ou => ou.path);
    const selectedOus = this.props.selected.filter(ou => !removed.includes(ou));

    this.props.onUpdateSelection(selectedOus);
}

function handleChangeSelection(event) {
    this.setState({ selection: event.target.value });
}

function renderDropdown(menuItems, label) {
    return (
        <div style={{ position: "relative", minHeight: 89 }}>
            <FormControl classes={{ root: "org-unit-select-dropdown" }}>
                <InputLabel>{label}</InputLabel>

                <Select
                    value={this.state.selection || ""}
                    onChange={this.handleChangeSelection}
                    disabled={this.state.loading}
                >
                    {menuItems.map(item => (
                        <MenuItem key={item.id} value={item.id}>
                            {item.displayName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {this.renderControls()}
        </div>
    );
}

function renderControls() {
    const disabled = this.state.loading || !this.state.selection;

    return (
        <div style={{ position: "absolute", display: "inline-block", top: 24, marginLeft: 16 }}>
            {this.state.loading && <LinearProgress size={0.5} style={style.progress} />}
            <Button
                variant="contained"
                style={style.button1}
                onClick={this.handleSelect}
                disabled={disabled}
            >
                {i18n.t("Select")}
            </Button>

            <Button
                variant="contained"
                style={style.button}
                onClick={this.handleDeselect}
                disabled={disabled}
            >
                {i18n.t("Deselect")}
            </Button>
        </div>
    );
}

export {
    addToSelection,
    removeFromSelection,
    handleChangeSelection,
    renderDropdown,
    renderControls,
};
