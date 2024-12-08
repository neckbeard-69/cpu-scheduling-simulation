import { useRef, useState } from "react";
import "../App.css";
import Chart from "./Chart";
import axios from "axios";


const fields = {
    fcfs: [
        { id: "arrival-time", label: "Arrival time", type: "numeric" },
        { id: "burst-time", label: "Burst time", type: "numeric" },
    ],
    "sjf-non-preemtive": [
        { id: "arrival-time", label: "Arrival time", type: "numeric" },
        { id: "burst-time", label: "Burst time", type: "numeric" },
    ],
    "sjf-preemtive": [
        { id: "arrival-time", label: "Arrival time", type: "numeric" },
        { id: "burst-time", label: "Burst time", type: "numeric" },
    ],
    "priority-non-preemtive": [
        { id: "arrival-time", label: "Arrival time", type: "numeric" },
        { id: "burst-time", label: "Burst time", type: "numeric" },
        { id: "priority", label: "Priority", type: "numeric" },
    ],
    "priority-preemtive": [
        { id: "arrival-time", label: "Arrival time", type: "numeric" },
        { id: "burst-time", label: "Burst time", type: "numeric" },
        { id: "priority", label: "Priority", type: "numeric" },
    ],
};

const SERVER_URL = "http://localhost:8080";


function ProcessForm({ algorithm, process, onProcessChange }) {

    return (
        <tr>
            <td key={process["process-name"]}>{process["process-name"]}</td>
            {fields[algorithm].map((field) => (
                < td key={field.id} >
                    <input
                        type={field.type}
                        placeholder={field.label}
                        value={process[field.id]}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || !isNaN(value) || (field.id === "priority" && value === "-")) {
                                onProcessChange(field.id, value, process.id);
                            }
                        }}
                    />
                </td>
            ))
            }
        </tr >
    );
}

function Table({ algorithm }) {
    const [processes, setProcesses] = useState([]);
    const [backupProcesses, setBackupProcesses] = useState([]);
    const processCountRef = useRef(0);
    const [showChart, setShowChart] = useState(false);

    function handleProcessChange(fieldId, value, processId) {
        setProcesses((prevProcesses) =>
            prevProcesses.map((process) =>
                process.id === processId
                    ? { ...process, [fieldId]: value }
                    : process,
            ),
        );
    }

    function addNewProcess() {
        const newProcess = {
            id: Date.now(),
            "process-number": processCountRef.current,
            "process-name": `P-${processCountRef.current + 1}`,
            "arrival-time": 0,
            "burst-time": 0,
            "turnaround-time": 0,
            "remaining-time": 0,
            "start-time": 0,
            "finish-time": 0,
            "waiting-time": 0,
            "priority": 0,
        };
        setProcesses((prevProcesses) => [...prevProcesses, newProcess]);
        processCountRef.current++;
    }

    async function submitProcesses() {
        const processedProcesses = processes.map((item) => {
            for (const key in item) {
                if (key === "process-name") continue;
                item[key] = Number(item[key]);
            }
            return item;
        });
        console.log(processedProcesses)
        try {
            setBackupProcesses([...processes]);

            const response = await axios.post(
                `${SERVER_URL}/send?algorithm=${algorithm}`,
                processedProcesses,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            setProcesses(response.data);
            console.log(response.data);
            setShowChart(true);
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

    function goBackToTable() {
        setProcesses(backupProcesses);
        setShowChart(false);
    }

    return !showChart ? (
        <>
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
                                    handleProcessChange(
                                        fieldId,
                                        value,
                                        process.id,
                                    )
                                }
                            />
                        ))}
                    </tbody>
                </table>
            </div>
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
        </>
    ) : (
        <>
            <Chart processes={processes} algorithm={algorithm} />
            <button className="btn submit-btn" onClick={goBackToTable}>
                Go back
            </button>
        </>
    );
}

export default Table;
