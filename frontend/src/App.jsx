import { useState } from "react";
import "./App.css";
import Table from "./components/Table";

const algorithms = [
    { value: "fcfs", text: "First Comes First Served" },
    { value: "sjf-non-preemtive", text: "Shortest Job First - non-preemtive" },
    { value: "sjf-preemtive", text: "Shortest Job First - preemtive" },
];
function App() {
    const [algorithm, setAlgorithm] = useState("fcfs");
    function handleAlgoChange(e) {
        setAlgorithm(() => e.target.value);
    }
    return (
        <>
            <div style={{ marginBottom: "10px" }}>
                <label htmlFor="algo" style={{ marginRight: "5px" }}>
                    Algorithm
                </label>
                <select
                    id="algo"
                    value={algorithm}
                    onChange={(e) => handleAlgoChange(e)}
                >
                    {algorithms.map((item) => {
                        return (
                            <option
                                key={item.text + item.value}
                                value={item.value}
                            >
                                {item.text}
                            </option>
                        );
                    })}
                </select>
            </div>
            <Table algorithm={algorithm} />
        </>
    );
}

export default App;
