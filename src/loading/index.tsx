import React, { useContext, useRef } from "react";
import LoadingContext from "./context";
import LoadingProvider from "./LoadingProvider";
import { LoadingOptions, LoadingState } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withLoading(WrappedComponent: any) {
    return class extends React.Component {
        static displayName = `withLoading${WrappedComponent.displayName}`;
        static contextType = LoadingContext;

        render() {
            return <WrappedComponent {...this.props} loading={this.context} />;
        }
    };
}

export function useLoading() {
    const contextValue = useContext<LoadingState | undefined>(LoadingContext);
    if (!contextValue) throw new Error("Loading context has not been defined");

    const ref = useRef(contextValue);
    return ref.current;
}

export { LoadingProvider, LoadingState, LoadingOptions };
