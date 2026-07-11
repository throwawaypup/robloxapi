package main

import (
    "fmt"
    "log"
    "net/http"
)

func main() {
    http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        _, _ = fmt.Fprint(w, `{"status":"ok"}`)
    })

    fs := http.FileServer(http.Dir("dist"))
    http.Handle("/", http.StripPrefix("/", fs))

    log.Println("server listening on http://127.0.0.1:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
