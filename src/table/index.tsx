import React from "react";
import { ensureArray, compareNumbers } from "./utils";
import { ArrayOrElem } from "./utils";
import TableContext, { Column } from "./context";

const CELL_SYMBOL = Symbol();

export type TableProps = {
    children: [React.ReactElement, BodyElement];
};
export type TableState = {
    sortBy: Array<[key: React.Key, rev: boolean]>;
};

export class Table extends React.Component<TableProps, TableState> {
    columns: { [key: React.Key]: { sortFn?: (a: any, b: any) => number } } = {};

    constructor(props: TableProps) {
        super(props);

        this.state = {
            sortBy: [],
        };
    }

    generateSetSortBy = (key: React.Key) => {
        return (
            reverse?: boolean,
            position?: "exclusive" | "first" | "last" | "current"
        ) => {
            const rev = reverse || false;
            const pos = position || "exclusive";

            switch (pos) {
                case "exclusive":
                    this.setState({ sortBy: [[key, rev]] });
                    break;
                case "first":
                case "last":
                    console.warn(key);
                    this.setState(({ sortBy }) => {
                        console.warn(sortBy);
                        sortBy = sortBy.filter(([k, _]) => key !== k);
                        console.warn(sortBy);
                        if (pos === "first") {
                            sortBy = [[key, rev], ...sortBy];
                        } else {
                            sortBy = [...sortBy, [key, rev]];
                        }
                        return { sortBy };
                    });
                    break;
                case "current":
                    this.setState(({ sortBy }) => {
                        const tuple = sortBy.find(([k, _]) => key === k);
                        if (tuple) {
                            tuple[1] = rev;
                        }
                        return { sortBy: [...sortBy] };
                    });
                    break;
            }
        };
    };

    render() {
        const {
            children: [head, body],
            ...passThrough
        } = this.props;

        // Preprocess rows
        let rows = ensureArray<RowElement>(body.props.children).map((row) => {
            const values: {
                [key: React.Key]: {
                    sortKey?: any;
                    groupKey?: any;
                    parentKey?: React.Key;
                };
                [CELL_SYMBOL]: RowElement;
            } = { [CELL_SYMBOL]: row };
            for (const {
                key,
                props: { sortKey, groupKey, parentKey },
            } of ensureArray<CellElement>(row.props.children)) {
                // Has the cell a key and has a column been found with it?
                if (key && key in this.columns) {
                    // Then add the cell's properties
                    values[key] = { sortKey, groupKey, parentKey };
                }
            }
            return values;
        });
        console.debug(rows);

        // Sort rows
        if (this.state.sortBy.length > 0) {
            rows = rows.sort((rowA, rowB) => {
                for (const [column, reverse] of this.state.sortBy) {
                    const valueA = rowA[column]?.sortKey;
                    const valueB = rowB[column]?.sortKey;

                    // If both rows have value, sort them
                    if (valueA !== undefined && valueB !== undefined) {
                        const { sortFn } = this.columns[column];
                        const cmp = sortFn === undefined ? 0 : sortFn(valueA, valueB);
                        if (cmp !== 0) {
                            if (reverse) return -cmp;
                            else return cmp;
                        }
                    }
                    // If neither row has a value, treat them as equal
                    else if (valueA === undefined && valueB === undefined) return 0;
                    // If one has and the other hasn't a value, put the row with a value first
                    else return (valueA !== undefined ? -1 : 1) * (reverse ? -1 : 1);
                }
                return 0;
            });
        }

        return (
            <table {...passThrough}>
                <TableContext.Provider
                    value={{
                        setColumn: (key, properties) => {
                            this.columns[key] = {};
                            if (properties.sortable) {
                                this.columns[key].sortFn =
                                    properties.sortFn || compareNumbers;
                            }
                        },
                        getColumn: (key) => {
                            const column = this.columns[key];
                            if (!column) return {};

                            let sortableState: Column.SortableState | undefined =
                                undefined;
                            if ("sortFn" in column) {
                                const index = this.state.sortBy.findIndex(
                                    ([k, _]) => k === key
                                );
                                sortableState = {
                                    setSortBy: this.generateSetSortBy(key),
                                    sorted:
                                        index === -1
                                            ? null
                                            : {
                                                  reversed: this.state.sortBy[index][1],
                                                  index,
                                              },
                                };
                            }

                            return { ...sortableState };
                        },
                    }}
                >
                    {[
                        head,
                        React.cloneElement(body, {
                            children: rows.map((row) => row[CELL_SYMBOL]),
                        }),
                    ]}
                </TableContext.Provider>
            </table>
        );
    }
}

export type BodyElement = React.ReactElement<BodyProps, typeof Body>;
export type BodyProps = {
    children: ArrayOrElem<RowElement>;
} & React.HTMLProps<HTMLTableSectionElement>;
export function Body(props: BodyProps) {
    const { children, ...passThrough } = props;
    return <tbody {...passThrough}>{children}</tbody>;
}

export type RowElement = React.ReactElement<RowProps, typeof Row>;
export type RowProps = {
    children: ArrayOrElem<CellElement>;
} & React.HTMLProps<HTMLTableRowElement>;
export function Row(props: RowProps) {
    const { children, ...passThrough } = props;
    return <tr {...passThrough}>{children}</tr>;
}

export type CellElement = React.ReactElement<CellProps, typeof Cell>;
export type CellProps = {
    sortKey?: any;
    groupKey?: any;
    parentKey?: React.Key;
} & React.HTMLProps<HTMLTableCellElement>;
export function Cell(props: CellProps) {
    const { children, sortKey, groupKey, parentKey, ...passThrough } = props;
    return <td {...passThrough}>{children}</td>;
}
