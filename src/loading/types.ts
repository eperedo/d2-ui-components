export interface LoadingOptions {
    isLoading: boolean;
    message?: string;
    progress?: number;
}

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
