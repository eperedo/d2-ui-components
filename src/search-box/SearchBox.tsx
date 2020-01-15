import React from "react";
import { debounce } from "throttle-debounce";
import TextField from "@material-ui/core/TextField";
import i18n from "../utils/i18n";

interface SearchBoxProps {
    value?: string;
    debounce?: number;
    onChange(value: string): void;
    hintText?: string;
}

const styles = {
    textField: { paddingTop: 8 },
};

const SearchBox: React.FC<SearchBoxProps> = props => {
    const [value, setValue] = React.useState(props.value);

    const onChangeDebounced = React.useMemo(() => {
        return debounce(props.debounce || 400, props.onChange);
    }, [props.debounce, props.onChange]);

    React.useEffect(() => setValue(props.value), [props.value]);

    const onKeyUp = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value as string;
            onChangeDebounced(value.trim());
            setValue(value);
        },
        [onChangeDebounced, setValue]
    );

    return (
        <TextField
            type="search"
            value={value || ""}
            style={styles.textField}
            fullWidth={true}
            onChange={onKeyUp}
            placeholder={props.hintText || i18n.t("Search by name")}
            data-test="search"
        />
    );
};

export default SearchBox;
