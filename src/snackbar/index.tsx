import React, { useContext, useRef } from "react";
import snackbarContext from "./context";
import { SnackbarState } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
