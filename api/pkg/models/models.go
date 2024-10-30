package models

type FirstComesPro struct {
	ArrivalTime    int    `json:"arrival-time"`
	BurstTime      int    `json:"burst-time"`
	TurnaroundTime int    `json:"turnaround-time"`
	RemainingTime  int    `json:"remaining-time"`
	StartTime      int    `json:"start-time"`
	FinishTime     int    `json:"finish-time"`
	WaitingTime    int    `json:"waiting-time"`
	ProcessNum     int    `json:"process-number"`
	ProcessName    string `json:"process-name"`
}
