import { useRef, useState } from "react";
import "../App.css";
import axios from "axios";

const fields = {
    fcfs: [
        { id: "arrival-time", label: "Arrival time", type: "numeric" },
        { id: "burst-time", label: "Burst time", type: "numeric" },
    ],
};

const SERVER_URL = "http://localhost:8080";

function ProcessForm({ algorithm, process, onProcessChange }) {
    return (
        <tr>
            <td>{process["process-name"]}</td>
            {fields[algorithm].map((field) => (
                <td key={field.id}>
                    <input
                        type={field.type}
                        placeholder={field.label}
                        value={process[field.id]}
                        onChange={(e) =>
                            onProcessChange(field.id, e.target.value)
                        }
                    />
                </td>
            ))}
        </tr>
    );
}

function Table({ algorithm }) {
    const [processes, setProcesses] = useState([]);
    const processCountRef = useRef(0);

    function addNewProcess() {
        const newProcess = {
            id: Date.now(),
            "process-number": processCountRef.current,
            "process-name": `P-${processCountRef.current + 1}`,
            "arrival-time": 0, // default to numeric value
            "burst-time": 0, // default to numeric value
            "turnaround-time": 0,
            "remaining-time": 0,
            "start-time": 0,
            "finish-time": 0,
            "waiting-time": 0,
        };
        setProcesses((prevProcesses) => [...prevProcesses, newProcess]);
        processCountRef.current++;
    }

    async function submitProcesses() {
        try {
            const response = await axios.post(`${SERVER_URL}/send`, processes, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            console.log("Received data: ", response.data);
        } catch (err) {
            console.error("Error:", err);
        }
    }

    function deleteProcess() {
        if (processes.length > 0) {
            setProcesses((prev) => prev.slice(0, -1));
            processCountRef.current--;
        }
    }

    function handleProcessChange(processId, fieldId, value) {
        setProcesses((prevProcesses) =>
            prevProcesses.map((process) => {
                if (process.id === processId) {
                    if (fieldId !== "process-name") {
                        value = parseInt(value, 10);
                    }
                    return {
                        ...process,
                        [fieldId]: value,
                    };
                }
                return process;
            }),
        );
    }

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Process</th>
                        {fields[algorithm].map((field) => (
                            <th key={field.id}>{field.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {processes.map((process) => (
                        <ProcessForm
                            key={process.id}
                            algorithm={algorithm}
                            process={process}
                            onProcessChange={(fieldId, value) =>
                                handleProcessChange(process.id, fieldId, value)
                            }
                        />
                    ))}
                </tbody>
            </table>
            <div className="table-buttons">
                <button onClick={addNewProcess} className="btn add-btn">
                    Add Process
                </button>
                <button onClick={deleteProcess} className="btn delete-btn">
                    Delete last process
                </button>
                <button className="btn submit-btn" onClick={submitProcesses}>
                    Submit all processes
                </button>
            </div>
        </div>
    );
}

export default Table;
