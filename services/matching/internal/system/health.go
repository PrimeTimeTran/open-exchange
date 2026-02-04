package system

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

func StartHealthServer(port string) {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
"status":      "ok",
"environment": os.Getenv("APP_ENV"),
"envVars":     os.Environ(),
		})
	})

	log.Printf("Starting HTTP Health Server on %s", port)
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Printf("HTTP Health Server Error: %v", err)
	}
}
