import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import LoadingContext from "./context";

const useStyles = makeStyles({
    loadingMask: {
        height: "100%",
        width: "100%",
        position: "fixed" as const,
        zIndex: 2000,
        background: "rgba(38, 50, 56, 0.9)",
    },
    contents: {
        position: "absolute" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center" as const,
    },
    message: {
        color: "white",
    },
    progress: {
        color: "white",
    },
    divider: {
        margin: "40px",
    },
});

const LoadingConsumer = () => {
    const classes = useStyles();

    return (
        <LoadingContext.Consumer>
            {state => {
                if (!state) throw new Error("Loading context has not been defined");
                const { isLoading, message, progress = -1 } = state;

                const hideMessage = !message || !message.trim();
                return (
                    <div className={classes.loadingMask} hidden={!isLoading}>
                        <div className={classes.contents}>
                            <CircularProgress
                                className={classes.progress}
                                variant={progress >= 0 ? "determinate" : "indeterminate"}
                                value={progress}
                                size={100}
                                thickness={1.5}
                            />
                            <Divider
                                className={classes.divider}
                                variant="middle"
                                hidden={hideMessage}
                            />
                            <Typography
                                className={classes.message}
                                variant="h6"
                                hidden={hideMessage}
                                gutterBottom
                            >
                                {message}
                            </Typography>
                        </div>
                    </div>
                );
            }}
        </LoadingContext.Consumer>
    );
};

export default LoadingConsumer;
