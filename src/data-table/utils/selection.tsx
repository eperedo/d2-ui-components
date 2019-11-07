import { MouseEvent } from "react";
import _ from "lodash";
import i18n from "@dhis2/d2-i18n";

import { ReferenceObject, TableAction, TablePagination, TableNotification } from "../types";

export function updateSelection<T extends ReferenceObject>(selected: string[], row: T) {
    let newSelected: string[] = [];
    const selectedIndex = selected.indexOf(row.id);

    if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, row.id);
    } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
            selected.slice(0, selectedIndex),
            selected.slice(selectedIndex + 1)
        );
    }

    return newSelected;
}

export function isEventCtrlClick(event: MouseEvent<unknown>) {
    return event && event.ctrlKey;
}

export function getActionRows<T extends ReferenceObject>(row: T, rows: T[], selection: string[]) {
    const rowInSelection = !!selection.find(id => row.id === id);

    return rowInSelection
        ? (_.compact(selection.map(id => _.find(rows, { id } as T))) as T[])
        : [row];
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
    selection: string[],
    pagination: TablePagination,
    ids: string[]
): TableNotification[] {
    if (_.isEmpty(rows)) return [];

    const allSelected = selection.length === pagination.total;
    const selectionInOtherPages = _.difference(selection, rows.map(dr => dr.id));
    const allSelectedInPage = rows.every(row => _.includes(selection, row.id));
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
                  newSelection: ids,
              }
            : null,
    ]);
}