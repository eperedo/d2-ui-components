import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogProps,
    DialogTitle,
} from "@material-ui/core";
import _ from "lodash";
import React, { ReactNode } from "react";
import i18n from "../utils/i18n";

export interface ConfirmationDialogProps extends Partial<DialogProps> {
    isOpen?: boolean;
    title?: string;
    description?: string | ReactNode;
    onSave?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    onCancel?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    saveText?: string;
    cancelText?: string;
    disableSave?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    title = "",
    description,
    onSave,
    onCancel,
    isOpen = false,
    children,
    cancelText = i18n.t("Cancel"),
    saveText = i18n.t("Save"),
    disableSave = false,
    ...other
}) => {
    return (
        <Dialog open={isOpen} onClose={onCancel || _.noop} {...other}>
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                {description && renderNode(description)}
                {children}
            </DialogContent>

            <DialogActions>
                {onCancel && (
                    <Button key={"cancel"} onClick={onCancel} autoFocus>
                        {cancelText}
                    </Button>
                )}
                {onSave && (
                    <Button key={"save"} onClick={onSave} color="primary" disabled={disableSave}>
                        {saveText}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

function renderNode(node: ReactNode) {
    if (typeof node === "string") {
        return node.split("\n").map((text, idx) => <p key={idx}>{text}</p>);
    } else {
        return node;
    }
}

export default ConfirmationDialog;
