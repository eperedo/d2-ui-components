import React from "react";

type Callback = () => void;

type UseBooleanReturn = [boolean, UseBooleanActions];

interface UseBooleanActions {
    set: (newValue: boolean) => void;
    toggle: Callback;
    open: Callback;
    close: Callback;
}

export function useBooleanState(initialValue: boolean): UseBooleanReturn {
    const [value, setValue] = React.useState(initialValue);

    const actions = React.useMemo(() => {
        return {
            set: (newValue: boolean) => setValue(newValue),
            open: () => setValue(true),
            close: () => setValue(false),
            toggle: () => setValue(value_ => !value_),
        };
    }, [setValue]);

    return [value, actions];
}
