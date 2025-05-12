package models

import "time"

// Category represents a task category
type Category struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// CategoryCreate represents the data needed to create a new category
type CategoryCreate struct {
	Name        string `json:"name" validate:"required,min=2,max=100"`
	Description string `json:"description"`
}

// CategoryUpdate represents the data needed to update a category
type CategoryUpdate struct {
	Name        string `json:"name" validate:"omitempty,min=2,max=100"`
	Description string `json:"description"`
} 