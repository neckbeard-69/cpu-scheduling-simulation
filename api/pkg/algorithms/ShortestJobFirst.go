package algorithms

import (
	"api/pkg/models"
	"log"
	"sort"
)

func sortForPreemtive(processes *[]models.ShortestJob, currentTime int) {
	sort.SliceStable(*processes, func(a, b int) bool {
		// Prioritize processes that have arrived by the current time
		if (*processes)[a].ArrivalTime <= currentTime && (*processes)[b].ArrivalTime > currentTime {
			return true
		}
		if (*processes)[a].ArrivalTime > currentTime && (*processes)[b].ArrivalTime <= currentTime {
			return false
		}
		// If both processes have arrived, or both have not arrived, sort by remaining time
		if (*processes)[a].RemainingTime != (*processes)[b].RemainingTime {
			return (*processes)[a].RemainingTime < (*processes)[b].RemainingTime
		}
		// If remaining time is the same, sort by arrival time
		if (*processes)[a].ArrivalTime != (*processes)[b].ArrivalTime {
			return (*processes)[a].ArrivalTime < (*processes)[b].ArrivalTime
		}
		// If both remaining time and arrival time are the same, sort by process number
		return (*processes)[a].ProcessNum < (*processes)[b].ProcessNum
	})

}

func getLeastRemainingTime(currentProcess *models.ShortestJob, processes []models.ShortestJob) *models.ShortestJob {
	process := currentProcess

	for i := range processes {
		if processes[i].RemainingTime == 0 {
			continue
		}
		if processes[i].RemainingTime < process.RemainingTime {
			process = &processes[i]
		}
	}
	return process
}

func isDone(processes []models.ShortestJob) bool {
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
			// Prioritize processes that have arrived by the current time
			if (*processes)[i+a].ArrivalTime <= currentTime && (*processes)[i+b].ArrivalTime > currentTime {
				return true
			}
			if (*processes)[i+a].ArrivalTime > currentTime && (*processes)[i+b].ArrivalTime <= currentTime {
				return false
			}
			// If both processes have arrived, or both have not arrived, sort by burst time
			if (*processes)[i+a].BurstTime != (*processes)[i+b].BurstTime {
				return (*processes)[i+a].BurstTime < (*processes)[i+b].BurstTime
			}
			// If burst time is the same, sort by arrival time
			if (*processes)[i+a].ArrivalTime != (*processes)[i+b].ArrivalTime {
				return (*processes)[i+a].ArrivalTime < (*processes)[i+b].ArrivalTime
			}
			// If both burst time and arrival time are the same, sort by process number
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
	log.Printf("init %v", processes)
	currentTime := 0
	sortForPreemtive(processes, currentTime)
	var executions []models.ShortestJob
	var currentProcess *models.ShortestJob

	lastOccurrences := make(map[int]int) // map[processNum]index

	for !isDone(*processes) {
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

		// If the process is changing or it's a new start, record the start time
		if currentProcess != nextProcess {
			// If there's an ongoing process, finalize its finish time before switching
			if currentProcess != nil && currentProcess.RemainingTime > 0 {
				currentProcess.FinishTime = currentTime
				executions = append(executions, *currentProcess)
			}
			// Start or resume the next process
			nextProcess.StartTime = currentTime
			currentProcess = nextProcess
		}

		currentProcess.RemainingTime--
		currentTime++

		if currentProcess.RemainingTime == 0 {
			currentProcess.FinishTime = currentTime
			executions = append(executions, *currentProcess)
			lastOccurrences[currentProcess.ProcessNum] = len(executions) - 1
			currentProcess = nil // Reset to find the next process in the next loop iteration
		}
	}
	log.Printf("executions: %v", executions)

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

	log.Printf("executions with turnaround and waiting time: %v", executions)

	return executions
}
