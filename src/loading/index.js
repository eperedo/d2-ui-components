import React from "react";
import context from "./context";

export function withLoading(WrappedComponent) {
    return class extends React.Component {
        static displayName = `withLoading${WrappedComponent.displayName}`;
        static contextType = context;

        render() {
            return <WrappedComponent {...this.props} loading={this.context} />;
        }
    };
}
