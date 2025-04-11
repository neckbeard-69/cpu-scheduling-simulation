package algorithms

import (
	"api/pkg/models"
	"log"
	"sort"
)

func isDoneRR(processes []models.RoundRobin) bool {
	for _, p := range processes {
		if p.RemainingTime > 0 {
			return false
		}
	}
	return true
}

func RoundRobin(processes *[]models.RoundRobin, timeQuantum int) []models.RoundRobin {
	for i := range *processes {
		(*processes)[i].RemainingTime = (*processes)[i].BurstTime
	}

	currentTime := 0
	var executions []models.RoundRobin

	sort.SliceStable(*processes, func(i, j int) bool {
		if (*processes)[i].ArrivalTime != (*processes)[j].ArrivalTime {
			return (*processes)[i].ArrivalTime < (*processes)[j].ArrivalTime
		}
		return (*processes)[i].ProcessNum < (*processes)[j].ProcessNum
	})

	queue := make([]*models.RoundRobin, 0)
	processed := make(map[int]bool)

	for !isDoneRR(*processes) {
		for i := range *processes {
			p := &(*processes)[i]
			if p.ArrivalTime <= currentTime && p.RemainingTime > 0 && !processed[i] {
				queue = append(queue, p)
				processed[i] = true
				log.Printf("Adding process %s to queue", p.ProcessName)
			}
		}

		if len(queue) == 0 {
			currentTime++
			continue
		}

		currentProcess := queue[0]
		queue = queue[1:]

		log.Printf("Executing process %s", currentProcess.ProcessName)

		execTime := min(timeQuantum, currentProcess.RemainingTime)

		executed := *currentProcess
		executed.StartTime = currentTime
		executed.FinishTime = currentTime + execTime
		executions = append(executions, executed)

		currentTime += execTime
		currentProcess.RemainingTime -= execTime

		for i := range *processes {
			p := &(*processes)[i]
			if p.ArrivalTime <= currentTime && p.RemainingTime > 0 && !processed[i] {
				queue = append(queue, p)
				processed[i] = true
				log.Printf("Adding newly arrived process %s to queue", p.ProcessName)
			}
		}

		// If the process is not finished, add it back to the end of the queue
		if currentProcess.RemainingTime > 0 {
			queue = append(queue, currentProcess)
			log.Printf("Process %s is not finished. Moving to end of queue", currentProcess.ProcessName)
		} else {
			log.Printf("Process %s finished execution", currentProcess.ProcessName)
		}
	}

	// Calculate waiting and turnaround times after all processes are finished
	for i := range executions {
		process := &executions[i]
		process.TurnaroundTime = process.FinishTime - process.ArrivalTime
		process.WaitingTime = process.TurnaroundTime - process.BurstTime
		if process.WaitingTime < 0 {
			process.WaitingTime = 0
		}
	}

	return executions
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
