import { Cell, Row, Table, Column } from "../table";
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
                            });
                        }
                    }}
                />
                Tree view
            </label>
            <Table ref={table}>
                <thead key="head">
                    <tr>
                        <Column name="name">Name</Column>
                        <Column name="type">Type</Column>
                    </tr>
                </thead>
                <tbody key="body">
                    {data.map(({ name, isDir, parent }) => (
                        <Row key={name}>
                            <Cell
                                column="name"
                                parentKey={parent === null ? undefined : parent}
                            >
                                {name}
                            </Cell>
                            <Cell column="type">{isDir ? "Directory" : "File"}</Cell>
                        </Row>
                    ))}
                </tbody>
            </Table>
        </>
    );
}
