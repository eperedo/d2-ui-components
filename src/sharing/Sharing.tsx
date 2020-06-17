import React from "react";
import Table, { TableProps } from "./Table";
export * from "./types";

export type SharingProps = TableProps;

const Sharing_: React.FC<SharingProps> = props => {
    return <Table {...props} />;
};

export const Sharing = React.memo(Sharing_);
