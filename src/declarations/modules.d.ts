declare module "@dhis2/d2-i18n" {
    export function t(value: string): string;
    export function t(
        value: string,
        options?: {
            nsSeparator?: boolean;
            [key: string]: any;
        }
    ): string;
}
