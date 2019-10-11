import React, { useContext } from "react";
import snackbarContext from "./context";
import _ from "lodash";

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
