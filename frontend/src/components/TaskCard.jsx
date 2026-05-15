import React from 'react';
import api from '../services/api';

const TaskCard = ({ task, onUpdate, users }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  const statusBadge = {
    'Todo': 'badge-todo',
    'In Progress': 'badge-progress',
    'Done': 'badge-done',
  };
  const priorityBadge = {
    'High': 'badge-high',
    'Medium': 'badge-medium',
    'Low': 'badge-low',
  };

  const handleStatus = async (e) => {
    await api.put(`/tasks/${task._id}`, { status: e.target.value });
    onUpdate();
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      await api.delete(`/tasks/${task._id}`);
      onUpdate();
    }
  };

  return (
    <div className="card">
      <h3>{task.title}</h3>
      <p>{task.description || 'No description'}</p>
      <p><strong>Project:</strong> {task.project?.name}</p>
      <p><strong>Assigned to:</strong> {task.assignedTo?.name || 'Unassigned'}</p>
      <p>
        <span className={`badge ${statusBadge[task.status]}`}>{task.status}</span>{' '}
        <span className={`badge ${priorityBadge[task.priority]}`}>{task.priority}</span>{' '}
        {isOverdue && <span className="badge badge-overdue">OVERDUE</span>}
      </p>
      {task.dueDate && (
        <p style={{ fontSize: 12, color: '#7f8c8d' }}>
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
      <div style={{ marginTop: 10 }}>
        <select value={task.status} onChange={handleStatus} style={{ padding: 4 }}>
          <option>Todo</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
        <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};

export default TaskCard;