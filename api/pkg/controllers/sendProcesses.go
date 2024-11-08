package controllers

import (
	"api/pkg/algorithms"
	"api/pkg/middleware"
	"api/pkg/models"
	"encoding/json"
	"log"
	"net/http"
)

func newAlgorithmDataSlice(algorithm string) (interface{}, error) {
	switch algorithm {
	case "fcfs":
		return &[]models.FirstComes{}, nil
	case "sjf-non-preemtive":
		return &[]models.ShortestJob{}, nil
	case "sjf-preemtive":
		return &[]models.ShortestJob{}, nil
	default:
		return nil, http.ErrNotSupported
	}
}

func SendProcesses(w http.ResponseWriter, r *http.Request) {
	middleware.EnableCors(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	algorithm := r.URL.Query().Get("algorithm")
	data, err := newAlgorithmDataSlice(algorithm)
	if err != nil {
		http.Error(w, "Unsupported algorithm", http.StatusBadRequest)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		log.Printf("Error decoding the data: %v", err)
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	switch algorithm {
	case "fcfs":
		algorithms.FirstComesFirstServed(data.(*[]models.FirstComes))
	case "sjf-non-preemtive":
		algorithms.NonPreemptiveSJF(data.(*[]models.ShortestJob))
	case "sjf-preemtive":
		data = algorithms.ShortestJobFirstPreemptive(data.(*[]models.ShortestJob))
	}

	log.Println(data)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(&data); err != nil {
		log.Printf("Error encoding response data: %v", err)
		http.Error(w, "Failed to encode response data", http.StatusInternalServerError)
	}
}
