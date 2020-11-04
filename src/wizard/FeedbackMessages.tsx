import { makeStyles } from "@material-ui/core";
import React from "react";

export const FeedbackMessages: React.FC<FeedbackMessagesProps> = ({ messages }) => {
    const classes = useStyles();

    if (messages.length === 0) return null;

    return (
        <div className="Wizard-Messages">
            <ul className={classes.messages}>
                {messages.map((message, index) => (
                    <li key={index}>{message}</li>
                ))}
            </ul>
        </div>
    );
};

export interface FeedbackMessagesProps {
    messages: string[];
}

const useStyles = makeStyles(() => ({
    messages: {
        padding: 0,
        listStyleType: "none",
        color: "red",
    },
}));
