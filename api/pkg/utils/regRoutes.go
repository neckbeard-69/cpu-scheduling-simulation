package utils

import (
	"api/pkg/controllers"
	"net/http"
)

func RegisterRoutes(r *http.ServeMux) {
	r.HandleFunc("/send", controllers.FetchProcesses)
}
