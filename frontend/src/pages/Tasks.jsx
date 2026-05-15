import React, { useEffect, useState } from 'react';
import api from '../services/api';
import TaskCard from '../components/TaskCard';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');

  const load = async () => {
    const { data } = await api.get('/tasks');
    setTasks(data);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'All' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="container">
      <div className="page-header">
        <h1>✅ All Tasks</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          style={{ padding: 8, borderRadius: 4 }}>
          <option>All</option>
          <option>Todo</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
      </div>
      <div className="grid">
        {filtered.map((t) => (
          <TaskCard key={t._id} task={t} onUpdate={load} users={[]} />
        ))}
        {filtered.length === 0 && <p>No tasks found.</p>}
      </div>
    </div>
  );
};

export default Tasks;