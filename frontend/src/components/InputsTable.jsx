import { useRef, useState } from "react";
import "../App.css";
import Chart from "./Chart";
import axios from "axios";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

function ConfirmDialog({ showText, content, showBtnVariant, confirmText, confirmVariant, confirmEventHandler, isDisabled }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button disabled={isDisabled} variant={showBtnVariant} className="text-base font-semibold">{showText}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-extrabold text-black/85">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base text-black/60 font-semibold">
                        {content}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-transparent hover:bg-transparent w-fit p-0">
                        <Button variant={confirmVariant} onClick={confirmEventHandler} className="text-base font-semibold ml-2">{confirmText}</Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
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
    "round-robin": [
        { id: "arrival-time", label: "Arrival time", type: "numeric" },
        { id: "burst-time", label: "Burst time", type: "numeric" },
    ],
};

const SERVER_URL = "http://localhost:8080";


function ProcessForm({ algorithm, process, onProcessChange }) {
    return (
        <>
            <TableRow>
                <TableCell key={process["process-name"]}>{process["process-name"]}</TableCell>
                {fields[algorithm].map((field) => (
                    < TableCell key={field.id} >
                        <Input
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
                    </TableCell>
                ))
                }
            </TableRow >
        </>
    );
}

function InputsTable({ algorithm, setIsExecuted, timeQuantum }) {
    const [processes, setProcesses] = useState([]);
    const [backupProcesses, setBackupProcesses] = useState([]);
    const processCountRef = useRef(0);
    const [isChartShown, setIsChartShown] = useState(false);

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
                `${SERVER_URL}/send?algorithm=${algorithm}&time-quantum=${timeQuantum}`,
                processedProcesses,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            setProcesses(response.data);
            console.log(response.data);
            setIsChartShown(true);
            setIsExecuted(true);
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
    function clearAllProcesses() {
        setProcesses([]);
        processCountRef.current = 0;
    }

    function goBackToTable() {
        setProcesses(backupProcesses);
        setIsChartShown(false);
        setIsExecuted(false);
    }
    return !isChartShown ? (
        <>
            <div>
                <div className="mb-2 flex gap-4">
                    <Button variant='outline' onClick={addNewProcess} className="text-base font-semibold">
                        Add a process
                    </Button>
                    <Button variant='destructive' onClick={deleteProcess} className="text-base font-semibold" disabled={processes.length === 0}>
                        Delete the last process
                    </Button>
                    <ConfirmDialog showBtnVariant="destructive" showText="Clear all processes" confirmVariant="destructive" confirmEventHandler={clearAllProcesses}
                        content="Are you sure that you wanna clear all processes"
                        confirmText="Clear all processes" isDisabled={processes.length === 0}
                    />
                    <Button onClick={submitProcesses} className="text-base font-semibold" disabled={processes.length === 0}>
                        Execute
                    </Button>
                </div >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Process</TableHead>
                            {fields[algorithm].map((field) => (
                                <TableHead key={field.id}>{field.label}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
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
                    </TableBody>
                </Table>
            </div>
        </>
    ) : (
        <>
            <Chart processes={processes} algorithm={algorithm} numProcesses={processCountRef.current} />
            <Button variant="destructive" className='font-semibold text-base max-w-fit mx-auto' onClick={goBackToTable}>
                Go back
            </Button>
        </>
    );
}

export default InputsTable;
