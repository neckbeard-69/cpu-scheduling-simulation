import { useRef } from "react";

export default function Chart({ processes, algorithm }) {
    const tableHeadings = [
        "Process",
        "A.T",
        "B.T",
        "Start time",
        "Finish time",
        "Waiting time",
        "Turnaround time",
    ];

    const modalRef = useRef(null);

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
            <button onClick={openDialog} className="btn add-btn">
                Show Info
            </button>
            <dialog ref={modalRef}>
                <table>
                    <thead>
                        <tr>
                            {tableHeadings.map((heading) => {
                                if (( heading === "Finish time" && algorithm === "sjf-preemtive") || (heading === "Start time") && algorithm === "sjf-preemtive") return
                                return <th key={heading}>{heading}</th>
                            }) 
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {processes
                            .filter((process, index) => lastOccurrences[process["process-name"]] === index) // Filter to show only the last occurrence
                            .map((process) => (
                                <tr key={process["process-name"]}>
                                    <td>{process["process-name"]}</td>
                                    <td>{process["arrival-time"]}</td>
                                    <td>{process["burst-time"]}</td>
                                    {algorithm !== "sjf-preemtive" && <td>{process["start-time"]}</td> }
                                    {algorithm !== "sjf-preemtive" && <td>{process["finish-time"]}</td> }
                                    <td>{process["waiting-time"]}</td>
                                    <td>{process["turnaround-time"]}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                <button
                    onClick={closeDialog}
                    className="btn delete-btn"
                    style={{ marginTop: "10px" }}
                >
                    Close
                </button>
            </dialog>
            <div className="chart">
                {initialWaitingWidth > 0 && (
                    <div
                        style={{
                            width: `${initialWaitingWidth}%`,
                            backgroundColor: "transparent",
                        }}
                    >
                        <span>Waiting</span>
                    </div>
                )}
                {processes.map((item, index) => {
                    const { backgroundColor, color } =
                        getRandomBackgroundColor();
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
                            <div
                                style={{
                                    width: burstWidth,
                                    backgroundColor,
                                    color,
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
                            {waitingWidth !== "0%" && (
                                <div
                                    style={{
                                        width: waitingWidth,
                                        backgroundColor: "transparent",
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
