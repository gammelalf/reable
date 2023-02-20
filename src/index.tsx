import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import SortableTable from "./pages/sortable";
import HierarchicalTable from "./pages/hierarchical";

class Main extends React.Component<{}, {}> {
    onHashChange = () => this.setState({});

    componentDidMount() {
        window.addEventListener("hashchange", this.onHashChange);
    }

    componentWillUnmount() {
        window.removeEventListener("hashchange", this.onHashChange);
    }

    render() {
        let unknownRoute;
        switch (window.location.hash) {
            case "#/sortable":
                return <SortableTable />;
            case "#/hierarchical":
                return <HierarchicalTable />;
            case "":
            case "#/":
                unknownRoute = false;
                break;
            default:
                unknownRoute = true;
                break;
        }
        return (
            <div>
                {unknownRoute && `Unknown route: "${window.location.hash}"`}
                <ul>
                    <li>
                        <a href="#/sortable">Sortable table</a>
                    </li>
                    <li>
                        <a href="#/hierarchical">Hierarchical table</a>
                    </li>
                </ul>
            </div>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<Main />);
