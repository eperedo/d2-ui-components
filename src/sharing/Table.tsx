import React from "react";

import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import { WithStyles } from "@material-ui/core";

import i18n from "../locales";
import UserSearch from "./UserSearch";
import { PublicAccess, ExternalAccess, GroupAccess } from "./Access";
import { AccessRule, SharingRule, MetaObject, ShareUpdate, SearchResult } from "./types";

type Id = string;

export interface TableProps {
    meta: MetaObject;
    showOptions: Partial<{
        title: boolean;
        dataSharing: boolean;
        publicSharing: boolean;
        externalSharing: boolean;
        permissionPicker: boolean;
    }>;
    subtitle?: string;
    unremovebleIds?: Set<Id>;
    // Return a fulfilled promise to signal that the update was successful
    onChange: (sharedUpdate: ShareUpdate) => Promise<void>;
    onSearch: (s: string) => Promise<SearchResult>;
}

type TablePropsWithStyles = TableProps & WithStyles<typeof styles>;

/**
 * Content of the sharing dialog; a set of components for changing sharing
 * preferences.
 */
class Table extends React.Component<TablePropsWithStyles> {
    onAccessRuleChange = (id: Id) => (accessRule: AccessRule) => {
        const changeWithId = (rule: SharingRule) =>
            rule.id === id ? { ...rule, access: accessRule } : rule;
        const userAccesses = (this.props.meta.object.userAccesses || []).map(changeWithId);
        const userGroupAccesses = (this.props.meta.object.userGroupAccesses || []).map(
            changeWithId
        );

        this.props.onChange({
            userAccesses,
            userGroupAccesses,
        });
    };

    onAccessRemove = (accessOwnerId: Id) => {
        const { unremovebleIds } = this.props;
        if (unremovebleIds && unremovebleIds.has(accessOwnerId)) return undefined;

        return () => {
            const withoutId = (accessOwner: SharingRule) => accessOwner.id !== accessOwnerId;
            const userAccesses = (this.props.meta.object.userAccesses || []).filter(withoutId);
            const userGroupAccesses = (this.props.meta.object.userGroupAccesses || []).filter(
                withoutId
            );

            this.props.onChange({
                userAccesses,
                userGroupAccesses,
            });
        };
    };

    onPublicAccessChange = (publicAccess: AccessRule) => {
        this.props.onChange({
            publicAccess,
        });
    };

    onExternalAccessChange = (externalAccess: boolean) => {
        this.props.onChange({
            externalAccess,
        });
    };

    setAccessListRef = (ref: HTMLInputElement) => {
        this.accessListRef = ref;
    };

    accessListRef: HTMLInputElement | null = null;

    addUserAccess = (userAccess: SharingRule) => {
        const currentAccesses = this.props.meta.object.userAccesses || [];
        this.props
            .onChange({
                userAccesses: [...currentAccesses, userAccess],
            })
            .then(this.scrollAccessListToBottom);
    };

    addUserGroupAccess = (userGroupAccess: SharingRule) => {
        const currentAccesses = this.props.meta.object.userGroupAccesses || [];
        this.props
            .onChange({
                userGroupAccesses: [...currentAccesses, userGroupAccess],
            })
            .then(this.scrollAccessListToBottom);
    };

    scrollAccessListToBottom = () => {
        if (this.accessListRef) {
            this.accessListRef.scrollTop = this.accessListRef.scrollHeight;
        }
    };

    render() {
        const { allowPublicAccess, allowExternalAccess } = this.props.meta.meta;
        const { classes, subtitle = i18n.t("Who has access") } = this.props;
        const {
            user,
            displayName,
            name,
            userAccesses,
            userGroupAccesses,
            publicAccess,
            externalAccess,
        } = this.props.meta.object;

        const accessIds = (userAccesses || [])
            .map(access => access.id)
            .concat((userGroupAccesses || []).map(access => access.id));

        const {
            title: showTitle = true,
            dataSharing: dataShareable = false,
            publicSharing: showPublicSharing = true,
            externalSharing: showExternalSharing = true,
            permissionPicker: showPermissionPicker = true,
        } = this.props.showOptions;

        return (
            <div>
                {showTitle && <h2 className={classes.title}>{displayName || name}</h2>}
                {user && (
                    <div className={classes.createdBy}>
                        {`${i18n.t("Created by")}: ${user.name}`}
                    </div>
                )}
                <div className={classes.titleBodySpace} />
                <Typography variant="subtitle1">{subtitle}</Typography>
                <Divider />
                <div className={classes.rules} ref={this.setAccessListRef}>
                    {showPublicSharing && (
                        <React.Fragment>
                            <PublicAccess
                                access={publicAccess}
                                disabled={!allowPublicAccess}
                                dataShareable={dataShareable}
                                onChange={this.onPublicAccessChange}
                                showPermissionPicker={showPermissionPicker}
                            />
                            <Divider />
                        </React.Fragment>
                    )}

                    {showExternalSharing && (
                        <React.Fragment>
                            <ExternalAccess
                                access={externalAccess}
                                disabled={!allowExternalAccess}
                                onChange={this.onExternalAccessChange}
                                showPermissionPicker={showPermissionPicker}
                            />
                            <Divider />
                        </React.Fragment>
                    )}

                    {userAccesses &&
                        userAccesses.map(access => (
                            <div key={access.id}>
                                <GroupAccess
                                    groupName={access.displayName}
                                    groupType="user"
                                    access={access.access}
                                    dataShareable={dataShareable}
                                    onRemove={this.onAccessRemove(access.id)}
                                    onChange={this.onAccessRuleChange(access.id)}
                                    showPermissionPicker={showPermissionPicker}
                                />
                                <Divider />
                            </div>
                        ))}

                    {userGroupAccesses &&
                        userGroupAccesses.map(access => (
                            <div key={access.id}>
                                <GroupAccess
                                    access={access.access}
                                    groupName={access.displayName}
                                    groupType="userGroup"
                                    dataShareable={dataShareable}
                                    onRemove={this.onAccessRemove(access.id)}
                                    onChange={this.onAccessRuleChange(access.id)}
                                    showPermissionPicker={showPermissionPicker}
                                />
                                <Divider />
                            </div>
                        ))}
                </div>

                <UserSearch
                    onSearch={this.props.onSearch}
                    addUserAccess={this.addUserAccess}
                    addUserGroupAccess={this.addUserGroupAccess}
                    dataShareable={dataShareable}
                    currentAccessIds={accessIds}
                    showPermissionPicker={showPermissionPicker}
                />
            </div>
        );
    }
}

const styles = () => ({
    title: {
        fontSize: "24px",
        fontWeight: 300,
        color: "rgba(0, 0, 0, 0.87)",
        padding: "16px 0px 5px",
        margin: "0px",
    },
    createdBy: {
        color: "#818181",
    },
    titleBodySpace: {
        paddingTop: 30,
    },
    rules: {
        height: "240px",
        overflowY: "scroll" as const,
    },
});

export default withStyles(styles)(Table);
