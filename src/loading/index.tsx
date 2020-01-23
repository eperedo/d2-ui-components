import React, { useContext } from "react";
import loadingContext from "./context";

export interface LoadingState {
    show: (isLoading?: boolean, message?: string, progress?: number) => void;
    hide: () => void;
    reset: () => void;
    updateMessage: (message: string) => void;
    updateProgress: (progress: number) => void;
    isLoading: boolean;
    message: string;
    progress: number;
}

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
    return contextValue;
}
