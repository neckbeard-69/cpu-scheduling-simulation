package models

type FirstComes struct {
	ProcessName    string `json:"process-name"`
	ArrivalTime    int    `json:"arrival-time"`
	BurstTime      int    `json:"burst-time"`
	TurnaroundTime int    `json:"turnaround-time"`
	RemainingTime  int    `json:"remaining-time"`
	StartTime      int    `json:"start-time"`
	FinishTime     int    `json:"finish-time"`
	WaitingTime    int    `json:"waiting-time"`
	ProcessNum     int    `json:"process-number"`
}

type ShortestJob struct {
	ProcessName    string `json:"process-name"`
	ArrivalTime    int    `json:"arrival-time"`
	BurstTime      int    `json:"burst-time"`
	TurnaroundTime int    `json:"turnaround-time"`
	RemainingTime  int    `json:"remaining-time"`
	StartTime      int    `json:"start-time"`
	FinishTime     int    `json:"finish-time"`
	WaitingTime    int    `json:"waiting-time"`
	ProcessNum     int    `json:"process-number"`
}

type Priority struct {
	ProcessName    string `json:"process-name"`
	ArrivalTime    int    `json:"arrival-time"`
	BurstTime      int    `json:"burst-time"`
	TurnaroundTime int    `json:"turnaround-time"`
	RemainingTime  int    `json:"remaining-time"`
	StartTime      int    `json:"start-time"`
	FinishTime     int    `json:"finish-time"`
	WaitingTime    int    `json:"waiting-time"`
	ProcessNum     int    `json:"process-number"`
	Priority       int    `json:"priority"`
}
