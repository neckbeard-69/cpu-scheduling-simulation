package algorithms

import (
	"api/pkg/models"
	"sort"
)

func isDoneSJF(processes []models.ShortestJob) bool {
	for _, p := range processes {
		if p.RemainingTime > 0 {
			return false
		}
	}
	return true
}

func NonPreemptiveSJF(processes *[]models.ShortestJob) {
	currentTime := 0

	for i := range *processes {
		sort.SliceStable((*processes)[i:], func(a, b int) bool {
			if (*processes)[i+a].ArrivalTime <= currentTime && (*processes)[i+b].ArrivalTime > currentTime {
				return true
			}
			if (*processes)[i+a].ArrivalTime > currentTime && (*processes)[i+b].ArrivalTime <= currentTime {
				return false
			}
			if (*processes)[i+a].BurstTime != (*processes)[i+b].BurstTime {
				return (*processes)[i+a].BurstTime < (*processes)[i+b].BurstTime
			}
			if (*processes)[i+a].ArrivalTime != (*processes)[i+b].ArrivalTime {
				return (*processes)[i+a].ArrivalTime < (*processes)[i+b].ArrivalTime
			}
			return (*processes)[i+a].ProcessNum < (*processes)[i+b].ProcessNum
		})

		process := &(*processes)[i]

		if currentTime < process.ArrivalTime {
			currentTime = process.ArrivalTime
		}

		process.StartTime = currentTime
		process.FinishTime = currentTime + process.BurstTime

		process.WaitingTime = process.StartTime - process.ArrivalTime
		process.TurnaroundTime = process.BurstTime + process.WaitingTime

		currentTime += process.BurstTime

		process.RemainingTime = 0
	}
}

func ShortestJobFirstPreemptive(processes *[]models.ShortestJob) []models.ShortestJob {
	for i := range *processes {
		(*processes)[i].RemainingTime = (*processes)[i].BurstTime
	}

	currentTime := 0
	var executions []models.ShortestJob
	var currentProcess *models.ShortestJob

	lastOccurrences := make(map[int]int)

	for !isDoneSJF(*processes) {
		availableProcesses := []*models.ShortestJob{}
		for i := range *processes {
			if (*processes)[i].ArrivalTime <= currentTime && (*processes)[i].RemainingTime > 0 {
				availableProcesses = append(availableProcesses, &(*processes)[i])
			}
		}

		if len(availableProcesses) == 0 {
			currentTime++
			continue
		}

		sort.SliceStable(availableProcesses, func(a, b int) bool {
			return availableProcesses[a].RemainingTime < availableProcesses[b].RemainingTime
		})

		nextProcess := availableProcesses[0]

		if currentProcess != nextProcess {
			if currentProcess != nil && currentProcess.RemainingTime > 0 {
				currentProcess.FinishTime = currentTime
				executions = append(executions, *currentProcess)
			}
			if nextProcess.RemainingTime == nextProcess.BurstTime {
				nextProcess.StartTime = currentTime
			}
			currentProcess = nextProcess
		}

		currentProcess.RemainingTime--
		currentTime++

		if currentProcess.RemainingTime == 0 {
			currentProcess.FinishTime = currentTime
			executions = append(executions, *currentProcess)
			lastOccurrences[currentProcess.ProcessNum] = len(executions) - 1
			currentProcess = nil
		}
	}

	for i := range executions {
		process := &executions[i]
		if lastIndex, exists := lastOccurrences[process.ProcessNum]; exists && lastIndex == i {
			process.TurnaroundTime = process.FinishTime - process.ArrivalTime
			process.WaitingTime = process.TurnaroundTime - process.BurstTime
			if process.WaitingTime < 0 {
				process.WaitingTime = 0
			}
		}
	}

	return executions
}
