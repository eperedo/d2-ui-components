import React, { Component } from "react";
import snackbarContext from "./context";
import SnackbarConsumer from "./SnackbarConsumer";

export default class SnackbarProvider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            message: "",
            variant: "success",
        };
    }

    // level : "success" | "info" | "warning" | "error"
    // options : {autoHideDuration: NUMBER}
    openSnackbar = (level, message, options = {}) => {
        const defaultAutoHideDuration = level === "success" ? 2000 : undefined;
        const autoHideDuration = options.hasOwnProperty("autoHideDuration")
            ? options.autoHideDuration
            : defaultAutoHideDuration;
        this.setState({
            message,
            isOpen: true,
            variant: level,
            autoHideDuration,
        });
    };

    byLevel = {
        success: (message, options = {}) => {
            this.openSnackbar("success", message, options);
        },
        info: (message, options = {}) => {
            this.openSnackbar("info", message, options);
        },
        warning: (message, options = {}) => {
            this.openSnackbar("warning", message, options);
        },
        error: (message, options = {}) => {
            this.openSnackbar("error", message, options);
        },
    };

    closeSnackbar = () => {
        this.setState({
            message: "",
            isOpen: false,
        });
    };

    render() {
        const { children } = this.props;

        const value = {
            openSnackbar: this.openSnackbar,
            byLevel: this.byLevel,
            closeSnackbar: this.closeSnackbar,
            snackbarIsOpen: this.state.isOpen,
            message: this.state.message,
            variant: this.state.variant,
            autoHideDuration: this.state.autoHideDuration,
        };

        return (
            <snackbarContext.Provider value={value}>
                <SnackbarConsumer />
                {children}
            </snackbarContext.Provider>
        );
    }
}
