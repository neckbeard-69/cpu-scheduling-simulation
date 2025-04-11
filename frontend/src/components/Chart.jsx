import { useRef, useState } from "react";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { InfoIcon } from "lucide-react";

function calcAvg(arr, type, numProcesses) {
    let sum = 0;
    switch (type) {
        case "turnaround":
            arr.forEach(val => {
                sum += val["turnaround-time"];
            })
            break;
        case "burst":
            arr.forEach(val => {
                sum += val["burst-time"];
            })
            break;
        case "wait":
            arr.forEach(val => {
                sum += val["waiting-time"];
            })
            break;
        default:
            throw new Error("invalid type");
    }

    return sum / numProcesses;
}
export default function Chart({ processes, algorithm, numProcesses }) {
    const tableHeadings = [
        "Process",
        "A.T",
        "B.T",
        "Start time",
        "Finish time",
        "Waiting time",
        "Turnaround time",
    ];
    if (algorithm.includes("priority")) tableHeadings.push("Priority")


    const modalRef = useRef(null);
    const [changeColors, setChangeColors] = useState(false);
    const [isBlackWhite, setIsBlackWhite] = useState(false);
    function calculateWidth(totalTime, currentBurst) {
        return (currentBurst / totalTime) * 100;
    }

    function getRandomBackgroundColor() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * 50) + 50;
        const lightness = Math.floor(Math.random() * 40) + 30;

        const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        const color = lightness > 50 ? "#000000" : "#ffffff";

        return { backgroundColor, color };
    }

    const totalFinishTime = processes.length
        ? processes[processes.length - 1]["finish-time"]
        : 0;

    const initialWaitingWidth =
        processes.length && processes[0]["start-time"] > 0
            ? calculateWidth(totalFinishTime, processes[0]["start-time"])
            : 0;

    const openDialog = () => {
        modalRef.current.showModal();
    };

    const closeDialog = () => {
        modalRef.current.close();
    };

    // Find the last occurrence of each process
    const lastOccurrences = processes.reduce((acc, process, index) => {
        acc[process["process-name"]] = index;
        return acc;
    }, {});

    return (
        <>
            <div className="flex gap-5 w-fit mx-auto items-center">
                <Button onClick={openDialog} className="font-semibold text-base max-w-fit mx-auto" >
                    Show Info
                </Button>
                <Button disabled={isBlackWhite} onClick={() => setChangeColors((prev) => !prev)} className="font-semibold text-base max-w-fit mx-auto" variant="outline">
                    Change chart colors
                </Button>
                <HoverCard>
                    <div className="items-top flex space-x-2">
                        <Checkbox id="black-white" onCheckedChange={setIsBlackWhite} />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="black-white"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Monochrome
                            </label>
                        </div>
                    </div>
                    <HoverCardTrigger>
                        <Button variant="icone" className="p-0 translate-x-[-13px]">
                            <InfoIcon />
                        </Button>
                    </HoverCardTrigger>
                    <HoverCardContent>
                        <p className="text-base text-foreground">
                            Sets a black background and white text for all executions
                        </p>
                    </HoverCardContent>
                </HoverCard>
            </div >
            <dialog ref={modalRef} className="w-auto m-4 rounded-lg p-4">
                <Table className='text-center text-lg'>
                    <TableHeader>
                        <TableRow>
                            {tableHeadings.map((heading) => {
                                return <th key={heading}>{heading}</th>
                            })
                            }
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {processes
                            .filter((process, index) => lastOccurrences[process["process-name"]] === index) // Filter to show only the last occurrence
                            .map((process) => (
                                <TableRow key={process["process-name"]}>
                                    <TableCell >{process["process-name"]}</TableCell>
                                    <TableCell>{process["arrival-time"]}</TableCell>
                                    <TableCell>{process["burst-time"]}</TableCell>
                                    <TableCell> {algorithm !== "sjf-preemtive" ? process["start-time"] : ""}</TableCell>
                                    <TableCell> {algorithm !== "sjf-preemtive" ? process["finish-time"] : ""}</TableCell>
                                    <TableCell>{process["waiting-time"]}</TableCell>
                                    <TableCell>{process["turnaround-time"]}</TableCell>
                                    {algorithm.includes("priority") &&
                                        <TableCell>{process["priority"]}</TableCell>}
                                </TableRow>
                            ))}
                        <TableRow>
                            <TableCell colSpan="2"></TableCell>
                            <TableCell style={{ fontWeight: 600 }}>Avg: {calcAvg(processes, "burst", numProcesses)}</TableCell>
                            <TableCell colSpan="2"></TableCell>
                            <TableCell style={{ fontWeight: 600 }}>Avg: {calcAvg(processes, "wait", numProcesses)}</TableCell>
                            <TableCell style={{ fontWeight: 600 }}>Avg: {calcAvg(processes, "turnaround", numProcesses)}</TableCell>
                            {algorithm.includes("priority") &&
                                <TableCell></TableCell>}
                        </TableRow>
                    </TableBody>
                </Table>
                <Button
                    variant='destructive'
                    onClick={closeDialog}
                    className="font-semibold text-base"
                >
                    Close
                </Button>
            </dialog>
            <div className="chart">
                {initialWaitingWidth > 0 && (
                    <div
                        className="bg-black/10 font-semibold"
                        style={{
                            width: `${initialWaitingWidth}%`,
                        }}
                    >
                        <span>Waiting</span>
                    </div>
                )}
                {processes.map((item, index) => {
                    const { backgroundColor, color } = isBlackWhite
                        ? { backgroundColor: "black", color: "white" }
                        : getRandomBackgroundColor();
                    const burstWidth = totalFinishTime
                        ? `${calculateWidth(totalFinishTime, item["finish-time"] - item["start-time"])}%`
                        : "0%";
                    const waitingWidth =
                        index !== processes.length - 1 &&
                            processes[index + 1]["start-time"] !==
                            item["finish-time"]
                            ? `${calculateWidth(totalFinishTime, processes[index + 1]["start-time"] - item["finish-time"])}%`
                            : "0%";

                    return (
                        <>
                            {item["start-time"] - item["finish-time"] !== 0 &&
                                <div
                                    className="font-bold text-lg"
                                    style={{
                                        width: burstWidth,
                                        backgroundColor,
                                        color,
                                        minWidth: "fit-content",
                                    }}
                                    data-start-time={
                                        index === 0 && item["start-time"] !== 0
                                            ? item["start-time"]
                                            : ""
                                    }
                                    data-finish-time={item["finish-time"]}
                                >
                                    <span>{item["process-name"]}</span>
                                </div>
                            }
                            {waitingWidth !== "0%" && (
                                <div
                                    className="bg-black/10 font-semibold"
                                    style={{
                                        width: waitingWidth,
                                    }}
                                    data-finish-time={
                                        processes[index + 1]["start-time"]
                                    }
                                >
                                    <span>Waiting</span>
                                </div>
                            )}
                        </>
                    );
                })}
            </div>
        </>
    );
}
