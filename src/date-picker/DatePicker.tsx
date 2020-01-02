import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import MomentUtils from "@date-io/moment";
import { Dictionary } from "lodash";
import { CSSProperties } from "@material-ui/styles";

import {
    MuiPickersUtilsProvider,
    DatePicker as MuiDatePicker,
    DatePickerProps as MuiDatePickerProps,
} from "@material-ui/pickers";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core";

export interface DatePickerProps extends MuiDatePickerProps {
    isFilter?: boolean;
    errorText?: string;
    errorStyle?: CSSProperties;
}

const colors: { filter: Dictionary<string>; form: Dictionary<string> } = {
    filter: {
        grey: "#aaaaaa",
        input: "#565656",
    },
    form: {
        grey: "#0000004d",
        input: "#000000de",
    },
};

class DatePicker extends React.PureComponent<DatePickerProps> {
    static propTypes = {
        label: PropTypes.string,
        value: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        placeholder: PropTypes.string,
        isFilter: PropTypes.bool,
    };

    static defaultProps = {
        margin: "normal",
        variant: "dialog",
        clearable: true,
        autoOk: true,
        format: moment.localeData().longDateFormat("L"),
    };

    getMaterialTheme = (isFilter: boolean, colors: Dictionary<string>) =>
        createMuiTheme({
            overrides: {
                ...(isFilter && {
                    MuiFormControl: {
                        marginNormal: {
                            marginTop: 8,
                            marginBottom: 0,
                            marginLeft: 10,
                        },
                    },
                }),
                MuiFormLabel: {
                    root: {
                        color: colors.grey,
                    },
                },
                MuiInput: {
                    input: {
                        color: colors.input,
                    },
                },
            },
        });

    render() {
        const { isFilter, errorStyle, errorText, ...datePickerProps } = this.props;
        const fieldColors = isFilter ? colors.filter : colors.form;
        const materialTheme = this.getMaterialTheme(isFilter, fieldColors);

        return (
            <MuiThemeProvider theme={materialTheme}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <React.Fragment>
                        <MuiDatePicker {...datePickerProps} />
                        {errorText && <div style={errorStyle}>{errorText}</div>}
                    </React.Fragment>
                </MuiPickersUtilsProvider>
            </MuiThemeProvider>
        );
    }
}

export { DatePicker };
