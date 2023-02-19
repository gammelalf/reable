import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Table, Body, Cell, Row } from "./table";
import data from "./data.json";
import Column from "./table/column";

type MainState = {};

class Main extends React.Component<{}, MainState> {
    render() {
        return (
            <Table>
                <thead key="head">
                    <tr>
                        <Column key="name" name="name" sortable>
                            Name
                        </Column>
                        <Column
                            key="fruit"
                            name="fruit"
                            sortable
                            sortFn={(a: string, b: string) => a.localeCompare(b)}
                        >
                            Fruit
                        </Column>
                        <Column key="done" name="done" sortable>
                            Done
                        </Column>
                        <Column key="time" name="time" sortable>
                            Date
                        </Column>
                        <Column key="color" name="color" sortable>
                            Color
                        </Column>
                    </tr>
                </thead>
                <Body key="body">
                    {data.map(({ id, name, fruit, done, timestamp, color }) => (
                        <Row key={id}>
                            <Cell key="name" sortKey={id}>
                                {name}
                            </Cell>
                            <Cell
                                key="fruit"
                                sortKey={fruit === null ? undefined : fruit}
                            >
                                {fruit || ""}
                            </Cell>
                            <Cell key="done" sortKey={done ? 1 : 0}>
                                <input type="checkbox" disabled checked={done} />
                            </Cell>
                            <Cell key="time" sortKey={timestamp}>
                                {new Date(timestamp * 1000).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                })}
                            </Cell>
                            <Cell
                                key="color"
                                sortKey={color === "red" ? 0 : color === "green" ? 1 : 2}
                            >
                                <div
                                    style={{
                                        backgroundColor: color,
                                        color: "transparent",
                                    }}
                                >
                                    .
                                </div>
                            </Cell>
                        </Row>
                    ))}
                </Body>
            </Table>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<Main />);
