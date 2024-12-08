package algorithms

import (
	"api/pkg/models"
	"sort"
)

func FirstComesFirstServed(processes *[]models.FirstComes) {
	sort.SliceStable(*processes, func(i, j int) bool {
		if (*processes)[i].ArrivalTime != (*processes)[j].ArrivalTime {
			return (*processes)[i].ArrivalTime < (*processes)[j].ArrivalTime
		}
		return (*processes)[i].ProcessNum < (*processes)[j].ProcessNum
	})

	currentTime := 0

	for i := range *processes {
		process := &(*processes)[i]

		if currentTime < process.ArrivalTime {
			currentTime = process.ArrivalTime
		}

		process.StartTime = currentTime
		process.FinishTime = currentTime + process.BurstTime

		process.WaitingTime = process.StartTime - process.ArrivalTime
		process.TurnaroundTime = process.BurstTime + process.WaitingTime

		currentTime += process.BurstTime
	}
}
