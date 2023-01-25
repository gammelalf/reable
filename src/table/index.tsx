import React from "react";

const CELL_SYMBOL = Symbol();

function compareNumbers(a: number, b: number): number {
    return a - b;
}

type ArrayOrElem<T> = T | Array<T>;
function ensureArray<T>(array: ArrayOrElem<T>): Array<T> {
    return array instanceof Array ? array : [array];
}

export type TableProps = {
    children: [HeadElement, BodyElement];
};
export type TableState = {
    sortBy: Array<[key: React.Key, rev: boolean]>;
};
export class Table extends React.Component<TableProps, TableState> {
    constructor(props: TableProps) {
        super(props);

        this.state = {
            sortBy: [],
        };
    }

    render() {
        let {
            children: [head, body],
            ...passThrough
        } = this.props;

        // Preprocess columns
        const columns: { [key: React.Key]: { sortFn: (a: any, b: any) => number } } = {};
        const headRow: RowElement = head.props.children;
        for (const {
            key,
            props: { sortFn },
        } of ensureArray<CellElement>(headRow.props.children)) {
            if (key) {
                columns[key] = { sortFn: sortFn || compareNumbers };
            }
        }
        console.debug(columns);

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
                if (key && key in columns) {
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
                        const { sortFn } = columns[column];
                        const cmp = sortFn(valueA, valueB);
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

        body = { ...body };
        body.props = { ...body.props };
        body.props.children = rows.map((row) => row[CELL_SYMBOL]);

        return <table {...passThrough}>{[head, body]}</table>;
    }
}

export type HeadElement = React.ReactElement<HeadProps, typeof Head>;
export type HeadProps = {
    children: RowElement;
} & React.HTMLProps<HTMLTableSectionElement>;
export function Head(props: HeadProps) {
    const { children, ...passThrough } = props;
    return <thead {...passThrough}>{children}</thead>;
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

    sortFn?: (a: any, b: any) => number;
} & React.HTMLProps<HTMLTableCellElement>;
export function Cell(props: CellProps) {
    const { children, sortKey, groupKey, parentKey, ...passThrough } = props;
    return <td {...passThrough}>{children}</td>;
}
