import React, { useContext, useRef } from "react";
import snackbarContext from "./context";
import SnackbarProvider from "./SnackbarProvider";
import { SnackbarLevel, SnackbarOptions, SnackbarState } from "./types";

export function withSnackbar(WrappedComponent: any) {
    return class extends React.Component {
        static displayName = `withSnackbar${WrappedComponent.displayName}`;
        static contextType = snackbarContext;

        render() {
            return <WrappedComponent {...this.props} snackbar={this.context} />;
        }
    };
}

export function useSnackbar() {
    const contextValue = useContext<SnackbarState>(snackbarContext);
    const ref = useRef(contextValue);
    return ref.current;
}

export { SnackbarProvider, SnackbarState, SnackbarOptions, SnackbarLevel };
