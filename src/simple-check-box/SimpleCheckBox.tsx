import React from "react";
import "./SimpleCheckBox.css";

interface Props {
    onClick: () => void;
    checked: boolean;
}

export const SimpleCheckBox: React.FC<Props> = React.memo(props => {
    const { onClick, checked } = props;

    return (
        <span onClick={onClick}>
            <h5>Hola que tal</h5>
            <input type="checkbox" readOnly={true} checked={checked} className="simple-checkbox" />
            <span />
        </span>
    );
});
