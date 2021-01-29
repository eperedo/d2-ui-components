import React from "react";
import { CircularProgress } from "@material-ui/core";

interface SpinnerProps {
    isVisible: boolean;
}

export const Spinner: React.FunctionComponent<SpinnerProps> = React.memo(({ isVisible }) => (
    <React.Fragment>
        <div style={styles.pad}></div>
        {isVisible && <CircularProgress />}
    </React.Fragment>
));

const styles = {
    pad: { flex: "10 1 auto" },
};
