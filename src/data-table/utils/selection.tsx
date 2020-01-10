import i18n from "@dhis2/d2-i18n";
import _ from "lodash";
import { MouseEvent } from "react";
import {
    ReferenceObject,
    TableAction,
    TableNotification,
    TablePagination,
    TableSelection,
} from "../types";

export function updateSelection<T extends ReferenceObject>(selected: TableSelection[], row: T) {
    const selectedIndex = _.findIndex(selected, { id: row.id });

    if (selectedIndex === -1) {
        return [...selected, { id: row.id }];
    } else if (selectedIndex === 0) {
        return selected.slice(1);
    } else if (selectedIndex === selected.length - 1) {
        return selected.slice(0, -1);
    } else if (selectedIndex > 0) {
        return [...selected.slice(0, selectedIndex), ...selected.slice(selectedIndex + 1)];
    } else {
        return [];
    }
}

export function isEventCtrlClick(event: MouseEvent<unknown>) {
    return event && event.ctrlKey;
}

export function getActionRows<T extends ReferenceObject>(
    selectedRow: T,
    allRows: T[],
    selection: TableSelection[]
) {
    const isRowInSelection = _.some(selection, { id: selectedRow.id });
    const selectedRows = _(allRows)
        .intersectionBy(selection, "id")
        .value();

    return isRowInSelection ? selectedRows : [selectedRow];
}

export function parseActions<T extends ReferenceObject>(
    actionRows: T[],
    availableActions: TableAction<T>[]
) {
    return _(availableActions)
        .filter(actionRows.length > 1 ? "multiple" : "name")
        .filter(action => !action.isActive || action.isActive(actionRows))
        .value();
}

export function getSelectionMessages<T extends ReferenceObject>(
    rows: T[],
    tableSelection: TableSelection[],
    pagination: TablePagination,
    ids: string[],
    childrenKeys: string[]
): TableNotification[] {
    if (_.isEmpty(tableSelection)) return [];

    const childrenIds = _(rows)
        .map(row =>
            _(row)
                .pick(childrenKeys)
                .values()
                .flatten()
                .value()
        )
        .flatten()
        .value();
    const selection = _.differenceBy(tableSelection, childrenIds, "id");

    const allSelected = selection.length === pagination.total;
    const selectionInOtherPages = _.differenceBy(selection, rows, "id");
    const allSelectedInPage = _.differenceBy(rows, selection, "id").length === 0;
    const multiplePagesAvailable = pagination.total > rows.length;
    const selectAllImplemented = ids.length === pagination.total;

    return _.compact([
        allSelected
            ? {
                  message: i18n.t("There are {{total}} items selected in all pages.", {
                      total: selection.length,
                  }),
                  link: i18n.t("Clear selection"),
                  newSelection: [],
              }
            : null,
        !allSelected && selectionInOtherPages.length > 0
            ? {
                  message: i18n.t(
                      "There are {{count}} items selected ({{invisible}} on other pages).",
                      { count: selection.length, invisible: selectionInOtherPages.length }
                  ),
                  link: i18n.t("Clear selection"),
                  newSelection: [],
              }
            : null,
        !allSelected && allSelectedInPage && multiplePagesAvailable && selectAllImplemented
            ? {
                  message: i18n.t("All {{total}} items on this page are selected.", {
                      total: rows.length,
                  }),
                  link: i18n.t("Select all {{total}} items in all pages", {
                      total: pagination.total,
                  }),
                  newSelection: ids.map(id => ({ id })),
              }
            : null,
    ]);
}
