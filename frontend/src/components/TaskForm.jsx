import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";

export default function TaskForm({ onAdd, onUpdate, editingTask, onCancelEdit, loading }) {
  const staticCategories = [
    { id: 1, name: "Work" },
    { id: 2, name: "Personal" },
    { id: 3, name: "Shopping" },
    { id: 4, name: "Health" },
    { id: 5, name: "Education" }
  ];
  const [categories] = useState(staticCategories);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("low");
  const [dueType, setDueType] = useState("today");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customDue, setCustomDue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Personal");

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setStatus(editingTask.status || "pending");
      setPriority(editingTask.priority || "low");
      setSelectedCategory(editingTask.category || "Personal");
      if (editingTask.due_date) {
        const dateStr = editingTask.due_date.slice(0, 10);
        setDueDate(dateStr);
        setDueType("custom");
        setCustomDue(dateStr);
      } else {
        setDueType("today");
        setDueDate(format(new Date(), "yyyy-MM-dd"));
        setCustomDue("");
      }
    } else {
      setTitle("");
      setDescription("");
      setStatus("pending");
      setPriority("low");
      setDueType("today");
      setDueDate(format(new Date(), "yyyy-MM-dd"));
      setCustomDue("");
      setSelectedCategory("Personal");
    }
  }, [editingTask]);

  useEffect(() => {
    if (dueType === "today") {
      setDueDate(format(new Date(), "yyyy-MM-dd"));
    } else if (dueType === "tomorrow") {
      setDueDate(format(addDays(new Date(), 1), "yyyy-MM-dd"));
    } else if (dueType === "custom" && customDue) {
      setDueDate(customDue);
    }
  }, [dueType, customDue]);

  useEffect(() => {
    if (!editingTask && !loading) {
      setTitle("");
      setDescription("");
      setStatus("pending");
      setPriority("low");
      setDueType("today");
      setDueDate(format(new Date(), "yyyy-MM-dd"));
      setCustomDue("");
      setSelectedCategory("Personal");
    }
  }, [loading, editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim().length < 3) return;
    const isoDueDate = dueDate ? `${dueDate}T00:00:00Z` : null;
    const taskData = {
      title,
      description,
      status,
      priority,
      due_date: isoDueDate,
      category: selectedCategory
    };
    if (editingTask) {
      onUpdate({ ...editingTask, ...taskData });
      setTitle("");
      setDescription("");
      setStatus("pending");
      setPriority("low");
      setDueType("today");
      setDueDate(format(new Date(), "yyyy-MM-dd"));
      setCustomDue("");
      setSelectedCategory("Personal");
    } else {
      onAdd(taskData);
    }
  };

  const minDate = format(new Date(), "yyyy-MM-dd");

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Task Name"
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={loading}
        style={{ width: "100%" }}
      />
      <textarea
        placeholder="Task Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        disabled={loading}
        style={{ width: "100%", minHeight: 10 }}
      />
      <div style={{ display: "flex", gap: 12 }}>
        <select value={status} onChange={e => setStatus(e.target.value)} disabled={loading} style={{ flex: 1, height: 40 }}>
          <option value="pending">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value)} disabled={loading} style={{ flex: 1, height: 40 }}>
          <option value="low">Priority: Low</option>
          <option value="medium">Priority: Medium</option>
          <option value="high">Priority: High</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <select value={dueType} onChange={e => setDueType(e.target.value)} disabled={loading} style={{ flex: 1, height: 40 }}>
          <option value="today">Due: Today</option>
          <option value="tomorrow">Due: Tomorrow</option>
          <option value="custom">Due: Custom Date</option>
        </select>
        {dueType === "custom" && (
          <input
            type="date"
            value={customDue}
            min={minDate}
            onChange={e => setCustomDue(e.target.value)}
            disabled={loading}
            style={{ flex: 1, height: 40 }}
          />
        )}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          disabled={loading}
          style={{ flex: 1, height: 40 }}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button type="submit" disabled={loading} style={{ flex: 1, marginTop: 0 }}>
          {editingTask ? "Update Task" : "Add Task"}
        </button>
        {editingTask && (
          <button type="button" onClick={onCancelEdit} disabled={loading} style={{ flex: 1, marginTop: 0, background: '#eee', color: '#3a2fd8', border: '1px solid #3a2fd8' }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
} 