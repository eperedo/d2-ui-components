import React, { useState } from "react";
import LoadingContext from "./context";
import LoadingConsumer from "./LoadingConsumer";

interface LoadingOptions {
    isLoading: boolean;
    message?: string;
    progress?: number;
}

export const LoadingProvider = ({ children }) => {
    const [state, setState] = useState<LoadingOptions>({
        isLoading: false,
        message: "",
        progress: -1,
    });

    const show = (isLoading = true, message?: string, progress?: number) => {
        setState(state => ({
            ...state,
            isLoading,
            message,
            progress,
        }));
    };

    const hide = () => show(false);

    const reset = () => show(false, "", -1);

    const updateMessage = (message: string) => {
        setState(state => ({ ...state, message }));
    };

    const updateProgress = (progress: number) => {
        setState(state => ({ ...state, progress }));
    };

    const value = {
        show,
        hide,
        reset,
        updateMessage,
        updateProgress,
        isLoading: state.isLoading,
        message: state.message,
        progress: state.progress,
    };

    return (
        <LoadingContext.Provider value={value}>
            <LoadingConsumer />
            {children}
        </LoadingContext.Provider>
    );
};

export default LoadingProvider;
