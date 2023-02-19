import React from "react";
import { Column, useColumn } from "./context";
import Caret from "./caret";

/**
 * The builtin default component for defining columns
 */
export default function ColumnComponent(
    props: { name: React.Key; children: React.ReactNode } & Column.Props
) {
    const { children, name, ...properties } = props;

    // Set the column's props and retrieve its state
    const column = useColumn(name, properties);

    let caret: "up" | "down" | undefined;
    let onClick: ((event: React.MouseEvent) => void) | undefined;

    if ("sorted" in column) {
        const { sorted, setSortBy } = column;
        if (sorted) caret = sorted.reversed ? "up" : "down";
        onClick = (event) => {
            event.preventDefault();
            setSortBy(!!sorted && !sorted.reversed, event.ctrlKey ? "last" : "exclusive");
        };
    }

    return (
        <th onClick={onClick}>
            {children} {caret && <Caret orientation={caret} />}
        </th>
    );
}
ColumnComponent.displayName = "Column";
