package algorithms

import (
	"api/pkg/models"
	"sort"
)

func FirstComesFirstServed(processes *[]models.FirstComesPro) {
	// Sort processes by arrival time (and by process number in case of tie)
	sort.SliceStable(*processes, func(i, j int) bool {
		return (*processes)[i].ArrivalTime < (*processes)[j].ArrivalTime ||
			((*processes)[i].ArrivalTime == (*processes)[j].ArrivalTime &&
				(*processes)[i].ProcessNum < (*processes)[j].ProcessNum)
	})

	currentTime := 0

	for i := range *processes {
		process := &(*processes)[i]

		// If the process arrives after the current time, move current time to arrival time
		if currentTime < process.ArrivalTime {
			currentTime = process.ArrivalTime
		}

		// Set start and finish times for the process
		process.StartTime = currentTime
		process.FinishTime = currentTime + process.BurstTime

		// Calculate waiting and turnaround times
		process.WaitingTime = process.StartTime - process.ArrivalTime
		process.TurnaroundTime = process.FinishTime - process.ArrivalTime

		// Move current time forward by the burst time
		currentTime += process.BurstTime
	}
}
