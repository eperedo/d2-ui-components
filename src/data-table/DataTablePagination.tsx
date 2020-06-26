import React from "react";
import _ from "lodash";
import Pagination from "@material-ui/core/TablePagination";

import { TablePagination } from "./types";

export interface DataTablePaginationProps {
    pagination: TablePagination;
    pageSizeOptions: number[];
    defaultTotal: number;
    onChange?(newPagination: TablePagination): void;
}

export function DataTablePagination(props: DataTablePaginationProps) {
    const { pagination, pageSizeOptions, onChange = _.noop, defaultTotal } = props;
    const { page, pageSize, total = defaultTotal } = pagination;

    const handleChangePage = (_event: unknown, page: number) => {
        onChange({
            ...pagination,
            page: page + 1,
        });
    };

    const handleChangePageSize = (event: React.ChangeEvent<HTMLInputElement>) => {
        const pageSize = parseInt(event.target.value, 10);
        onChange({
            ...pagination,
            pageSize,
            page: 1,
        });
    };

    const currentPage = total > 0 ? page - 1 : 0;

    return (
        <Pagination
            rowsPerPageOptions={pageSizeOptions}
            component="div"
            count={total}
            rowsPerPage={pageSize}
            page={currentPage}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangePageSize}
        />
    );
}
