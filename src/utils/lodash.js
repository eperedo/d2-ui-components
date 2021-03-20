import _ from "lodash";

function deepMerge(object, source) {
    return _.mergeWith(object, source, function (objValue, srcValue) {
        if (_.isObject(objValue) && srcValue) {
            return deepMerge(objValue, srcValue);
        }
    });
}

_.mixin({
    deepMerge,
});

export default _;
