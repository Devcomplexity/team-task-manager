import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', members: [] });

  const loadProjects = async () => {
    const { data } = await api.get('/projects');
    setProjects(data);
  };

  useEffect(() => {
    loadProjects();
    api.get('/auth/users').then((res) => setUsers(res.data));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/projects', form);
    setShowModal(false);
    setForm({ name: '', description: '', members: [] });
    loadProjects();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project?')) {
      await api.delete(`/projects/${id}`);
      loadProjects();
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>📁 Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      <div className="grid">
        {projects.map((p) => (
          <div key={p._id} className="card">
            <h3>{p.name}</h3>
            <p>{p.description || 'No description'}</p>
            <p><strong>Owner:</strong> {p.owner?.name}</p>
            <p><strong>Members:</strong> {p.members?.length || 0}</p>
            <p><strong>Status:</strong> <span className="badge badge-progress">{p.status}</span></p>
            <div style={{ marginTop: 10 }}>
              <Link to={`/projects/${p._id}`} className="btn btn-primary">View</Link>
              {(p.owner?._id === user._id || user.role === 'Admin') && (
                <button className="btn btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
        {projects.length === 0 && <p>No projects yet. Create one!</p>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" />
              </div>
              <div className="form-group">
                <label>Members (Ctrl+Click to select multiple)</label>
                <select multiple value={form.members}
                  onChange={(e) => setForm({ ...form, members:
                    Array.from(e.target.selectedOptions, (o) => o.value) })}
                  style={{ height: 120 }}>
                  {users.filter((u) => u._id !== user._id).map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
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

export default Projects;