import React from "react";
import context from "./context";
import _ from "lodash";

const levels = ["success", "info", "warning", "error"];

export function withSnackbar(WrappedComponent) {
    return class extends React.Component {
        static displayName = `withSnackbar${WrappedComponent.displayName}`;
        static contextType = context;

        openSnackbarByLevel = _(levels)
            .map(key => [key, (...args) => this.context.openSnackbar(key, ...args)])
            .fromPairs()
            .value();

        render() {
            return <WrappedComponent {...this.props} snackbar={this.openSnackbarByLevel} />;
        }
    };
}
