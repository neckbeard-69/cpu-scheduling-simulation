package main

import (
	"api/pkg/utils"
	"log"
	"net/http"
)

func main() {
	const PORT string = ":8080"
	router := http.NewServeMux()
	utils.RegisterRoutes(router)
	server := &http.Server{
		Addr:    PORT,
		Handler: router,
	}
	log.Printf("Serving on localhost%s ...\n", PORT)
	if err := server.ListenAndServe(); err != nil {
		log.Fatal("Error while trying to server...")
	}
}
