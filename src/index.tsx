import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Table, { Cell, Column, Head } from "./table";

type MainState = {};

class Main extends React.Component<{}, MainState> {
    render() {
        const data = [
            { id: 1, name: "Alice", age: 18, gender: "Female" },
            { id: 2, name: "Bob", age: 19, gender: "Male" },
            { id: 3, name: "Charles", age: 32, gender: "Male" },
            { id: 3, name: "Danielle", age: 69, gender: "Female" },
            { id: -1, name: "Malory", age: NaN, gender: "Other" },
        ];
        return (
            <Table>
                <Column key="name">
                    <Head>Name</Head>
                    {data.map(({ id, name }) => (
                        <Cell key={id}>{name}</Cell>
                    ))}
                </Column>
                <Column key="age" sortable>
                    <Head>Age</Head>
                    {data.map(({ id, age }) => (
                        <Cell key={id} sortKey={age}>
                            {age.toString()}
                        </Cell>
                    ))}
                </Column>
                <Column key="gender">
                    <Head>Gender</Head>
                    {data.map(({ id, gender }) => (
                        <Cell key={id}>{gender}</Cell>
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
