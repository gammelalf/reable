import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

type MainState = {};

class Main extends React.Component<{}, MainState> {
    render() {
        return "Hello World";
    }
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <Main />
    </React.StrictMode>
);
