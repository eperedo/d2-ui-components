import { MenuItem, MenuProps, Select } from "@material-ui/core";
import React from "react";
import { DropdownForm, DropdownItem } from "./GenericDropdown";

export interface MultipleDropdownProps<Value extends string = string> {
    className?: string;
    items: DropdownItem[];
    onChange: (values: Value[]) => void;
    label: string;
    values: Value[];
}

const menuProps: Partial<MenuProps> = {
    getContentAnchorEl: null,
    anchorOrigin: { vertical: "bottom", horizontal: "left" },
};

export const MultipleDropdown: React.FC<MultipleDropdownProps> = React.memo(props => {
    const { items, values, onChange, label, className } = props;
    const notifyChange = React.useCallback(ev => onChange(ev.target.value as string[]), [onChange]);

    return (
        <DropdownForm className={className} label={label}>
            <Select
                multiple={true}
                data-test-multiple-dropdown={label}
                value={values}
                onChange={notifyChange}
                MenuProps={menuProps}
            >
                {items.map(item => (
                    <MenuItem key={item.value} value={item.value}>
                        {item.text}
                    </MenuItem>
                ))}
            </Select>
        </DropdownForm>
    );
});
