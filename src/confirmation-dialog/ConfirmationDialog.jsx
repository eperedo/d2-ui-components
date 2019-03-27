import React from "react";
import i18n from "@dhis2/d2-i18n";
import PropTypes from "prop-types";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import { DialogContent, DialogActions, Button } from "@material-ui/core";

class ConfirmationDialog extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        onSave: PropTypes.func,
        onCancel: PropTypes.func,
        saveText: PropTypes.string,
        cancelText: PropTypes.string,
    };

    static defaultProps = {
        saveText: i18n.t("Save"),
        cancelText: i18n.t("Cancel"),
    };

    render() {
        const { title, description, onSave, onCancel, isOpen, children, cancelText, saveText, ...other } = this.props;

        return (
            <React.Fragment>
                <Dialog
                    open={isOpen}
                    onClose={onCancel ? onCancel : () => null}
                    {...other}
                >
                    <DialogTitle>
                        {title}
                    </DialogTitle>

                    {description && <DialogContent>
                        {description}
                    </DialogContent>}

                    {children}

                    <DialogActions>
                        {onCancel && <Button onClick={onCancel} autoFocus>
                            {cancelText}
                        </Button>}
                        {onSave && <Button onClick={onSave} color="primary">
                            {saveText}
                        </Button>}
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default ConfirmationDialog;
