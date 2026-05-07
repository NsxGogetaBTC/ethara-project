import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [editingProjectDesc, setEditingProjectDesc] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/projects', config);
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/projects', {
        name: newProjectName,
        description: newProjectDesc
      }, config);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects();
    } catch (error) {
      console.error('Error creating project', error);
    }
  };

  const handleStartEdit = (project) => {
    setEditingProjectId(project._id);
    setEditingProjectName(project.name);
    setEditingProjectDesc(project.description || '');
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditingProjectName('');
    setEditingProjectDesc('');
  };

  const handleUpdateProject = async (projectId) => {
    if (!editingProjectName.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/projects/${projectId}`, {
        name: editingProjectName,
        description: editingProjectDesc
      }, config);
      setEditingProjectId(null);
      setEditingProjectName('');
      setEditingProjectDesc('');
      fetchProjects();
    } catch (error) {
      console.error('Error updating project', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, config);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project', error);
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <h1>Projects</h1>
      </div>

      {user.role === 'Admin' && (
        <div className="card mb-4">
          <h3 className="card-title">Create New Project</h3>
          <form onSubmit={handleCreateProject} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={newProjectName} 
                onChange={(e) => setNewProjectName(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
              <label className="form-label">Description</label>
              <input 
                type="text" 
                className="form-input" 
                value={newProjectDesc} 
                onChange={(e) => setNewProjectDesc(e.target.value)} 
              />
            </div>
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
        </div>
      )}

      <div className="task-grid">
        {projects.map(project => (
          <div key={project._id} className="card">
            {editingProjectId === project._id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={editingProjectName}
                  onChange={(e) => setEditingProjectName(e.target.value)}
                  placeholder="Project title"
                />
                <textarea
                  className="form-input"
                  value={editingProjectDesc}
                  onChange={(e) => setEditingProjectDesc(e.target.value)}
                  placeholder="Project description"
                  style={{ resize: 'vertical', minHeight: '80px' }}
                />
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-primary" onClick={() => handleUpdateProject(project._id)}>
                    Save
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="card-title">{project.name}</h3>
                <p className="text-muted mb-4">{project.description}</p>
              </>
            )}
            <div className="flex-between" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <div className="text-muted" style={{ fontSize: '0.875rem', display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                {project.members.slice(0, 3).map(m => (
                  <span key={m._id} title={m.email} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                    {m.name.split(' ')[0]}
                  </span>
                ))}
                {project.members.length > 3 && <span>+{project.members.length - 3}</span>}
                {project.members.length === 0 && <span>No members</span>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link to={`/projects/${project._id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  View Project
                </Link>
                {user.role === 'Admin' && editingProjectId !== project._id && (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={() => handleStartEdit(project)}>
                      Edit Title
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDeleteProject(project._id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p>No projects found.</p>}
      </div>
    </div>
  );
};

export default Projects;
