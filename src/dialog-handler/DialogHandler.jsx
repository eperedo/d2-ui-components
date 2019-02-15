import React from "react";
import PropTypes from "prop-types";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import { DialogContent, DialogActions, Button } from "@material-ui/core";
import i18n from '../i18n';

class DialogHandler extends React.Component {
    static propTypes = {
        buttonComponent: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        contents: PropTypes.string.isRequired,
    };

    state = {
        isOpen: false,
    };

    handleClickOpen = () => {
        this.setState({ isOpen: true });
    };

    handleClose = () => {
        this.setState({ isOpen: false });
    };

    render() {
        const { buttonComponent: CustomButton, title, contents } = this.props;
        const { isOpen } = this.state;

        return (
            <React.Fragment>
                <CustomButton onClick={this.handleClickOpen} />

                <Dialog open={isOpen} onClose={this.handleClose}>
                    <DialogTitle id="simple-dialog-title">{title}</DialogTitle>

                    <DialogContent>{contents}</DialogContent>

                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary" autoFocus>
                            {i18n.t("Close")}
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default DialogHandler;
