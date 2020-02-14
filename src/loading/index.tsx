import React, { useContext, useRef } from "react";
import loadingContext from "./context";
import { LoadingState } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const ref = useRef(contextValue);
    return ref.current;
}
