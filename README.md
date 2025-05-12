# Task Manager Application

A full-stack task management application built with Go (backend) and React (frontend).

## Prerequisites

Before you begin, ensure you have the following installed:
- [Go](https://golang.org/dl/) (version 1.16 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) (version 12 or higher)
- [Node.js and npm](https://nodejs.org/) (version 14 or higher)

## Files to Exclude from GitHub

A `.gitignore` file is included to ensure you do not upload sensitive or unnecessary files to GitHub. This includes:
- `node_modules/` (frontend)
- `build/` or `dist/` folders
- `.env` files (for secrets and credentials)
- System files like `.DS_Store`
- IDE/editor folders like `.vscode/`, `.idea/`

## Database Setup

1. Install PostgreSQL from the official website
2. During installation:
   - Remember the password you set for the postgres user
   - Make sure to install the command line tools (psql)
   - The default port is 5432

3. Create the database using pgAdmin:
   - Open pgAdmin 4
   - Connect to your PostgreSQL server
   - Right-click on "Databases"
   - Select "Create" → "Database"
   - Enter database name: `task_manager`
   - Set owner as `postgres`
   - Click "Save"

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Go dependencies:
   ```bash
   go mod tidy
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   DATABASE_URL=postgres://postgres:<YOUR_PASSWORD>@localhost:5432/task_manager?sslmode=disable
   PORT=8080
   ENV=development
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=24h
   ```
   Replace `<YOUR_PASSWORD>` with your PostgreSQL password. If you use a different database/user/port, update accordingly.

4. Run the backend server:
   ```bash
   go run main.go
   ```
   The server should start on `http://localhost:8080`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The frontend should start on `http://localhost:3000`

## Running the Application

1. Make sure PostgreSQL is running
2. Start the backend server (from the backend directory):
   ```bash
   go run main.go
   ```
3. Start the frontend development server (from the frontend directory):
   ```bash
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Troubleshooting

1. If you get a database connection error:
   - Verify PostgreSQL is running
   - Check if the database `task_manager` exists
   - Verify your database credentials in the `.env` file

2. If you get dependency errors:
   - For backend: Run `go mod tidy` again
   - For frontend: Delete `node_modules` folder and run `npm install` again

3. If ports are already in use:
   - Check if other applications are using ports 3000 or 8080
   - Kill the processes using those ports or change the port configuration

## Project Structure

```
task-manager/
├── backend/
│   ├── database/
│   ├── handlers/
│   ├── models/
│   └── main.go
└── frontend/
    ├── src/
    ├── public/
    └── package.json
```

## Features

- Create, read, update, and delete tasks
- Task status management
- Due date tracking
- Task categorization
- User-friendly interface

## Technologies Used

- Backend: Go (Golang)
- Database: PostgreSQL
- Frontend: React
- API: RESTful
