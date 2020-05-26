type Id = string;

export type SearchMatchObject = { id: Id; displayName: string };
export type AccessRule = string;

export interface SharingRule {
    id: Id;
    displayName: string;
    access: AccessRule;
}

export interface SharedObject {
    id: Id;
    user?: { id: Id; name: string };
    displayName: string;
    userAccesses?: SharingRule[];
    userGroupAccesses?: SharingRule[];
    externalAccess: boolean;
    publicAccess: AccessRule;
}

export type ShareUpdate = Partial<
    Pick<SharedObject, "userAccesses" | "userGroupAccesses" | "externalAccess" | "publicAccess">
>;

export interface MetaObject {
    meta: {
        allowPublicAccess: boolean;
        allowExternalAccess: boolean;
    };
    object: SharedObject;
}

export interface SearchResult {
    users: SearchMatchObject[];
    userGroups: SearchMatchObject[];
}
