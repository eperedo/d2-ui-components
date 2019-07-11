import React from "react";
import PropTypes from "prop-types";
import i18n from "../utils/i18n";
import ConfirmationDialog from "../confirmation-dialog/ConfirmationDialog";

class DialogButton extends React.Component {
    static propTypes = {
        buttonComponent: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        contents: PropTypes.string.isRequired,
        initialIsOpen: PropTypes.bool,
    };

    static defaultProps = {
        initialIsOpen: undefined,
    };

    state = {
        isOpen: this.props.initialIsOpen,
        props: this.props,
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.props.initialIsOpen === undefined && nextProps.initialIsOpen !== undefined) {
            return { isOpen: nextProps.initialIsOpen, props: nextProps };
        } else {
            return null;
        }
    }

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

                <ConfirmationDialog
                    isOpen={!!isOpen}
                    title={title}
                    description={contents}
                    onCancel={this.handleClose}
                    cancelText={i18n.t("Close")}
                />
            </React.Fragment>
        );
    }
}

export default DialogButton;
