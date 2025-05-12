import React from "react";
import TaskItem from "./TaskItem";

export default function TaskList({ tasks, onEdit, onDelete, onMarkDone }) {
  return (
    <div>
      {tasks && tasks.length > 0 ? (
        tasks.map(task => (
          <TaskItem key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onMarkDone={onMarkDone} />
        ))
      ) : (
        <div>No tasks found.</div>
      )}
    </div>
  );
} 