import { Button, ButtonProps, makeStyles, Theme } from "@material-ui/core";
import React, { useMemo } from "react";
import i18n from "../utils/i18n";
import { WizardStep } from "./Wizard";

export const Navigation: React.FC<NavigationProps> = ({
    steps,
    disableNext,
    disablePrev,
    onNext,
    onPrev,
}) => {
    const classes = useStyles();
    const className = useMemo(() => ["Wizard-Navigation", classes.buttonContainer].join(" "), [
        classes,
    ]);

    if (steps.length === 0) return null;

    return (
        <div className={className}>
            <NavigationButton
                disabled={disablePrev}
                onClick={onPrev}
                label={"← " + i18n.t("Previous")}
            />

            <NavigationButton
                disabled={disableNext}
                onClick={onNext}
                label={i18n.t("Next") + " →"}
            />
        </div>
    );
};

const NavigationButton: React.FC<NavigationButtonProps> = ({ disabled, onClick, label }) => {
    const classes = useStyles();

    const buttonStyleOverride = useMemo(
        () => ({
            disabled: classes.buttonDisabled,
        }),
        [classes]
    );

    return (
        <Button
            variant="contained"
            classes={buttonStyleOverride}
            disabled={disabled}
            className={classes.button}
            onClick={onClick}
        >
            {label}
        </Button>
    );
};

export interface NavigationProps {
    steps: WizardStep[];
    currentStepKey?: string;
    disableNext: boolean;
    disablePrev: boolean;
    onNext: () => void;
    onPrev: () => void;
}

interface NavigationButtonProps extends Pick<ButtonProps, "disabled" | "onClick"> {
    label: string;
}

const useStyles = makeStyles((theme: Theme) => ({
    button: {
        margin: theme.spacing(1),
        marginRight: 5,
        padding: 10,
    },
    buttonDisabled: {
        color: "grey !important",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "flex-end",
        paddingTop: 10,
    },
}));
