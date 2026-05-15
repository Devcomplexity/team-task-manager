import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/tasks/dashboard').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div className="container">Loading dashboard...</div>;

  return (
    <div className="container">
      <h1>📊 Dashboard</h1>
      <p style={{ marginBottom: 20, color: '#7f8c8d' }}>Overview of your tasks</p>
      <div className="stats-grid">
        <div className="stat-card"><h3>{stats.total}</h3><p>Total Tasks</p></div>
        <div className="stat-card"><h3>{stats.myTasks}</h3><p>My Tasks</p></div>
        <div className="stat-card"><h3>{stats.todo}</h3><p>Todo</p></div>
        <div className="stat-card"><h3>{stats.inProgress}</h3><p>In Progress</p></div>
        <div className="stat-card stat-done"><h3>{stats.done}</h3><p>Done</p></div>
        <div className="stat-card stat-overdue"><h3>{stats.overdue}</h3><p>Overdue</p></div>
      </div>
    </div>
  );
};

export default Dashboard;