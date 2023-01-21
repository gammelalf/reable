import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Table, { Cell, Column, Head } from "./table";
import data from "./data.json";

type MainState = {};

class Main extends React.Component<{}, MainState> {
    render() {
        return (
            <Table>
                <Column key="name" sortable>
                    <Head>Name</Head>
                    {data.map(({ id, name }) => (
                        <Cell key={id} sortKey={id}>
                            {name}
                        </Cell>
                    ))}
                </Column>
                <Column
                    key="fruit"
                    sortable
                    sortFn={(a: string, b: string) => a.localeCompare(b)}
                >
                    <Head>Fruit</Head>
                    {data.map(({ id, fruit }) => (
                        <Cell key={id} sortKey={fruit || ""}>
                            {fruit || ""}
                        </Cell>
                    ))}
                </Column>
                <Column key="gender" sortable>
                    <Head>Done</Head>
                    {data.map(({ id, done }) => (
                        <Cell key={id} sortKey={done ? 1 : 0}>
                            <input type="checkbox" disabled checked={done} />
                        </Cell>
                    ))}
                </Column>
                <Column key="time" sortable>
                    <Head>Date</Head>
                    {data.map(({ id, timestamp }) => (
                        <Cell key={id} sortKey={timestamp}>
                            {new Date(timestamp * 1000).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            })}
                        </Cell>
                    ))}
                </Column>
                <Column key="color" sortable>
                    <Head>Color</Head>
                    {data.map(({ id, color }) => (
                        <Cell
                            key={id}
                            sortKey={color === "red" ? 0 : color === "green" ? 1 : 2}
                        >
                            <div style={{ backgroundColor: color, color: "transparent" }}>
                                .
                            </div>
                        </Cell>
                    ))}
                </Column>
            </Table>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <Main />
    </React.StrictMode>
);
