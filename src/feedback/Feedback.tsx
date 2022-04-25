import React from "react";
import { Button, createTheme, ThemeProvider, styled } from "@material-ui/core";
import { Feedback as FeedbackIcon } from "@material-ui/icons";
import { indigo500 } from "material-ui/styles/colors";
import { FeedbackDialog } from "./FeedbackDialog";
import { useBooleanState } from "../utils/useBoolean";
import i18n from "../locales";

interface FeedbackProps {}

export const Feedback: React.FC<FeedbackProps> = React.memo(props => {
    const {} = props;
    const [showDialog, { close: closeDialog, open: openDialog }] = useBooleanState(false);

    const theme = createTheme({
        palette: {
            primary: {
                main: indigo500,
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <Container>
                <StyledButton
                    variant="contained"
                    color="primary"
                    endIcon={<FeedbackIcon />}
                    onClick={openDialog}
                    disableElevation
                >
                    {i18n.t("Send feedback")}
                </StyledButton>
                <FeedbackDialog open={showDialog} onClose={closeDialog} />
            </Container>
        </ThemeProvider>
    );
});

const Container = styled("div")({
    position: "fixed",
    zIndex: 1299,
    left: 100,
    bottom: 0,
});

const StyledButton = styled(Button)({
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
});
