import React, { useContext } from "react";
import snackbarContext from "./context";

export function withSnackbar(WrappedComponent) {
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
    const contextValue = useContext(snackbarContext);
    return contextValue.byLevel;
}
