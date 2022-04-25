import React from "react";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Link,
    TextField,
    styled,
    Box,
    Tooltip,
    Divider,
} from "@material-ui/core";
import { white, indigo500 } from "material-ui/styles/colors";
import { useBooleanState } from "../utils/useBoolean";
import i18n from "../locales";
import { HelpOutline } from "@material-ui/icons";

interface FeedbackDialogProps {
    open: boolean;
    onClose: () => void;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = React.memo(props => {
    const { open, onClose } = props;
    const [includeScreenshot, { toggle: toggleScreenshot }] = useBooleanState(false);
    const [includeContact, { toggle: toggleContact }] = useBooleanState(false);
    const [acceptAgreement, { toggle: toggleAgreement }] = useBooleanState(false);

    const ppUrls = React.useMemo(
        () => ({
            privacyPolicy: "https://eyeseetea.com/privacy-policy/",
            applicationFeedback: "https://eyeseetea.com/privacy-policy/#Feedback",
        }),
        []
    );

    const ppTexts = React.useMemo(
        () => ({
            beginning: i18n.t("I have read and accept the "),
            privacyPolicy: i18n.t("EyeSeeTea S.L. Privacy Policy"),
            middle: i18n.t(", paying special attention to the "),
            aplicationFeedback: i18n.t("Application Feedback"),
            end: i18n.t(" section."),
        }),
        []
    );

    const ScreenshotLabel = React.useMemo(
        () => (
            <Box display="flex" alignItems="center">
                {i18n.t("Include screenshot")}
                <Tooltip
                    title={i18n.t(
                        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod delectus asperiores eius ratione reprehenderit maiores error harum quis quasi nesciunt deleniti, sapiente laborum facere consequuntur adipisci provident sed nulla quo."
                    )}
                >
                    <HelpOutlineIcon />
                </Tooltip>
            </Box>
        ),
        []
    );

    const AgreementLabel = React.useMemo(
        () => (
            <>
                {ppTexts.beginning}
                <Link href={ppUrls.privacyPolicy} target="_blank">
                    {ppTexts.privacyPolicy}
                </Link>
                {ppTexts.middle}
                <Link href={ppUrls.applicationFeedback} target="_blank">
                    {ppTexts.aplicationFeedback}
                </Link>
                {ppTexts.end}
            </>
        ),
        []
    );

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
            <StyledDialogTitle id="form-dialog-title">{i18n.t("Send feedback")}</StyledDialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    id="title"
                    label={i18n.t("Title")}
                    type="text"
                    fullWidth
                />
                <TextField
                    margin="normal"
                    id="description"
                    label={i18n.t("Description")}
                    type="text"
                    multiline
                    fullWidth
                />
                <Wrapper>
                    <Box display="flex" flexDirection="column">
                        <FitControlLabel
                            control={
                                <Checkbox
                                    checked={includeScreenshot}
                                    onChange={toggleScreenshot}
                                    color="primary"
                                />
                            }
                            label={ScreenshotLabel}
                        />
                        <FitControlLabel
                            control={
                                <Checkbox
                                    checked={includeContact}
                                    onChange={toggleContact}
                                    color="primary"
                                />
                            }
                            label={i18n.t("I would like to be contacted")}
                        />
                    </Box>
                    {includeContact && (
                        <Box display="flex">
                            <GrownTextField
                                margin="dense"
                                id="name"
                                label={i18n.t("Name")}
                                type="text"
                            />
                            <GrownTextField
                                margin="dense"
                                id="email"
                                label={i18n.t("Email")}
                                type="text"
                            />
                        </Box>
                    )}
                </Wrapper>
                <StyledDivider />
                <Wrapper>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={acceptAgreement}
                                onChange={toggleAgreement}
                                color="primary"
                                required
                            />
                        }
                        label={AgreementLabel}
                    />
                </Wrapper>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{i18n.t("Cancel")}</Button>
                <Button onClick={onClose} color="primary" disabled={!acceptAgreement}>
                    {i18n.t("Send")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});

const StyledDialogTitle = styled(DialogTitle)({
    background: indigo500,
    color: white,
});

const Wrapper = styled("div")({
    marginTop: 16,
    marginBottom: 16,
});

const HelpOutlineIcon = styled(HelpOutline)({
    marginLeft: 4,
    fill: indigo500,
    width: "0.875em",
    height: "0.875em",
});

const GrownTextField = styled(TextField)({
    flexGrow: 1,
    "&:not(:last-child)": {
        marginRight: 32,
    },
});

const FitControlLabel = styled(FormControlLabel)({
    width: "fit-content",
});

const StyledDivider = styled(Divider)({
    marginBottom: 20,
});
