import { Cell, Row, Table, Column } from "../table";
import data from "./sortableData.json";
import React from "react";

function Color(props: { color: string }) {
    return (
        <div
            style={{
                backgroundColor: props.color,
                color: "transparent",
            }}
        >
            .
        </div>
    );
}

export default function SortableTable() {
    return (
        <Table>
            <thead key="head">
                <tr>
                    <Column name="name" sortable>
                        Name
                    </Column>
                    <Column
                        name="fruit"
                        sortable
                        sortFn={(a: string, b: string) => a.localeCompare(b)}
                    >
                        Fruit
                    </Column>
                    <Column
                        name="done"
                        sortable
                        groupable
                        groupRow={(done: boolean) => <tr>{done ? "Done" : "To do"}</tr>}
                    >
                        Done
                    </Column>
                    <Column name="time" sortable>
                        Date
                    </Column>
                    <Column
                        name="color"
                        sortable
                        groupable
                        groupRow={(color: string) => (
                            <tr>
                                <Color color={color} />
                            </tr>
                        )}
                    >
                        Color
                    </Column>
                </tr>
            </thead>
            <tbody key="body">
                {data.map(({ id, name, fruit, done, timestamp, color }) => (
                    <Row key={id}>
                        <Cell column="name" sortKey={id}>
                            {name}
                        </Cell>
                        <Cell column="fruit" sortKey={fruit === null ? undefined : fruit}>
                            {fruit || ""}
                        </Cell>
                        <Cell column="done" sortKey={done ? 1 : 0} groupKey={done}>
                            <input type="checkbox" disabled checked={done} />
                        </Cell>
                        <Cell column="time" sortKey={timestamp}>
                            {new Date(timestamp * 1000).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            })}
                        </Cell>
                        <Cell
                            column="color"
                            sortKey={color === "red" ? 0 : color === "green" ? 1 : 2}
                            groupKey={color}
                        >
                            <Color color={color} />
                        </Cell>
                    </Row>
                ))}
            </tbody>
        </Table>
    );
}
