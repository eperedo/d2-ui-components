import i18n from "@dhis2/d2-i18n";

export default {
    t(key, options) {
        const optionsWithNs = {...options, ns: "d2-ui-components"};
        return i18n.t(key, optionsWithNs);
    }
};
