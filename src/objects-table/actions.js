import _ from "lodash";

export function setupActions(actions, onClick) {
    const actionsByName = _.keyBy(actions, "name");
    const contextMenuIcons = _(actions)
        .map(a => [a.name, a.icon || a.name])
        .fromPairs()
        .value();

    const isContextActionAllowed = function(d2, selection, actionName) {
        const action = actionsByName[actionName];
        const arg = action && !action.multiple && _.isArray(selection) ? selection[0] : selection;

        if (!action || !selection || selection.length === 0) {
            return false;
        } else if (!action.multiple && selection.length !== 1) {
            return false;
        } else if (action.isActive && !action.isActive(d2, arg)) {
            return false;
        } else {
            return true;
        }
    };

    const contextActions = actions.map(action => {
        const handler = objects => {
            const arg = action.multiple ? objects : objects[0];
            if (arg) onClick(action.name, arg);
        };
        return { name: action.name, text: action.text, fn: handler, isPrimary: action.isPrimary };
    });

    return { contextActions, contextMenuIcons, isContextActionAllowed };
}
