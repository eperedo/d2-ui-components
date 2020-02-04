export type SnackbarLevel = "success" | "info" | "warning" | "error";

export interface SnackbarOptions {
    isOpen: boolean;
    message?: string;
    variant?: SnackbarLevel;
    autoHideDuration?: number | null;
}

export interface SnackbarState extends SnackbarOptions {
    success: (message: string, options?: Partial<SnackbarOptions>) => void;
    info: (message: string, options?: Partial<SnackbarOptions>) => void;
    warning: (message: string, options?: Partial<SnackbarOptions>) => void;
    error: (message: string, options?: Partial<SnackbarOptions>) => void;
    openSnackbar: (
        variant: SnackbarLevel,
        message: string,
        options?: Partial<SnackbarOptions>
    ) => void;
    closeSnackbar: () => void;
}
