import React from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import LoadingContext from "./context";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

const styles = _theme => ({
    loadingMask: {
        height: '100%',
        width: '100%',
        position: 'fixed',
        zIndex: 1,
        background: 'rgba(38, 50, 56, 0.9)',
    },
    contents: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
    },
    message: {
        color: 'white',
    },
    progress: {
        color: 'white',
    },
    divider: {
        margin: "40px"
    }
});

const LoadingConsumer = props => {
    const { classes } = props;

    return (
        <LoadingContext.Consumer>
            {({ isLoading, message, progress }) => {
                const hideMessage = !message || !message.trim();
                return (
                    <div className={classes.loadingMask} hidden={!isLoading}>
                        <div className={classes.contents}>
                            <CircularProgress
                                className={classes.progress}
                                variant={progress >= 0 ? 'determinate' : 'indeterminate'}
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

LoadingConsumer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LoadingConsumer);
