import { FormControl, InputLabel, LinearProgress, MenuItem, Select } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import _ from "lodash";
import React from "react";
import i18n from "../utils/i18n";

const style = {
    button: {
        margin: 5,
    },
    progress: {
        height: 2,
        backgroundColor: "rgba(0,0,0,0)",
        top: 46,
    },
    selector: {
        width: "33%",
        marginTop: 18,
    },
};

function addToSelection(orgUnits) {
    const { selectableIds, selected } = this.props;
    const additions = orgUnits.filter(({ id }) => !selectableIds || selectableIds.includes(id));
    const newSelection = _.uniq([...selected, ...additions.map(ou => ou.path)]);

    this.props.onUpdateSelection(newSelection);
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
    const disabled = this.state.loading || !this.state.selection;

    return (
        <div style={{ position: "relative", minHeight: 89 }}>
            <FormControl style={style.selector}>
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

            <div style={{ marginLeft: 10, marginTop: 24, display: "inline-block" }}>
                {this.state.loading && <LinearProgress size={0.5} style={style.progress} />}
                <Button
                    variant="contained"
                    style={style.button}
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
        </div>
    );
}

export { addToSelection, removeFromSelection, handleChangeSelection, renderDropdown };
