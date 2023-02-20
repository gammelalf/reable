import { Body, Cell, Row, Table } from "../table";
import Column from "../table/column";
import React from "react";
import data from "./hierarchicalData.json";

export default function HierarchicalTable() {
    const table = React.createRef<Table>();
    return (
        <>
            <label>
                <input
                    type="checkbox"
                    onChange={({ target: { checked } }) => {
                        if (table.current) {
                            table.current.setState({
                                parentBy: checked ? "name" : null,
                                parentOpen: Object.fromEntries(
                                    data.map(({ name }) => [name, false])
                                ),
                            });
                        }
                    }}
                />{" "}
                Tree view
            </label>
            <Table ref={table}>
                <thead key="head">
                    <tr>
                        <Column name="name">Name</Column>
                        <Column name="type">Type</Column>
                    </tr>
                </thead>
                <Body key="body">
                    {data.map(({ name, isDir, parent }) => (
                        <Row key={name}>
                            <Cell
                                key="name"
                                parentKey={parent === null ? undefined : parent}
                            >
                                {name}
                            </Cell>
                            <Cell key="type">{isDir ? "Directory" : "File"}</Cell>
                        </Row>
                    ))}
                </Body>
            </Table>
        </>
    );
}
