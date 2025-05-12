package database

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// RunMigrations runs the database migrations from the migrations directory.
func RunMigrations(db *sql.DB) error {
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("could not create migration driver: %v", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://migrations",
		"postgres", driver)
	if err != nil {
		return fmt.Errorf("could not create migration instance: %v", err)
	}

	// Check if we need to run migrations
	version, dirty, err := m.Version()
	if err != nil && err != migrate.ErrNilVersion {
		return fmt.Errorf("could not check migration version: %v", err)
	}

	// Only run migrations if we haven't run them before or if there are new migrations
	if err == migrate.ErrNilVersion || dirty {
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
			return fmt.Errorf("could not run migrations: %v", err)
		}
		log.Printf("Migrations completed successfully. Current version: %d", version)
	} else {
		log.Printf("Database is up to date. Current version: %d", version)
	}

	return nil
} 