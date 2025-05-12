package models

import (
	"time"
)

// Task represents a task in the system
type Task struct {
	ID          int        `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
	Category    string     `json:"category"`
	DueDate     *time.Time `json:"due_date,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}

// TaskCreate represents the data needed to create a new task
type TaskCreate struct {
	Title       string     `json:"title" validate:"required,min=3,max=255"`
	Description string     `json:"description"`
	Status      string     `json:"status" validate:"required,oneof=pending in_progress completed"`
	Priority    string     `json:"priority" validate:"required,oneof=low medium high"`
	Category    string     `json:"category" validate:"required,oneof=Work Personal Shopping Health Education"`
	DueDate     *time.Time `json:"due_date"`
}

// TaskUpdate represents the data needed to update a task
type TaskUpdate struct {
	Title       string     `json:"title" validate:"omitempty,min=3,max=255"`
	Description string     `json:"description"`
	Status      string     `json:"status" validate:"omitempty,oneof=pending in_progress completed"`
	Priority    string     `json:"priority" validate:"omitempty,oneof=low medium high"`
	Category    string     `json:"category" validate:"omitempty,oneof=Work Personal Shopping Health Education"`
	DueDate     *time.Time `json:"due_date"`
}

// ValidateStatus checks if the status is valid
func (t *Task) ValidateStatus() bool {
	validStatuses := map[string]bool{
		"pending":     true,
		"in_progress": true,
		"completed":   true,
	}
	return validStatuses[t.Status]
}

// ValidatePriority checks if the priority is valid
func (t *Task) ValidatePriority() bool {
	validPriorities := map[string]bool{
		"low":    true,
		"medium": true,
		"high":   true,
	}
	return validPriorities[t.Priority]
} 