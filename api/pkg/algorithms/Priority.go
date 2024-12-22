package algorithms

import (
	"api/pkg/models"
	"sort"
)

func isDone(processes []models.Priority) bool {
	for _, p := range processes {
		if p.RemainingTime > 0 {
			return false
		}
	}
	return true
}

func PriorityNonPreemtive(processes *[]models.Priority) {
	sort.SliceStable(*processes, func(i, j int) bool {
		if (*processes)[i].Priority != (*processes)[j].Priority {
			return (*processes)[i].Priority < (*processes)[j].Priority
		}
		return (*processes)[i].ProcessNum > (*processes)[j].ProcessNum
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

func PreemptivePriority(processes *[]models.Priority) []models.Priority {
	for i := range *processes {
		(*processes)[i].RemainingTime = (*processes)[i].BurstTime
	}

	currentTime := 0
	var executions []models.Priority
	var currentProcess *models.Priority

	lastOccurrences := make(map[int]int)

	for !isDone(*processes) {
		availableProcesses := []*models.Priority{}
		for i := range *processes {
			if (*processes)[i].ArrivalTime <= currentTime && (*processes)[i].RemainingTime > 0 {
				availableProcesses = append(availableProcesses, &(*processes)[i])
			}
		}

		if len(availableProcesses) == 0 {
			currentTime++
			continue
		}

		// Sort available processes by priority / arrival time
		sort.SliceStable(availableProcesses, func(a, b int) bool {
			if availableProcesses[a].Priority != availableProcesses[b].Priority {
				return availableProcesses[a].Priority < availableProcesses[b].Priority
			}
			return availableProcesses[a].ArrivalTime < availableProcesses[b].ArrivalTime
		})

		nextProcess := availableProcesses[0]

		if currentProcess != nextProcess {
			if currentProcess != nil && currentProcess.RemainingTime > 0 {
				// Record finish time for the current process before switching
				currentProcess.FinishTime = currentTime
				executions = append(executions, *currentProcess)
			}
			nextProcess.StartTime = currentTime
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
