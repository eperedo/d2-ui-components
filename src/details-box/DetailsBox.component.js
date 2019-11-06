import React from "react";
import PropTypes from "prop-types";
import classes from "classnames";
import _ from "lodash";
import Paper from "@material-ui/core/Paper";
import Icon from "@material-ui/core/Icon";

import "./DetailsBox.scss";

class DetailsBox extends React.Component {
    static propTypes = {
        fields: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                text: PropTypes.string.isRequired,
                getValue: PropTypes.func,
            })
        ),
        object: PropTypes.object,
        onClose: PropTypes.func.isRequired,
    };

    getDetailBoxContent() {
        if (!this.props.object) {
            return <div className="detail-box__status">Loading details...</div>;
        }

        return this.props.fields.map(field => {
            const fieldName = field.name;
            const valueToRender = field.getValue
                ? field.getValue(this.props.object)
                : this.props.object[fieldName];
            if (_.isNull(valueToRender)) return null;

            return (
                <div key={fieldName} className="detail-field">
                    <div className={`detail-field__label detail-field__${fieldName}-label`}>
                        {field.text}
                    </div>

                    <div className={`detail-field__value detail-field__${fieldName}`}>
                        {valueToRender || "-"}
                    </div>
                </div>
            );
        });
    }

    render() {
        const classList = classes("details-box");

        return (
            <Paper>
                <div className={classList}>
                    <Icon className="details-box__close-button" onClick={this.props.onClose}>
                        close
                    </Icon>
                    <div>{this.getDetailBoxContent()}</div>
                </div>
            </Paper>
        );
    }
}

export default DetailsBox;
