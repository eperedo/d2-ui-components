import React from "react";
import _ from "lodash";
import { formatDateLong } from "../utils/date";
import i18n from "../utils/i18n";

const textByAccess = {
    rw: i18n.t("R/W"),
    "r-": i18n.t("Read"),
    "--": i18n.t("Private"),
};

function getValueForAccess(value) {
    const metadataAccess = value.slice(0, 2);
    const dataAccess = value.slice(2, 4);

    return [
        `${i18n.t("Metadata")}: ${textByAccess[metadataAccess]}`,
        " - ",
        `${i18n.t("Data")}: ${textByAccess[dataAccess]}`,
    ].join("");
}

function getValueForCollection(values) {
    const namesToDisplay = _(values)
        .map(value => value.displayName || value.name || value.id)
        .compact()
        .value();

    return (
        <ul>
            {namesToDisplay.map(name => (
                <li key={name}>{name}</li>
            ))}
        </ul>
    );
}

const styles = {
    url: { wordBreak: "break-all" },
};

function getValueForUrl(value) {
    return (
        <a rel="noopener noreferrer" style={styles.url} href={value} target="_blank">
            {value}
        </a>
    );
}

export function getFormatter(model, name) {
    if (!model) return obj => obj[name];

    const def = model.modelValidations[name] || {};
    const isAccessField = def.type === "TEXT" && def.min === 8 && def.max === 8;

    const fn = (() => {
        if (isAccessField) {
            return getValueForAccess;
        } else if (def.type === "DATE") {
            return formatDateLong;
        } else if (def.type === "COLLECTION") {
            return getValueForCollection;
        } else if (def.type === "URL") {
            return getValueForUrl;
        }
    })();

    return obj => (obj[name] && fn ? fn(obj[name]) : obj[name]);
}
