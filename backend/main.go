package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"task-manager/database"
	"task-manager/handlers"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Run migrations
	if err := database.RunMigrations(db); err != nil {
		log.Fatal(err)
	}

	// Initialize handlers
	taskHandler := handlers.NewTaskHandler(db)

	// Initialize router
	router := mux.NewRouter()

	// Add middleware
	router.Use(loggingMiddleware)

	// Auth routes
	router.HandleFunc("/api/register", handlers.RegisterHandler(db)).Methods("POST")
	router.HandleFunc("/api/login", handlers.LoginHandler(db)).Methods("POST")

	// Protected task routes
	taskRouter := router.PathPrefix("/api/tasks").Subrouter()
	taskRouter.Use(handlers.AuthMiddleware)
	taskRouter.HandleFunc("", taskHandler.GetTasks).Methods("GET")
	taskRouter.HandleFunc("", taskHandler.CreateTask).Methods("POST")
	taskRouter.HandleFunc("/{id}", taskHandler.UpdateTask).Methods("PUT")
	taskRouter.HandleFunc("/{id}", taskHandler.DeleteTask).Methods("DELETE")

	// Category routes
	router.HandleFunc("/api/categories", getCategories).Methods("GET")
	router.HandleFunc("/api/categories", createCategory).Methods("POST")

	// Configure CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, c.Handler(router)))
}

// loggingMiddleware logs all requests
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf(
			"%s %s %s",
			r.Method,
			r.RequestURI,
			time.Since(start),
		)
	})
}

// Task represents a task in the system
type Task struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	DueDate     time.Time `json:"due_date"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Category represents a task category
type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// Handler functions will be implemented in separate files
func getCategories(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement
}

func createCategory(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement
} 