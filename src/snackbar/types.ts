import { ReactNode } from "react";

export type SnackbarLevel = "success" | "info" | "warning" | "error";

type Message = ReactNode;

export interface SnackbarOptions {
    isOpen: boolean;
    message?: Message;
    variant?: SnackbarLevel;
    autoHideDuration?: number | null;
}

export type SnackbarState = {
    openSnackbar: (
        variant: SnackbarLevel,
        message: Message,
        options?: Partial<SnackbarOptions>
    ) => void;
    closeSnackbar: () => void;
} & {
    [level in SnackbarLevel]: (message: Message, options?: Partial<SnackbarOptions>) => void;
} &
    SnackbarOptions;
