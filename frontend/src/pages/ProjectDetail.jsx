import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '',
  });

  const load = async () => {
    const { data } = await api.get(`/projects/${id}`);
    setProject(data);
    const { data: t } = await api.get(`/tasks?projectId=${id}`);
    setTasks(t);
  };

  useEffect(() => {
    load();
    api.get('/auth/users').then((res) => setUsers(res.data));
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    await api.post('/tasks', { ...form, project: id });
    setShowModal(false);
    setForm({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' });
    load();
  };

  if (!project) return <div className="container">Loading...</div>;

  const projectMembers = [project.owner, ...project.members];

  return (
    <div className="container">
      <h1>📁 {project.name}</h1>
      <p style={{ color: '#7f8c8d', margin: '10px 0' }}>{project.description}</p>
      <p><strong>Owner:</strong> {project.owner?.name}</p>
      <p><strong>Members:</strong> {project.members.map((m) => m.name).join(', ') || 'None'}</p>

      <div className="page-header" style={{ marginTop: 30 }}>
        <h2>Tasks ({tasks.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Task</button>
      </div>

      <div className="grid">
        {tasks.map((t) => (
          <TaskCard key={t._id} task={t} onUpdate={load} users={projectMembers} />
        ))}
        {tasks.length === 0 && <p>No tasks yet.</p>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title</label>
                <input value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">-- Unassigned --</option>
                  {projectMembers.map((u) => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-success">Create</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;