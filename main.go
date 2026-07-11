package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = fmt.Fprint(w, `{"status":"ok"}`)
	})

	staticDir := "dist"
	if _, err := os.Stat(staticDir); err != nil {
		staticDir = "."
	}

	fs := http.FileServer(http.Dir(staticDir))
	http.Handle("/", http.StripPrefix("/", fs))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("server listening on http://0.0.0.0:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
