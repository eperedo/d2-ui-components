import _ from "lodash";
import { MouseEvent } from "react";
import i18n from "../../utils/i18n";
import { ReferenceObject, TableAction, TableNotification, TableSelection } from "../types";

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

function buildChildrenRows<T extends ReferenceObject>(row: T, childrenKeys: string[]): T[] {
    const childRows = _(row)
        .pick(childrenKeys)
        .values()
        .flatten()
        .compact()
        .flatMap((row: T) => buildChildrenRows(row, childrenKeys))
        .value();

    return _.flatten([row, ...childRows]) as T[];
}

export function getActionRows<T extends ReferenceObject>(
    selectedRow: T,
    parentRows: T[],
    selection: TableSelection[],
    childrenKeys: string[]
) {
    const isRowInSelection = _.some(selection, { id: selectedRow.id });
    const childrenRows = _.flatten(parentRows.map(row => buildChildrenRows(row, childrenKeys)));

    const rows = [...parentRows, ...childrenRows];
    const selectedRows = _.intersectionBy(rows, selection, "id");

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

function getMessages() {
    return {
        clearSelection: i18n.t("Clear selection"),
        itemsInAllPages(options: { total: number }) {
            return i18n.t("There are {{total}} items selected in all pages.", options);
        },
        itemsSelectedInOtherPages(options: { count: number; invisible: number }) {
            return i18n.t("There are {{count}} items selected ({{invisible}} on other pages).", {
                count: options.count,
                invisible: options.invisible,
            });
        },
        allItemsSelectedInCurrentPage(options: { total: number }) {
            return i18n.t("All {{total}} items on this page are selected.", options);
        },
        selectAllItemsInAllPages(options: { total: number }) {
            return i18n.t("Select all {{total}} items in all pages", options);
        },
    };
}

type GetMessageReturn = ReturnType<typeof getMessages>;
export type SelectionMessages = Partial<GetMessageReturn>;

export function getSelectionMessages<T extends ReferenceObject>(
    rows: T[],
    tableSelection: TableSelection[],
    total: number,
    ids: string[],
    childrenKeys: string[],
    overrideMessages: Partial<SelectionMessages> | undefined
): TableNotification[] {
    if (_.isEmpty(tableSelection)) return [];

    const childrenIds = _(rows)
        .map(row => _(row).pick(childrenKeys).values().value())
        .flattenDeep()
        .value();

    const selection = _.differenceBy(tableSelection, childrenIds, "id");

    const allSelected = selection.length === total;
    const selectionInOtherPages = _.differenceBy(selection, rows, "id");
    const allSelectedInPage = _.differenceBy(rows, selection, "id").length === 0;
    const multiplePagesAvailable = total > rows.length;
    const selectAllImplemented = ids.length === total;
    const messages = { ...getMessages(), ...overrideMessages };

    const notifications = [
        allSelected
            ? {
                  message: messages.itemsInAllPages({ total: selection.length }),
                  link: messages.clearSelection,
                  newSelection: [],
              }
            : null,
        !allSelected && selectionInOtherPages.length > 0
            ? {
                  message: messages.itemsSelectedInOtherPages({
                      count: selection.length,
                      invisible: selectionInOtherPages.length,
                  }),
                  link: messages.clearSelection,
                  newSelection: [],
              }
            : null,
        !allSelected && allSelectedInPage && multiplePagesAvailable && selectAllImplemented
            ? {
                  message: messages.allItemsSelectedInCurrentPage({
                      total: rows.length,
                  }),
                  link: messages.selectAllItemsInAllPages({ total }),
                  newSelection: ids.map(id => ({ id })),
              }
            : null,
    ];

    return _(notifications)
        .compact()
        .filter(notification => Boolean(notification.message))
        .value();
}
