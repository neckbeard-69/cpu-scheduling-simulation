package controllers

import (
	"api/pkg/algorithms"
	"api/pkg/middleware"
	"api/pkg/models"
	"encoding/json"
	"log"
	"net/http"
)

func SendProcesses(w http.ResponseWriter, r *http.Request) {
	middleware.EnableCors(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	var data []models.FirstComesPro
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Printf("Error decoding the data: %v", err)
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	algorithms.FirstComesFirstServed(&data)
	log.Println(data)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding response data: %v", err)
		http.Error(w, "Failed to encode response data", http.StatusInternalServerError)
	}
}
