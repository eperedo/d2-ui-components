import React, { Component } from "react";
import LoadingContext from "./context";
import LoadingConsumer from "./LoadingConsumer";

export default class SnackbarProvider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            message: "",
            progress: -1,
        };
    }

    show = (isLoading = true, message, progress) => {
        this.setState({
            isLoading,
            message: message ? message : this.message,
            progress: progress ? progress : this.progress,
        });
    };

    hide = () => this.show(false);

    reset = () => this.show(false, "", -1);

    updateMessage = message => {
        this.setState({ message });
    };

    updateProgress = progress => {
        this.setState({ progress });
    };

    render() {
        const { children } = this.props;

        const value = {
            show: this.show,
            hide: this.hide,
            reset: this.reset,
            updateMessage: this.updateMessage,
            updateProgress: this.updateProgress,
            isLoading: this.state.isLoading,
            message: this.state.message,
            progress: this.state.progress,
        };

        return (
            <LoadingContext.Provider value={value}>
                <LoadingConsumer />
                {children}
            </LoadingContext.Provider>
        );
    }
}
