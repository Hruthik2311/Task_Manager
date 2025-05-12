package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "github.com/lib/pq"
	"github.com/joho/godotenv"
)

// InitDB initializes the database with the schema
func InitDB() (*sql.DB, error) {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Get database connection string from environment variable
	dbConnStr := os.Getenv("DATABASE_URL")
	if dbConnStr == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is not set")
	}

	// Open database connection
	db, err := sql.Open("postgres", dbConnStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %v", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}

	// Read schema file
	schemaPath := filepath.Join("database", "schema.sql")
	schema, err := os.ReadFile(schemaPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read schema file: %v", err)
	}

	// Execute schema
	_, err = db.Exec(string(schema))
	if err != nil {
		return nil, fmt.Errorf("failed to execute schema: %v", err)
	}

	log.Println("Database initialized successfully")
	return db, nil
} 