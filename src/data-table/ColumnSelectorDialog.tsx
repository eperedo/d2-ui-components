import { DialogContent } from "@material-ui/core";
import React from "react";
import { ConfirmationDialog, ReferenceObject, TableColumn } from "..";
import { TableColumnSelector } from "./TableColumnSelector";
import i18n from "../utils/i18n";
import { TransferOption, Transfer } from "@dhis2/ui";

interface ColumnSelectorDialogProps<T extends ReferenceObject> {
    columns: TableColumn<T>[];
    visibleColumns: (keyof T)[];
    reorder?: boolean;
    onChange: (visibleColumns: (keyof T)[]) => void;
    onCancel: () => void;
}

export function ColumnSelectorDialog<T extends ReferenceObject>(
    props: ColumnSelectorDialogProps<T>
) {
    const { columns, visibleColumns, onChange, onCancel, reorder = true } = props;
    const transferOptions: TransferOption[] = columns.map(
        ({ name, text: label }): TransferOption => ({ label, value: name.toString() })
    );
    const selected = visibleColumns.map(column => column.toString());
    const tableColumnSelectorProps = { columns, visibleColumns, onChange };

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
                {reorder && (
                    <Transfer
                        enableOrderChange
                        onChange={({ selected }) => onChange(selected as (keyof T)[])}
                        options={transferOptions}
                        selected={selected}
                    />
                )}

                {!reorder && <TableColumnSelector {...tableColumnSelectorProps} />}
            </DialogContent>
        </ConfirmationDialog>
    );
}

export default ColumnSelectorDialog;
