import React from "react";
import { ArrayOrElem } from "./utils";
import { CellElement } from "./table";
import { Caret } from "./icons";
import TableContext from "./context";

export namespace Row {
    export type Context = {} | { indent: number };

    export type Props = {
        /** A row requires a key as `<Table/>` uses it to identify it */
        key: React.Key;
        children: ArrayOrElem<CellElement>;
    };
    export type State = {} | ParentTreeState;

    /** Row is rendered in a parent tree view */
    export type ParentTreeState = {
        /** Indent this row should be rendered at */
        indent: number;
        /** Are this row's children rendered? */
        open: boolean;
        /** Set whether the row's children should be rendered */
        setOpen: (open: boolean) => void;
    };

    export type Element = React.ReactElement<Props>;
}

export const RowContext = React.createContext<Row.State>({});

/** The builtin default component for rendering rows */
export default function RowComponent(
    props: Row.Props & React.HTMLProps<HTMLTableRowElement>
) {
    const { children, ...passThrough } = props;
    const table = React.useContext(TableContext);
    const row = React.useContext(RowContext);

    const indent = table.rowIndent + ("indent" in row ? row.indent : 0);
    if (indent !== 0) {
        if (!("style" in passThrough)) passThrough.style = {};
        // @ts-ignore
        passThrough.style["--indent"] = indent;
    }

    if ("indent" in row) {
        const { open, setOpen } = row;

        const flatChildren = React.Children.toArray(children);
        const first = flatChildren[0];
        if (
            first !== undefined &&
            React.isValidElement<{ children: React.ReactNode }>(first)
        ) {
            flatChildren[0] = React.cloneElement(first, {
                children: [
                    <Caret
                        orientation={open ? "down" : "right"}
                        onClick={() => setOpen && setOpen(!open)}
                    />,
                    first.props.children,
                ],
            });
        }

        return <tr {...passThrough}>{flatChildren}</tr>;
    } else return <tr {...passThrough}>{children}</tr>;
}
RowComponent.displayName = "Row";
