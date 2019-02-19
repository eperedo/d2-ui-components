import _ from "lodash";

export function isAdmin(d2) {
    return d2.currentUser.authorities.has("ALL");
}

export function canManage(d2, _model, objs) {
    return objs.every(obj => obj.access && obj.access.manage);
}

export function canCreate(d2, model, type) {
    const method = type === "private" ? "canCreatePrivate" : "canCreatePublic";
    return d2.currentUser[method](model);
}

export function canDelete(d2, model, objs) {
    if (objs.length === 0) {
        return true;
    } else {
        return (
            d2.currentUser.canDelete(model) && _(objs).every(obj => obj.access && obj.access.delete)
        );
    }
}

export function canUpdate(d2, model, objs) {
    if (objs.length === 0) {
        return true;
    } else {
        const anyPublic = _(objs).some(obj => obj.publicAccess.match(/^r/));
        const anyPrivate = _(objs).some(obj => obj.publicAccess.match(/^-/));
        const allUpdatable = _(objs).every(obj => obj.access.update);
        const privateCondition = !anyPrivate || d2.currentUser.canCreatePrivate(model);
        const publicCondition = !anyPublic || d2.currentUser.canCreatePublic(model);
        return privateCondition && publicCondition && allUpdatable;
    }
}
