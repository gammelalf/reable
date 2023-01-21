import React from "react";

function compareNumbers(a: number, b: number): number {
    return a - b;
}

type ArrayOrElem<T> = T | Array<T>;
function ensureArray<T>(array: ArrayOrElem<T>): Array<T> {
    return array instanceof Array ? array : [array];
}

export type TableProps = {
    children: ArrayOrElem<ColumnElement>;
};
export type TableState = {
    sortRev: boolean;
    sortBy: number | null;
};

export default class Table extends React.Component<TableProps, TableState> {
    constructor(props: TableProps) {
        super(props);

        this.state = {
            sortRev: false,
            sortBy: null,
        };
    }

    render() {
        const columns = ensureArray(this.props.children).map((column) => {
            const [head, cells] = column.props.children;
            return {
                head,
                cells: ensureArray(cells),
                key: column.key,
                sortable: column.props.sortable || false,
                sortFn: column.props.sortFn || compareNumbers,
            };
        });

        const numRows = Math.max(...columns.map(({ cells }) => cells.length));
        let rowOrder = Array.from({ length: numRows }, (_, i) => i);
        if (this.state.sortBy !== null) {
            const { sortable, sortFn } = columns[this.state.sortBy];
            if (sortable) {
                rowOrder = columns[this.state.sortBy].cells
                    .map((cell, i) => [cell.props.sortKey, i])
                    .sort(([a, _a], [b, _b]) => sortFn(a, b))
                    .map(([_, index]) => index);
                while (rowOrder.length < numRows) {
                    rowOrder.push(rowOrder.length);
                }
                if (this.state.sortRev) rowOrder = rowOrder.reverse();
            } else {
                console.error(
                    `Invalid \`state.sortBy\`: column ${this.state.sortBy} isn't sortable`
                );
            }
        }

        return (
            <table>
                <thead key="thead">
                    <tr>
                        {columns.map(({ key, head }) => (
                            <React.Fragment key={key}>{head}</React.Fragment>
                        ))}
                    </tr>
                </thead>
                <tbody key="tbody">
                    {rowOrder.map((i) => (
                        <tr key={i}>
                            {columns.map(({ key, cells }) => (
                                <React.Fragment key={key}>
                                    {cells[i] || null}
                                </React.Fragment>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
}

/**
 * A JSX `<Head/>` element
 */
type ColumnElement = React.ReactElement<ColumnProps, typeof Column>;
type ColumnProps = {
    sortable?: boolean;
    sortFn?: (a: any, b: any) => number;
    children: [HeadElement, ArrayOrElem<CellElement>];
};
export function Column(_: ColumnProps) {
    return null;
}

/**
 * A JSX `<Head/>` element
 */
type HeadElement = React.ReactElement<HeadProps, typeof Head>;
type HeadProps = {
    children: React.ReactNode;
};
export function Head(props: HeadProps) {
    return <th>{props.children || null}</th>;
}

/**
 * A JSX `<Cell/>` element
 */
type CellElement = React.ReactElement<CellProps, typeof Cell>;
type CellProps = {
    children: React.ReactNode;
    sortKey?: any;
};
export function Cell(props: CellProps) {
    return <td>{props.children || null}</td>;
}