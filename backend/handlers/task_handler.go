package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"task-manager/models"
)

type TaskHandler struct {
	db *sql.DB
}

func NewTaskHandler(db *sql.DB) *TaskHandler {
	return &TaskHandler{db: db}
}

// GetTasks retrieves all tasks for the authenticated user
func (h *TaskHandler) GetTasks(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserIDFromContext(r)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	rows, err := h.db.Query(`
		SELECT t.id, t.title, t.description, t.status, t.priority, t.category,
		       t.due_date, t.created_at, t.updated_at, t.completed_at
		FROM tasks t
		WHERE t.is_deleted = false AND t.user_id = $1
		ORDER BY t.created_at DESC
	`, userID)
	if err != nil {
		http.Error(w, "Error fetching tasks", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		var dueDate, completedAt sql.NullTime
		err := rows.Scan(
			&task.ID, &task.Title, &task.Description, &task.Status,
			&task.Priority, &task.Category, &dueDate, &task.CreatedAt, &task.UpdatedAt,
			&completedAt,
		)
		if err != nil {
			http.Error(w, "Error scanning task", http.StatusInternalServerError)
			return
		}
		if dueDate.Valid {
			task.DueDate = &dueDate.Time
		}
		if completedAt.Valid {
			task.CompletedAt = &completedAt.Time
		}
		tasks = append(tasks, task)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

// CreateTask creates a new task for the authenticated user
func (h *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserIDFromContext(r)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	log.Println("Starting task creation...")
	
	var taskCreate models.TaskCreate
	if err := json.NewDecoder(r.Body).Decode(&taskCreate); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}
	log.Printf("Decoded task: %+v", taskCreate)

	// Validate required fields
	if taskCreate.Title == "" {
		log.Println("Title is missing")
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}

	// Validate title length
	if len(taskCreate.Title) < 3 {
		log.Printf("Title too short: %s", taskCreate.Title)
		http.Error(w, "Title must be at least 3 characters long", http.StatusBadRequest)
		return
	}

	// Set default values if not provided
	if taskCreate.Status == "" {
		taskCreate.Status = "pending"
	}
	if taskCreate.Priority == "" {
		taskCreate.Priority = "low"
	}

	// Validate status
	if taskCreate.Status != "" && !isValidStatus(taskCreate.Status) {
		log.Printf("Invalid status: %s", taskCreate.Status)
		http.Error(w, "Invalid status value", http.StatusBadRequest)
		return
	}
	if taskCreate.Priority != "" && !isValidPriority(taskCreate.Priority) {
		log.Printf("Invalid priority: %s", taskCreate.Priority)
		http.Error(w, "Invalid priority value", http.StatusBadRequest)
		return
	}

	log.Printf("Task with defaults: %+v", taskCreate)

	// Start transaction
	tx, err := h.db.Begin()
	if err != nil {
		log.Printf("Error starting transaction: %v", err)
		http.Error(w, "Error starting transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Insert task and get the ID
	var taskID int64
	query := `
		INSERT INTO tasks (title, description, status, priority, category, due_date, user_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`
	log.Printf("Executing query: %s with values: %v, %v, %v, %v, %v, %v, %v",
		query, taskCreate.Title, taskCreate.Description, taskCreate.Status,
		taskCreate.Priority, taskCreate.Category, taskCreate.DueDate, userID)
	
	err = tx.QueryRow(query,
		taskCreate.Title, taskCreate.Description, taskCreate.Status,
		taskCreate.Priority, taskCreate.Category, taskCreate.DueDate, userID).Scan(&taskID)
	if err != nil {
		log.Printf("Error creating task: %v", err)
		http.Error(w, "Error creating task: "+err.Error(), http.StatusInternalServerError)
		return
	}
	log.Printf("Task created with ID: %d", taskID)

	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v", err)
		http.Error(w, "Error committing transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("Task creation completed successfully")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int64{"id": taskID})
}

// Helper functions for validation
func isValidStatus(status string) bool {
	validStatuses := map[string]bool{
		"pending":     true,
		"in_progress": true,
		"completed":   true,
	}
	return validStatuses[status]
}

func isValidPriority(priority string) bool {
	validPriorities := map[string]bool{
		"low":    true,
		"medium": true,
		"high":   true,
	}
	return validPriorities[priority]
}

// UpdateTask updates an existing task for the authenticated user
func (h *TaskHandler) UpdateTask(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserIDFromContext(r)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	vars := mux.Vars(r)
	taskID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	var taskUpdate models.TaskUpdate
	if err := json.NewDecoder(r.Body).Decode(&taskUpdate); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Start transaction
	tx, err := h.db.Begin()
	if err != nil {
		http.Error(w, "Error starting transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Update task
	_, err = tx.Exec(`
		UPDATE tasks 
		SET title = COALESCE($1, title),
			description = COALESCE($2, description),
			status = COALESCE($3, status),
			priority = COALESCE($4, priority),
			due_date = $5,
			completed_at = CASE 
				WHEN $6 = 'completed' AND status != 'completed' THEN CURRENT_TIMESTAMP
				ELSE completed_at
			END,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $7 AND is_deleted = false AND user_id = $8
	`, taskUpdate.Title, taskUpdate.Description, taskUpdate.Status,
		taskUpdate.Priority, taskUpdate.DueDate, taskUpdate.Status, taskID, userID)
	if err != nil {
		http.Error(w, "Error updating task", http.StatusInternalServerError)
		return
	}

	if err = tx.Commit(); err != nil {
		http.Error(w, "Error committing transaction", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// DeleteTask soft deletes a task for the authenticated user
func (h *TaskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	userID, ok := GetUserIDFromContext(r)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	log.Printf("Starting task deletion...")
	
	vars := mux.Vars(r)
	taskID, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Printf("Invalid task ID format: %v", err)
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}
	log.Printf("Attempting to delete task with ID: %d", taskID)

	// Start transaction
	tx, err := h.db.Begin()
	if err != nil {
		log.Printf("Error starting transaction: %v", err)
		http.Error(w, "Error starting transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// First check if task exists and is not already deleted and belongs to user
	var exists bool
	err = tx.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM tasks 
			WHERE id = $1 AND is_deleted = false AND user_id = $2
		)
	`, taskID, userID).Scan(&exists)
	if err != nil {
		log.Printf("Error checking task existence: %v", err)
		http.Error(w, "Error checking task existence: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if !exists {
		log.Printf("Task not found or already deleted: %d", taskID)
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	// Soft delete the task
	result, err := tx.Exec(`
		UPDATE tasks 
		SET is_deleted = true,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $1 AND is_deleted = false AND user_id = $2
	`, taskID, userID)
	if err != nil {
		log.Printf("Error deleting task: %v", err)
		http.Error(w, "Error deleting task: "+err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Error checking affected rows: %v", err)
		http.Error(w, "Error checking affected rows: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		log.Printf("No rows affected when deleting task: %d", taskID)
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v", err)
		http.Error(w, "Error committing transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("Successfully deleted task: %d", taskID)
	w.WriteHeader(http.StatusNoContent)
} 