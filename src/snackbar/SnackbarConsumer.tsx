import { Typography } from "@material-ui/core";
import amber from "@material-ui/core/colors/amber";
import green from "@material-ui/core/colors/green";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import { Theme, withStyles } from "@material-ui/core/styles";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CloseIcon from "@material-ui/icons/Close";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import WarningIcon from "@material-ui/icons/Warning";
import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import SnackbarContext from "./context";

const anchorOrigin = {
    vertical: "bottom" as const,
    horizontal: "center" as const,
};

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};

const styles = (theme: Theme) => ({
    root: {
        bottom: 0,
    },
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: theme.palette.primary.dark,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing(4), // Or anything between 30px and 38px
    },
    content: {
        display: "flex" as const,
        alignItems: "center" as const,
        whiteSpace: "pre-wrap" as const,
    },
    message: {
        maxHeight: 500,
        overflow: "auto",
        paddingRight: 10,
    },
});

const SnackbarConsumer = props => {
    const { classes } = props;

    return (
        <SnackbarContext.Consumer>
            {({ isOpen, message, variant, closeSnackbar, autoHideDuration }) => {
                const Icon = variantIcon[variant];
                if (!Icon) {
                    throw new Error(`Unknown variant: ${variant}`);
                }

                return (
                    <Snackbar
                        className={classes.root}
                        anchorOrigin={anchorOrigin}
                        open={isOpen}
                        autoHideDuration={autoHideDuration}
                        onClose={closeSnackbar}
                    >
                        <SnackbarContent
                            className={classes[variant]}
                            aria-describedby="client-snackbar"
                            message={
                                <span id="client-snackbar" className={classes.content}>
                                    <Icon
                                        className={classNames(classes.icon, classes.iconVariant)}
                                    />
                                    <Typography className={classes.message}>{message}</Typography>
                                </span>
                            }
                            action={[
                                <IconButton
                                    key="close"
                                    aria-label="Close"
                                    color="inherit"
                                    className={classes.close}
                                    onClick={closeSnackbar}
                                >
                                    <CloseIcon className={classes.icon} />
                                </IconButton>,
                            ]}
                        />
                    </Snackbar>
                );
            }}
        </SnackbarContext.Consumer>
    );
};

SnackbarConsumer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SnackbarConsumer);
