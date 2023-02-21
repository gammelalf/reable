import React from "react";
import { ensureArray, compareNumbers } from "./utils";
import { ArrayOrElem } from "./utils";
import TableContext, { Column } from "./context";
import Caret from "./caret";

const CHILDREN_SYMBOL = Symbol();
const CELL_SYMBOL = Symbol();

export type TableProps = {
    children: [React.ReactElement, BodyElement];
};
export type TableState = {
    sortBy: Array<[key: React.Key, rev: boolean]>;
    parentBy: React.Key | null;
    parentOpen: { [key: React.Key]: boolean };
};

export class Table extends React.Component<TableProps, TableState> {
    columns: { [key: React.Key]: { sortFn?: (a: any, b: any) => number } } = {};

    constructor(props: TableProps) {
        super(props);

        this.state = {
            sortBy: [],
            parentBy: null,
            parentOpen: {},
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
        };
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
            [CELL_SYMBOL]: RowElement;
        };
        let rows = ensureArray<RowElement>(body.props.children).map((row) => {
            const data: DataRow = { [CELL_SYMBOL]: row, [CHILDREN_SYMBOL]: [] };
            for (const {
                key,
                props: { sortKey, groupKey, parentKey },
            } of ensureArray<CellElement>(row.props.children)) {
                // Has the cell a key and has a column been found with it?
                if (key !== null && key in this.columns) {
                    // Then add the cell's properties
                    data[key] = { sortKey, groupKey, parentKey };
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

                row[CELL_SYMBOL] = React.cloneElement(row[CELL_SYMBOL], {
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
                });
                rows.push(row);

                if (key !== null && this.state.parentOpen[key])
                    for (const child of row[CHILDREN_SYMBOL]) pushRow(child, indent + 1);
            };
            for (const row of topRows) pushRow(row, 0);
        }

        const contextCache: { [key: React.Key]: Column.State } = {};
        const context = {
            setColumn: (key: React.Key, properties: Column.Props) => {
                this.columns[key] = {};
                if (properties.sortable) {
                    this.columns[key].sortFn = properties.sortFn || compareNumbers;
                }
                delete contextCache[key];
            },
            getColumn: (key: React.Key) => {
                if (key in contextCache) return contextCache[key];

                const column = this.columns[key];
                if (!column) return {};

                let sortableState: Column.SortableState | undefined = undefined;
                if ("sortFn" in column) {
                    const index = this.state.sortBy.findIndex(([k, _]) => k === key);
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

                const state = { ...sortableState };
                contextCache[key] = state;
                return state;
            },
        };

        return (
            <table {...passThrough}>
                <TableContext.Provider value={context}>
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

export type RowElement = React.ReactElement<RowProps>;
export type RowProps = {
    children: ArrayOrElem<CellElement>;
    indent?: number;
    open?: boolean;
    setOpen?: (open: boolean) => void;
} & React.HTMLProps<HTMLTableRowElement>;
export function Row(props: RowProps) {
    const { children, indent, open, setOpen, ...passThrough } = props;
    if (indent !== undefined) {
        if (!("style" in passThrough)) passThrough.style = {};
        // @ts-ignore
        passThrough.style["--indent"] = indent;
    }
    if (open === undefined) return <tr {...passThrough}>{children}</tr>;
    else
        return (
            <tr {...passThrough}>
                {React.Children.map(children, (elem, idx) =>
                    idx === 0 ? React.cloneElement(elem, { open, setOpen }) : elem
                )}
            </tr>
        );
}

export type CellElement = React.ReactElement<CellProps>;
export type CellProps = {
    /** Value the column's sort function operates on */
    sortKey?: any;

    /** WIP */
    groupKey?: any;

    /**
     * Another row's key, this cell's value "points" to.
     * (Think of it as a foreign key in a database)
     */
    parentKey?: React.Key | undefined;

    open?: boolean;
    setOpen?: (open: boolean) => void;
} & React.HTMLProps<HTMLTableCellElement>;
export function Cell(props: CellProps) {
    const { children, sortKey, groupKey, parentKey, open, setOpen, ...passThrough } =
        props;
    return (
        <td {...passThrough}>
            <div>
                {open === undefined ? null : (
                    <Caret
                        orientation={open ? "down" : "right"}
                        onClick={() => setOpen && setOpen(!open)}
                    />
                )}
                {children}
            </div>
        </td>
    );
}
