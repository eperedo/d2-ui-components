import React, { useContext, useState } from "react";
import snackbarContext from "./context";
import { SnackbarState } from "./types";

export function withSnackbar(WrappedComponent: any) {
    return class extends React.Component {
        static displayName = `withSnackbar${WrappedComponent.displayName}`;
        static contextType = snackbarContext;
        openSnackbarByLevel = this.context.byLevel;

        render() {
            return <WrappedComponent {...this.props} snackbar={this.openSnackbarByLevel} />;
        }
    };
}

export function useSnackbar() {
    const contextValue = useContext<SnackbarState>(snackbarContext);
    const [state] = useState(contextValue.byLevel);
    return state;
}
