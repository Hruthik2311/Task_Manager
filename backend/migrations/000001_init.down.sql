-- Drop triggers
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_due_date;
DROP INDEX IF EXISTS idx_tasks_priority;

-- Drop tasks table
DROP TABLE IF EXISTS tasks CASCADE; 