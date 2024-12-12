import { useState } from "react";
import "./App.css";
import InputsTable from "./components/InputsTable";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const algorithms = [
    { value: "fcfs", text: "First Comes First Served" },
    { value: "sjf-non-preemtive", text: "Shortest Job First (non-preemtive)" },
    { value: "sjf-preemtive", text: "Shortest Job First (preemtive)" },
    { value: "priority-non-preemtive", text: "Priority (non-preemtive)" },
    { value: "priority-preemtive", text: "Priority (preemtive)" },
];
function App() {
    const [algorithm, setAlgorithm] = useState("fcfs");
    const [isExecuted, setIsExecuted] = useState(false);
    return (
        <div className="flex flex-col gap-4 ">
            {!isExecuted && (<div className="flex items-center gap-3">
                <label htmlFor="algo">
                    Algorithm:
                </label>
                <Select
                    id="algo"
                    value={algorithm}
                    onValueChange={setAlgorithm}
                >
                    <SelectTrigger className="w-[280px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {algorithms.map((item) => {
                            return (
                                <SelectItem
                                    key={item.text + item.value}
                                    value={item.value}
                                >
                                    {item.text}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>)}
            <InputsTable algorithm={algorithm} setIsExecuted={setIsExecuted} />
        </div>
    );
}

export default App;
