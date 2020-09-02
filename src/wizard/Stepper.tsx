import { makeStyles, Step, StepButton, Stepper as MuiStepper } from "@material-ui/core";
import _ from "lodash";
import React, { MouseEvent } from "react";
import { Help } from "./Help";
import { WizardStep } from "./Wizard";

export const Stepper = ({
    steps,
    lastClickableStepIndex,
    currentStepKey,
    onStepClicked,
}: StepperProps) => {
    const classes = useStyles();

    if (steps.length === 0) return null;

    const index = _(steps).findIndex(step => step.key === currentStepKey);
    const currentStepIndex = index >= 0 ? index : 0;
    const currentStep = steps[currentStepIndex];

    return (
        <MuiStepper
            nonLinear={true}
            activeStep={currentStepIndex}
            className={["Wizard-Stepper", classes.stepper].join(" ")}
        >
            {steps.map((step, index) => (
                <Step
                    key={step.key}
                    completed={false}
                    disabled={index > lastClickableStepIndex}
                    className={"Wizard-Step"}
                >
                    <StepButton
                        key={step.key}
                        data-test-current={currentStep === step}
                        onClick={onStepClicked(step.key)}
                        classes={{ root: classes.stepButton }}
                        className={currentStep === step ? "current-step" : ""}
                    >
                        {step.label}
                    </StepButton>

                    {step.help && <Help step={step} currentStepKey={currentStepKey} />}
                </Step>
            ))}
        </MuiStepper>
    );
};

type EventHandler = (event: MouseEvent<HTMLElement>) => void;

export interface StepperProps {
    steps: WizardStep[];
    lastClickableStepIndex: number;
    currentStepKey: string;
    onStepClicked: (stepKey: string) => EventHandler;
}

const useStyles = makeStyles(() => ({
    stepButton: {
        width: "auto",
    },
    stepper: {
        marginLeft: 10,
        marginRight: 10,
    },
}));

export default Stepper;
