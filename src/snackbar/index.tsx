import React, { useContext, useRef } from "react";
import SnackbarContext from "./context";
import SnackbarProvider from "./SnackbarProvider";
import { SnackbarLevel, SnackbarOptions, SnackbarState } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withSnackbar(WrappedComponent: any) {
    return class extends React.Component {
        static displayName = `withSnackbar${WrappedComponent.displayName}`;
        static contextType = SnackbarContext;

        render() {
            return <WrappedComponent {...this.props} snackbar={this.context} />;
        }
    };
}

export function useSnackbar(): SnackbarState {
    const contextValue = useContext<SnackbarState | undefined>(SnackbarContext);
    if (!contextValue) throw new Error("Snackbar context has not been defined");

    const ref = useRef(contextValue);
    return ref.current;
}

export { SnackbarProvider, SnackbarState, SnackbarOptions, SnackbarLevel };
