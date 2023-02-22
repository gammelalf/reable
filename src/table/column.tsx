import React from "react";
import { Column, useColumn } from "./context";
import { Caret, GroupBy } from "./icons";

/**
 * The builtin default component for defining columns
 */
export default function ColumnComponent(
    props: { name: React.Key; children: React.ReactNode } & Column.Props
) {
    const { children, name, ...properties } = props;

    // Set the column's props and retrieve its state
    const column = useColumn(name, properties);

    let caret: React.ReactNode = null;
    if (props.sortable && "sorted" in column) {
        const { sorted, setSortBy } = column;
        caret = (
            <Caret
                className={!!sorted ? "icon" : "icon inactive"}
                orientation={!sorted || !sorted.reversed ? "down" : "up"}
                onClick={(event) => {
                    event.stopPropagation();
                    setSortBy(
                        !!sorted && !sorted.reversed,
                        event.ctrlKey ? "last" : "exclusive"
                    );
                }}
            />
        );
    }

    let groupBy: React.ReactNode = null;
    if (properties.groupable && "grouped" in column) {
        const { grouped, toggleGroupBy } = column;
        groupBy = (
            <GroupBy
                className={grouped ? "icon" : "icon inactive"}
                onClick={(event) => {
                    event.stopPropagation();
                    toggleGroupBy();
                }}
            />
        );
    }

    let onClick: React.EventHandler<React.MouseEvent> | undefined;
    if (caret !== null && groupBy === null) onClick = caret.props.onClick;
    else if (caret === null && groupBy !== null) onClick = groupBy.props.onClick;

    return (
        <th onClick={onClick}>
            {groupBy}
            {children}
            {caret}
        </th>
    );
}
ColumnComponent.displayName = "Column";
