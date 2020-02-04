import React, { useContext, useState } from "react";
import loadingContext from "./context";
import { LoadingState } from "./types";

export function withLoading(WrappedComponent: any) {
    return class extends React.Component {
        static displayName = `withLoading${WrappedComponent.displayName}`;
        static contextType = loadingContext;

        render() {
            return <WrappedComponent {...this.props} loading={this.context} />;
        }
    };
}

export function useLoading() {
    const contextValue = useContext<LoadingState>(loadingContext);
    const [state] = useState(contextValue);
    return state;
}
