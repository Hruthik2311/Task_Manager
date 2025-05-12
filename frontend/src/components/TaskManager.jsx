import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import { format } from "date-fns";

const API_URL = "http://localhost:8080/api/tasks";
const priorityOrder = { high: 1, medium: 2, low: 3 };

function TaskManager() {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [filterDueDate, setFilterDueDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showSortOptions, setShowSortOptions] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setTasks([]);
      setError("Failed to load tasks.");
    }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); /* eslint-disable-next-line */ }, [token]);

  const createTask = async (task) => {
    setLoading(true);
    setError("");
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(task),
      });
      await fetchTasks();
    } catch (e) {
      setError("Failed to add task.");
    }
    setLoading(false);
  };

  const updateTask = async (id, task) => {
    setLoading(true);
    setError("");
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(task),
      });
      setEditingTask(null);
      await fetchTasks();
    } catch (e) {
      setError("Failed to update task.");
    }
    setLoading(false);
  };

  const deleteTask = async (id) => {
    setLoading(true);
    setError("");
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTasks();
    } catch (e) {
      setError("Failed to delete task.");
    }
    setLoading(false);
  };

  const handleEdit = (task) => setEditingTask(task);
  const handleCancelEdit = () => setEditingTask(null);
  const handleMarkDone = async (task) => {
    if (task.status === "completed") return;
    setLoading(true);
    setError("");
    try {
      await updateTask(task.id, { ...task, status: "completed" });
      await fetchTasks();
    } catch (e) {
      setError("Failed to mark task as done.");
    }
    setLoading(false);
  };

  // Filtering logic
  let filteredTasks = tasks.filter(task => {
    let match = true;
    if (filterDueDate) {
      if (!task.due_date || task.due_date.slice(0, 10) !== filterDueDate) match = false;
    }
    if (filterStatus) {
      if (task.status !== filterStatus) match = false;
    }
    if (filterPriority) {
      if (task.priority !== filterPriority) match = false;
    }
    return match;
  });

  // Sorting logic
  if (sortBy === "due_date") {
    filteredTasks = [...filteredTasks].sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
  } else if (sortBy === "priority") {
    filteredTasks = [...filteredTasks].sort((a, b) => {
      return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
    });
  }

  return (
    <div className="app-card">
      <h2>Task Management App</h2>
      <div className="add-task-title">{editingTask ? "Edit Task" : "Add New Task"}</div>
      <TaskForm
        onAdd={createTask}
        onUpdate={(task) => updateTask(task.id, task)}
        editingTask={editingTask}
        onCancelEdit={handleCancelEdit}
        loading={loading}
      />
      {error && <div style={{ color: "red", textAlign: "center", marginBottom: 16 }}>{error}</div>}
      <div className="task-list-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Task List</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="date"
            value={filterDueDate}
            onChange={e => setFilterDueDate(e.target.value)}
            style={{ height: 32, borderRadius: 6, border: '1px solid #e0e0e0', padding: '0 8px' }}
            max={format(new Date(2100, 0, 1), "yyyy-MM-dd")}
            placeholder="Due Date"
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ height: 32, borderRadius: 6, border: '1px solid #e0e0e0', padding: '0 8px' }}
          >
            <option value="">All Status</option>
            <option value="pending">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            style={{ height: 32, borderRadius: 6, border: '1px solid #e0e0e0', padding: '0 8px' }}
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            style={{ height: 32, borderRadius: 6, border: '1px solid rgb(105, 0, 0)', background: '#eee', color: '#333', padding: '0 12px', fontWeight: 500, cursor: 'pointer' }}
            onClick={() => { setFilterDueDate(""); setFilterStatus(""); setFilterPriority(""); }}
            title="Clear Filters"
          >
            Clear
          </button>
        </div>
      </div>
      {/* Sort By Feature */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0 12px 0', gap: 8 }}>
        <div
          style={{ position: 'relative', display: 'inline-block' }}
          onClick={() => setShowSortOptions(v => !v)}
        >
          <button
            style={{ height: 32, borderRadius: 6, border: '1px solid #3a2fd8', background: '#fff', color: '#3a2fd8', padding: '0 16px', fontWeight: 500, cursor: 'pointer' }}
          >
            Sort By
          </button>
          {showSortOptions && (
            <div style={{ position: 'absolute', top: 36, left: 0, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, boxShadow: '0 2px 8px #eee', zIndex: 10, minWidth: 120 }}>
              <div
                style={{ padding: '8px 16px', cursor: 'pointer', color: sortBy === 'due_date' ? '#3a2fd8' : '#222', fontWeight: sortBy === 'due_date' ? 600 : 400 }}
                onClick={e => { setSortBy('due_date'); setShowSortOptions(false); e.stopPropagation(); }}
              >
                Due Date
              </div>
              <div
                style={{ padding: '8px 16px', cursor: 'pointer', color: sortBy === 'priority' ? '#3a2fd8' : '#222', fontWeight: sortBy === 'priority' ? 600 : 400 }}
                onClick={e => { setSortBy('priority'); setShowSortOptions(false); e.stopPropagation(); }}
              >
                Priority
              </div>
            </div>
          )}
        </div>
        {sortBy && (
          <button
            style={{ height: 32, borderRadius: 6, border: '1px solid #e0e0e0', background: '#eee', color: '#333', padding: '0 12px', fontWeight: 500, cursor: 'pointer' }}
            onClick={() => setSortBy("")}
            title="Clear Sort"
        >
            Clear Sort
          </button>
        )}
      </div>
      {/* End Sort By Feature */}
      <div className="task-list">
        {loading ? <div style={{ textAlign: "center" }}>Loading...</div> : (
          <TaskList tasks={filteredTasks} onEdit={handleEdit} onDelete={deleteTask} onMarkDone={handleMarkDone} />
        )}
      </div>
    </div>
  );
}

export default TaskManager; 