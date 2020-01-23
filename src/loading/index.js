import React, { useContext } from "react";
import loadingContext from "./context";

export function withLoading(WrappedComponent) {
    return class extends React.Component {
        static displayName = `withLoading${WrappedComponent.displayName}`;
        static contextType = loadingContext;

        render() {
            return <WrappedComponent {...this.props} loading={this.context} />;
        }
    };
}

export function useLoading() {
    const contextValue = useContext(loadingContext);
    return contextValue;
}
