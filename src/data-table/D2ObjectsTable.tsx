import i18n from "@dhis2/d2-i18n";
import React, { useEffect, useState } from "react";
import { ObjectsTable, ObjectsTableProps, ReferenceObject, TableObject, TableState } from "..";
import { D2ApiDataHookQuery, useD2ApiData, PaginatedObjects, NonPaginatedObjects } from "d2-api";

export interface D2ObjectsTableProps<T extends ReferenceObject>
    extends Omit<ObjectsTableProps<T>, "rows"> {
    fields: any;
    apiMethod(options: any): D2ApiDataHookQuery<PaginatedObjects<T> | NonPaginatedObjects<T>>;
    initialQuery?: any;
}

export function D2ObjectsTable<T extends ReferenceObject = TableObject>(
    props: D2ObjectsTableProps<T>
) {
    const { fields, apiMethod, initialQuery, initialState = {}, ...rest } = props;
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
            fields: fields,
            order: `${sorting.field}:i${sorting.order}`,
            pageSize: pagination.pageSize,
            ...initialQuery,
        })
    );

    useEffect(
        () =>
            refetch(
                apiMethod({
                    fields: fields,
                    order: `${sorting.field}:i${sorting.order}`,
                    page: pagination.page,
                    pageSize: pagination.pageSize,
                    filter: {
                        name: { ilike: search },
                    },
                })
            ),
        [apiMethod, refetch, sorting, pagination, search]
    );

    if (loading || !data) return <p>{"Loading..."}</p>;
    if (error) return <p>{"Error: " + JSON.stringify(error)}</p>;

    // @ts-ignore @tokland How do we handle non-paginated inference here?
    const { objects, pager } = data;

    const handleTableChange = (tableState: TableState<T>) => {
        const { sorting, pagination } = tableState;
        updateSorting(sorting);
        updatePagination(pagination);
    };

    console.log("Rendering", objects, pager);

    return (
        <ObjectsTable<T>
            rows={objects}
            onChangeSearch={updateSearch}
            searchBoxLabel={i18n.t("Search by name")}
            pagination={pager}
            onChange={handleTableChange}
            {...rest}
        />
    );
}

export default D2ObjectsTable;
