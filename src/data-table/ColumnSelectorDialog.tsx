import i18n from "@dhis2/d2-i18n";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import React from "react";
import _ from "lodash";
import { ConfirmationDialog, ReferenceObject, TableColumn } from "..";
import { DialogContent, Checkbox } from "@material-ui/core";

interface ColumnSelectorDialogProps<T extends ReferenceObject> {
    columns: TableColumn<T>[];
    visibleColumns: (keyof T)[];
    onChange: (visibleColumns: (keyof T)[]) => void;
    onCancel: () => void;
}

export function ColumnSelectorDialog<T extends ReferenceObject>(
    props: ColumnSelectorDialogProps<T>
) {
    const { columns, visibleColumns, onChange, onCancel } = props;

    const toggleElement = (name: keyof T) => {
        const newSelection = !visibleColumns.includes(name)
            ? [...visibleColumns, name]
            : visibleColumns.filter(item => item !== name);
        onChange(newSelection);
    };

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Columns to show in table")}
            onCancel={onCancel}
            cancelText={i18n.t("Close")}
            fullWidth
            disableEnforceFocus
        >
            <DialogContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={12}>{i18n.t("Column")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {columns.map(({ name, text }) => {
                            const checked = visibleColumns.includes(name);
                            const disabled = visibleColumns.length <= 1 && checked;

                            return (
                                <TableRow key={`cell-${name}`}>
                                    <TableCell
                                        component="th"
                                        scope="row"
                                        onClick={() => !disabled && toggleElement(name)}
                                    >
                                        <Checkbox
                                            color={"primary"}
                                            checked={checked}
                                            disabled={disabled}
                                            tabIndex={-1}
                                        />
                                        {text}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </DialogContent>
        </ConfirmationDialog>
    );
}

export default ColumnSelectorDialog;
