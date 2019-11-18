import i18n from "@dhis2/d2-i18n";
import { D2ApiDataHookQuery, NonPaginatedObjects, PaginatedObjects, useD2ApiData } from "d2-api";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { ObjectsTable, ObjectsTableProps, ReferenceObject, TableObject, TableState } from "..";

export interface D2ObjectsTableProps<T extends ReferenceObject>
    extends Omit<ObjectsTableProps<T>, "rows"> {
    apiMethod(options: any): D2ApiDataHookQuery<PaginatedObjects<T> | NonPaginatedObjects<T>>; // TODO inference
    apiQuery?: any; // TODO inference
}

export function D2ObjectsTable<T extends ReferenceObject = TableObject>(
    props: D2ObjectsTableProps<T>
) {
    const { apiMethod, apiQuery = {}, initialState = {}, onChange = _.noop, ...rest } = props;
    const [search, updateSearch] = useState<string | undefined>(undefined);
    const [sorting, updateSorting] = useState(
        initialState.sorting || {
            field: "displayName",
            order: "asc" as const,
        }
    );

    const [pagination, updatePagination] = useState(
        initialState.pagination || {
            page: 1,
            pageSize: 10,
        }
    );

    const { loading, data, error, refetch } = useD2ApiData(
        apiMethod({
            order: `${sorting.field}:i${sorting.order}`,
            pageSize: pagination.pageSize,
            ...apiQuery,
        })
    );

    useEffect(
        () =>
            refetch(
                apiMethod({
                    order: `${sorting.field}:i${sorting.order}`,
                    page: pagination.page,
                    pageSize: pagination.pageSize,
                    ...apiQuery,
                    filter: {
                        name: { ilike: search },
                        ...apiQuery.filter,
                    },
                })
            ),
        [apiMethod, refetch, sorting, pagination, search]
    );

    if (error) return <p>{"Error: " + JSON.stringify(error)}</p>;

    // @ts-ignore @tokland How do we handle non-paginated inference here?
    const { objects, pager } = data || { objects: [], pager: undefined };

    const handleTableChange = (tableState: TableState<T>) => {
        const { sorting, pagination } = tableState;
        updateSorting(sorting);
        updatePagination(pagination);
        onChange(tableState);
    };

    console.log("Rendering", objects, pager);

    return (
        <ObjectsTable<T>
            rows={objects}
            onChangeSearch={updateSearch}
            searchBoxLabel={i18n.t("Search by name")}
            pagination={pager}
            onChange={handleTableChange}
            loading={loading}
            {...rest}
        />
    );
}

export default D2ObjectsTable;
