import React, { useState } from "react";
import SnackbarContext from "./context";
import SnackbarConsumer from "./SnackbarConsumer";
import { SnackbarOptions, SnackbarLevel } from ".";

export const SnackbarProvider = ({ children }) => {
    const [state, setState] = useState<SnackbarOptions>({
        isOpen: false,
        message: "",
        variant: "success",
    });

    const openSnackbar = (
        variant: SnackbarLevel,
        message: string,
        options: Partial<SnackbarOptions> = {}
    ) => {
        const defaultAutoHideDuration = variant === "success" ? 2000 : undefined;
        const { autoHideDuration = defaultAutoHideDuration } = options;

        setState({
            isOpen: true,
            message,
            variant,
            autoHideDuration,
        });
    };

    const byLevel = {
        success: (message: string, options: Partial<SnackbarOptions> = {}) => {
            openSnackbar("success", message, options);
        },
        info: (message: string, options: Partial<SnackbarOptions> = {}) => {
            openSnackbar("info", message, options);
        },
        warning: (message: string, options: Partial<SnackbarOptions> = {}) => {
            openSnackbar("warning", message, options);
        },
        error: (message: string, options: Partial<SnackbarOptions> = {}) => {
            openSnackbar("error", message, options);
        },
    };

    const closeSnackbar = () => {
        setState(state => ({
            ...state,
            message: "",
            isOpen: false,
        }));
    };

    const value = {
        openSnackbar: openSnackbar,
        byLevel: byLevel,
        closeSnackbar: closeSnackbar,
        snackbarIsOpen: state.isOpen,
        message: state.message,
        variant: state.variant,
        autoHideDuration: state.autoHideDuration,
    };

    return (
        <SnackbarContext.Provider value={value}>
            <SnackbarConsumer />
            {children}
        </SnackbarContext.Provider>
    );
};

export default SnackbarProvider;
