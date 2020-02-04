export type SnackbarLevel = "success" | "info" | "warning" | "error";

export interface SnackbarOptions {
    isOpen: boolean;
    message?: string;
    variant?: SnackbarLevel;
    autoHideDuration?: number | null;
}

export type SnackbarState = {
    openSnackbar: (
        variant: SnackbarLevel,
        message: string,
        options?: Partial<SnackbarOptions>
    ) => void;
    closeSnackbar: () => void;
} & {
    [level in SnackbarLevel]: (message: string, options?: Partial<SnackbarOptions>) => void;
} &
    SnackbarOptions;
