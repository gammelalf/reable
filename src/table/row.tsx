import React from "react";
import { ArrayOrElem } from "./utils";
import { CellElement } from "./table";
import Caret from "./caret";

export namespace Row {
    export type Context =
        | {}
        | { open: boolean; setOpen: (open: boolean) => void; indent: number };

    export type Props = {
        children: ArrayOrElem<CellElement>;
    };

    export type Element = React.ReactElement<Props>;
}

export const RowContext = React.createContext<Row.Context>({});

/** The builtin default component for rendering rows */
export default function RowComponent(
    props: Row.Props & React.HTMLProps<HTMLTableRowElement>
) {
    const { children, ...passThrough } = props;
    const row = React.useContext(RowContext);

    if ("indent" in row) {
        const { indent, open, setOpen } = row;

        if (!("style" in passThrough)) passThrough.style = {};
        // @ts-ignore
        passThrough.style["--indent"] = indent;

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
