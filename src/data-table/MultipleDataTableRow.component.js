import React from "react";
import PropTypes from "prop-types";
import classes from "classnames";
import IconButton from "material-ui/IconButton";
import MoreVert from "material-ui/svg-icons/navigation/more-vert";
import i18n from "../utils/i18n";

import "./MultipleDataTableRow.scss";

class MultipleDataTableRow extends React.Component {
    static propTypes = {
        columns: PropTypes.array.isRequired,
        dataSource: PropTypes.object,
        isActive: PropTypes.bool,
        isEven: PropTypes.bool,
        isOdd: PropTypes.bool,
        hideActionsIcon: PropTypes.bool,
        itemClicked: PropTypes.func.isRequired,
        primaryClick: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    render() {
        const classList = classes("data-table__rows__row", {
            "data-table__rows__row--even": !this.props.isOdd,
            "data-table__rows__row--odd": this.props.isOdd,
            selected: this.props.isActive,
        });

        const dataSource = this.props.dataSource;

        const textWrapStyle = {
            width: "100%",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            position: "absolute",
            wordBreak: "break-all",
            wordWrap: "break-word",
            top: 0,
            bottom: 0,
            lineHeight: "50px",
            paddingRight: "1rem",
        };

        const columns = this.props.columns.map((column, index) => {
            const displayValue = column.getValue
                ? column.getValue(dataSource)
                : dataSource[column.name];

            return (
                <div
                    key={index}
                    className={"data-table__rows__row__column"}
                    onContextMenu={this.handleContextClick}
                    onClick={this.handleClick}
                >
                    {typeof displayValue === "string" ? (
                        <span title={displayValue} style={textWrapStyle}>
                            {displayValue}
                        </span>
                    ) : (
                        displayValue
                    )}
                </div>
            );
        });

        return (
            <div className={classList} style={this.props.style}>
                {columns}
                <div className={"data-table__rows__row__column"} style={{ width: "1%" }}>
                    {this.props.hideActionsIcon ? null : (
                        <IconButton tooltip={i18n.t("Actions")} onClick={this.iconMenuClick}>
                            <MoreVert />
                        </IconButton>
                    )}
                </div>
            </div>
        );
    }

    iconMenuClick = event => {
        event && event.preventDefault() && event.stopPropagation();
        event.isIconMenuClick = true;
        this.props.itemClicked(event, this.props.dataSource);
    };

    handleContextClick = event => {
        event && event.preventDefault();
        event.isIconMenuClick = false;
        this.props.itemClicked(event, this.props.dataSource);
    };

    handleClick = event => {
        this.props.primaryClick(event, this.props.dataSource);
    };
}

export default MultipleDataTableRow;
