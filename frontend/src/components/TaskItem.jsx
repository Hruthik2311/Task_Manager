import React, { useState } from "react";

const priorityLabel = (priority) => {
  if (priority === "low") return "Low";
  if (priority === "medium") return "Medium";
  if (priority === "high") return "High";
  return priority;
};

export default function TaskItem({ task, onEdit, onDelete, onMarkDone }) {
  const [showDesc, setShowDesc] = useState(false);
  return (
    <div className="task-item" style={{ padding: 10, marginBottom: 8, position: 'relative' }}>
      <div className="task-title" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        {task.title}
        {task.description && task.description.trim() && (
          <span
            title="Show description"
            style={{ cursor: 'pointer', color: '#2d89ff', fontWeight: 700, fontSize: 18, marginLeft: 4 }}
            onClick={() => setShowDesc(true)}
          >
            i
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.98rem', marginBottom: 6, flexWrap: 'wrap' }}>
        <span className="status-label" style={{ color: '#000000' }}>Status: {task.status === "pending" ? "To Do" : task.status === "in_progress" ? "In Progress" : "Completed"}</span>
        {task.category && <span className="status-label" style={{ color: '#000000' }}>Category: {task.category}</span>}
        {task.due_date && <span className="status-label" style={{ color: '#000000' }}>Due: {task.due_date.slice(0, 10)}</span>}
        <span className="status-label" style={{ color: '#000000', fontWeight: 500 }}>Priority: {priorityLabel(task.priority)}</span>
      </div>
      <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button
            className="btn-edit"
            onClick={() => onEdit(task)}
            style={{
              background: 'linear-gradient(90deg, #3a8dde 0%, #2d89ff 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 18px',
              fontWeight: 500,
              marginRight: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #e3eaff',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2d89ff 0%, #3a8dde 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #3a8dde 0%, #2d89ff 100%)'}
          >
            Edit
          </button>
          <button
            className="btn-delete"
            onClick={() => onDelete(task.id)}
            style={{
              background: 'linear-gradient(90deg, #e53935 0%, #ff1744 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 18px',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #ffe3e3',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #ff1744 0%, #e53935 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #e53935 0%, #ff1744 100%)'}
          >
            Delete
          </button>
        </div>
        <button
          style={{
            background: task.status === 'completed' ? '#bdbdbd' : '#43a047',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '6px 18px',
            fontWeight: 500,
            cursor: task.status === 'completed' ? 'not-allowed' : 'pointer',
            opacity: task.status === 'completed' ? 0.6 : 1,
            marginLeft: 8
          }}
          disabled={task.status === 'completed'}
          onClick={() => onMarkDone(task)}
        >
          Done
        </button>
      </div>
      {showDesc && task.description && task.description.trim() && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.98)', borderRadius: 12, padding: 24, minWidth: 260, maxWidth: 400, position: 'relative', boxShadow: '0 2px 16px #aaa' }}>
            <button
              onClick={() => setShowDesc(false)}
              style={{ position: 'absolute', top: 8, right: 12, background: 'transparent', border: 'none', fontSize: 22, color: '#3a2fd8', cursor: 'pointer', fontWeight: 700 }}
              title="Close"
            >
              ×
            </button>
            <div style={{ color: '#222', fontSize: 16, whiteSpace: 'pre-wrap' }}>{task.description}</div>
          </div>
        </div>
      )}
    </div>
  );
} 