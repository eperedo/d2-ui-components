import React from "react";
import i18n from "@dhis2/d2-i18n";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@material-ui/core";

class ConfirmationDialog extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        onSave: PropTypes.func,
        onCancel: PropTypes.func,
        saveText: PropTypes.string,
        cancelText: PropTypes.string,
        disableSave: PropTypes.bool,
    };

    static defaultProps = {
        saveText: i18n.t("Save"),
        cancelText: i18n.t("Cancel"),
    };

    render() {
        const {
            title,
            description,
            onSave,
            onCancel,
            isOpen,
            children,
            cancelText,
            saveText,
            disableSave,
            ...other
        } = this.props;

        return (
            <Dialog open={isOpen} onClose={onCancel} {...other}>
                <DialogTitle>{title}</DialogTitle>

                <DialogContent>
                    {description && <DialogContentText>{description}</DialogContentText>}
                    {children}
                </DialogContent>

                <DialogActions>
                    {onCancel && (
                        <Button onClick={onCancel} autoFocus>
                            {cancelText}
                        </Button>
                    )}
                    {onSave && (
                        <Button onClick={onSave} color="primary" disabled={disableSave}>
                            {saveText}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        );
    }
}

export default ConfirmationDialog;
