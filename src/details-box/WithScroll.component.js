import React, { Component } from "react";
import { debounce } from "throttle-debounce";

export default class WithScroll extends Component {
    state = { scrollTop: 0 };

    constructor(props) {
        super(props);
        this.setScrollTopDebounced = debounce(200, this.setScrollTop.bind(this));
    }

    setScrollTop() {
        const scrollTop = document.documentElement.scrollTop;
        this.setState({ scrollTop });
    }

    componentDidMount() {
        global.addEventListener("scroll", this.setScrollTopDebounced);
        this.setScrollTopDebounced();
    }

    componentWillUnmount() {
        global.removeEventListener("scroll", this.setScrollTopDebounced);
    }

    render() {
        const { scrollTop } = this.state;
        const { children, alignTo } = this.props;
        const alignmentComponent = document.querySelector(alignTo);
        const offset = alignmentComponent ? alignmentComponent.offsetTop : 0;
        const marginTop = Math.max(scrollTop - offset, 0);
        const paperStyle = { marginTop };

        return <div style={paperStyle}>{children}</div>;
    }
}
