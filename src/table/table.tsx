import React from "react";
import { ensureArray, compareNumbers, ContainsChildren } from "./utils";
import TableContext, { Column } from "./context";
import { RowContext, Row } from "./row";

const CHILDREN_SYMBOL = Symbol();
const CELL_SYMBOL = Symbol();
const CONTEXT_SYMBOL = Symbol();

export type TableProps = {
    children: [React.ReactElement, ContainsChildren<Row.Element>];
};
export type TableState = {
    sortBy: Array<[key: React.Key, rev: boolean]>;
    parentBy: React.Key | null;
    parentOpen: { [key: React.Key]: boolean };
    groupBy: React.Key | null;
};

export class Table extends React.Component<TableProps, TableState> {
    columns: {
        [key: React.Key]: {
            sortFn?: (a: any, b: any) => number;
            groupRow?: (groupKey: any) => React.ReactNode;
        };
    } = {};

    constructor(props: TableProps) {
        super(props);

        this.state = {
            sortBy: [],
            parentBy: null,
            parentOpen: {},
            groupBy: null,
        };
    }

    getColumnState = (key: React.Key) => {
        const column = this.columns[key];
        if (column === undefined) return {};

        let sortableState: Column.SortableState | undefined = undefined;
        if ("sortFn" in column) {
            const index = this.state.sortBy.findIndex(([k, _]) => k === key);
            sortableState = {
                setSortBy: (
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
                            this.setState(({ sortBy }) => {
                                sortBy = sortBy.filter(([k, _]) => key !== k);
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
                },
                sorted:
                    index === -1
                        ? null
                        : {
                              reversed: this.state.sortBy[index][1],
                              index,
                          },
            };
        }

        let groupableState: Column.GroupableState | undefined = undefined;
        if ("groupRow" in column) {
            const grouped = this.state.groupBy === key;
            groupableState = {
                toggleGroupBy: () =>
                    this.setState(({ groupBy }) => ({
                        groupBy: groupBy === key ? null : key,
                    })),
                grouped,
            };
        }

        return { ...sortableState, ...groupableState };
    };

    render() {
        const {
            children: [head, body],
            ...passThrough
        } = this.props;

        // Preprocess rows
        type DataRow = {
            /** Data stored in each column */
            [key: React.Key]: {
                sortKey?: any;
                groupKey?: any;
                parentKey?: React.Key;
            };
            /** List of hierarchical children*/
            [CHILDREN_SYMBOL]: Array<DataRow>;
            /** The original react element */
            [CELL_SYMBOL]: Row.Element;
            /** Context object to set */
            [CONTEXT_SYMBOL]?: Row.Context;
        };
        let rows = ensureArray<Row.Element>(body.props.children).map((row) => {
            const data: DataRow = {
                [CELL_SYMBOL]: row,
                [CHILDREN_SYMBOL]: [],
            };
            for (const {
                props: { column, sortKey, groupKey, parentKey },
            } of ensureArray<CellElement>(row.props.children)) {
                // Has this column been registered?
                if (column in this.columns) {
                    // Then add the cell's properties
                    data[column] = { sortKey, groupKey, parentKey };
                }
            }
            return data;
        });

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

        if (this.state.groupBy !== null && this.state.parentBy !== null)
            console.error("Both tree views at the same time is not supported");

        let bodyChildren: Array<React.ReactNode>;

        // Build a parent tree
        if (this.state.parentBy !== null) {
            const column = this.state.parentBy;
            const lookup = Object.fromEntries(
                rows.map((row) => [row[CELL_SYMBOL].key, row])
            );
            const topRows = rows.filter((row) => {
                const parentKey = row[column]?.parentKey;
                if (parentKey !== undefined) {
                    const parent = lookup[parentKey];
                    if (parent !== undefined) {
                        parent[CHILDREN_SYMBOL].push(row);
                        return false;
                    }
                }
                return true;
            });

            rows = [];
            const pushRow = (row: DataRow, indent: number) => {
                const key = row[CELL_SYMBOL].key;
                row[CONTEXT_SYMBOL] = {
                    indent,
                    open: key === null ? undefined : Boolean(this.state.parentOpen[key]),
                    setOpen:
                        key === null
                            ? undefined
                            : (open: boolean) => {
                                  this.setState(
                                      ({ parentOpen: { [key]: _, ...parentOpen } }) => ({
                                          parentOpen: { [key]: open, ...parentOpen },
                                      })
                                  );
                              },
                };
                rows.push(row);

                if (key !== null && this.state.parentOpen[key])
                    for (const child of row[CHILDREN_SYMBOL]) pushRow(child, indent + 1);
            };
            for (const row of topRows) pushRow(row, 0);

            bodyChildren = rows.map((row) => (
                <RowContext.Provider
                    key={row[CELL_SYMBOL].key}
                    value={row[CONTEXT_SYMBOL] || {}}
                >
                    {row[CELL_SYMBOL]}
                </RowContext.Provider>
            ));
        } else if (
            this.state.groupBy !== null &&
            this.columns[this.state.groupBy].groupRow !== undefined
        ) {
            const column = this.state.groupBy;
            const groups: Map<any, Array<DataRow>> = new Map();
            for (const row of rows) {
                let group = groups.get(row[column].groupKey);
                if (group === undefined) {
                    group = [];
                    groups.set(row[column].groupKey, group);
                }
                group.push(row);
            }

            bodyChildren = [];
            for (const [key, group] of groups) {
                bodyChildren.push(this.columns[column].groupRow(key));
                bodyChildren.push(...group.map((row) => row[CELL_SYMBOL]));
            }
        } else {
            bodyChildren = rows.map((row) => row[CELL_SYMBOL]);
        }

        const contextCache: { [key: React.Key]: Column.State } = {};
        const context = {
            setColumn: (key: React.Key, properties: Column.Props) => {
                this.columns[key] = {};
                if (properties.sortable) {
                    this.columns[key].sortFn = properties.sortFn || compareNumbers;
                }
                if (properties.groupable) {
                    this.columns[key].groupRow = properties.groupRow;
                }
                delete contextCache[key];
            },
            getColumn: (key: React.Key) => {
                if (!(key in contextCache)) contextCache[key] = this.getColumnState(key);
                return contextCache[key];
            },
            rowIndent: this.state.groupBy === null ? 0 : 1,
        };

        return (
            <table {...passThrough}>
                <TableContext.Provider value={context}>
                    {[head, React.cloneElement(body, { children: bodyChildren })]}
                </TableContext.Provider>
            </table>
        );
    }
}

export type CellElement = React.ReactElement<CellProps>;
export type CellProps = {
    /** The column's name for which this cell contains data */
    column: React.Key;

    /** Value the column's sort function operates on */
    sortKey?: any;

    /** WIP */
    groupKey?: any;

    /**
     * Another row's key, this cell's value "points" to.
     * (Think of it as a foreign key in a database)
     */
    parentKey?: React.Key | undefined;
} & React.HTMLProps<HTMLTableCellElement>;
export function Cell(props: CellProps) {
    const { children, sortKey, groupKey, parentKey, ...passThrough } = props;
    return (
        <td {...passThrough}>
            <div>{children}</div>
        </td>
    );
}
