import React from "react";

const TableContext = React.createContext<TableContext>({
    setColumn(key, props) {},
    getColumn(key) {
        return undefined;
    },
});
export default TableContext;

export type TableContext = {
    setColumn: (key: React.Key, props: Column.Props) => void;
    getColumn: (key: React.Key) => Column.State | undefined;
};

/**
 * Convenience hook for working with the table context
 */
export function useColumn(key: React.Key, props: Column.Props): Column.State {
    const table = React.useContext(TableContext);
    table.setColumn(key, props);
    const column = table.getColumn(key);

    if (column === undefined) {
        console.error(
            "A critical error happened in a table context: `getColumn` returned `undefined`, but `setColumn` has been called immediately before."
        );
        console.debug(key, props, table);
        throw new Error("A critical error happened in a table context!");
    } else return column;
}

export namespace Column {
    /**
     * A column's properties i.e. the configuration to register a column with
     */
    export type Props = SortableProps | { sortable?: false };
    /**
     * A column's state i.e. the information, the table exposes about a registered column
     */
    export type State = SortableState | {};

    /**
     * Properties required for a sortable column
     */
    export type SortableProps =
        | {
              sortable: true;

              /**
               * Defaults to comparison of numbers
               */
              sortFn?: (a: any, b: any) => number;
          }
        | { sortable: false };

    /**
     * State resulting from a column being sortable
     */
    export type SortableState = {
        /**
         * Callback to modify the table's sortBy state
         *
         * @param reverse sort in reverse direction?
         * @param position set the sorting position when sorting by multiple columns
         */
        setSortBy: (
            reverse?: boolean,
            position?: "exclusive" | "first" | "last" | "current"
        ) => void;

        /**
         * Is and how is the column sorted?
         */
        sorted: null | {
            /**
             * Is the sorting direction reversed?
             */
            reversed: boolean;

            /**
             * This column's position in the sorting order
             *
             * (`0` is the primary sorting)
             */
            index: number;
        };
    };
}
