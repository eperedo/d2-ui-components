import _ from "lodash";
import { WizardStep } from "./Wizard";

export const getAdjacentSteps = (steps: WizardStep[], currentStepKey: string) => {
    const index = _(steps).findIndex(step => step.key === currentStepKey);
    const prevStepKey = index >= 1 ? steps[index - 1].key : null;
    const nextStepKey = index >= 0 && index < steps.length - 1 ? steps[index + 1].key : null;
    return { prevStepKey, nextStepKey };
};
