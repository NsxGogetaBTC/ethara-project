import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  
  useEffect(() => {
    if (!user) return;
    fetchProjectAndTasks();
    if (user.role === 'Admin') {
      fetchAllUsers();
    }
  }, [id, user]);

  const fetchProjectAndTasks = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [projRes, tasksRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/projects/${id}`, config),
        axios.get(`http://localhost:5000/api/tasks/project/${id}`, config)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching details', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/users', config);
      setAllUsers(data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserIdToAdd) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const currentMembers = project.members.map(m => m._id);
      if (currentMembers.includes(selectedUserIdToAdd)) return; // already a member
      
      const newMembers = [...currentMembers, selectedUserIdToAdd];
      await axios.put(`http://localhost:5000/api/projects/${id}/members`, { members: newMembers }, config);
      setSelectedUserIdToAdd('');
      fetchProjectAndTasks();
    } catch (error) {
      console.error('Error adding member', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/tasks', {
        title: newTaskTitle,
        description: newTaskDesc,
        dueDate: newTaskDueDate || undefined,
        project: id,
        assignee: newTaskAssignee || user._id
      }, config);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDueDate('');
      setNewTaskAssignee('');
      fetchProjectAndTasks();
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/tasks/${taskId}/status`, { status: newStatus }, config);
      fetchProjectAndTasks();
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  if (!project) return <div>Loading project...</div>;

  return (
    <div>
      <div className="card mb-4">
        <div className="flex-between">
          <h1>{project.name}</h1>
          <span className="badge badge-primary">{project.members.length} Members</span>
        </div>
        <p className="text-muted mt-4">{project.description}</p>
        <p className="mt-4">
          <strong>Owner:</strong> {project.owner.name} ({project.owner.email})
        </p>
        <div className="mt-4">
          <strong>Team Members:</strong>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '0.5rem' }}>
            {project.members.map(m => (
              <li key={m._id}>{m.name} ({m.email})</li>
            ))}
          </ul>
        </div>
      </div>

      {user.role === 'Admin' && (
        <div className="card mb-4">
          <h3 className="card-title">Manage Team</h3>
          <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '1rem' }}>
            <select 
              className="form-input" 
              value={selectedUserIdToAdd} 
              onChange={(e) => setSelectedUserIdToAdd(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">Select a user to add...</option>
              {allUsers.filter(u => !project.members.some(m => m._id === u._id)).map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Add Member</button>
          </form>
        </div>
      )}

      <div className="flex-between mb-4">
        <h2>Tasks</h2>
      </div>

      {user.role === 'Admin' && (
        <div className="card mb-4">
          <h3 className="card-title">Add New Task</h3>
          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 2 }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Task title..."
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value)} 
                  required 
                />
              </div>
              <div style={{ flex: 1 }}>
                <input 
                  type="date" 
                  className="form-input" 
                  value={newTaskDueDate} 
                  onChange={(e) => setNewTaskDueDate(e.target.value)} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <select 
                  className="form-input"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                >
                  <option value="">Assign to...</option>
                  {project.members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <textarea 
                className="form-input" 
                placeholder="Task description (optional)..."
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                style={{ flex: 1, minHeight: '80px', resize: 'vertical' }}
              ></textarea>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Add Task</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {tasks.length === 0 ? (
          <p>No tasks for this project.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Task</th>
                <th style={{ padding: '1rem' }}>Due Date</th>
                <th style={{ padding: '1rem' }}>Assignee</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
                return (
                  <tr key={task._id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{task.description}</div>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      {isOverdue && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'block', fontWeight: 'bold' }}>Overdue!</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>{task.assignee ? task.assignee.name : 'Unassigned'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-${task.status.replace(' ', '').toLowerCase()}`}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        className="form-input" 
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                        disabled={user.role !== 'Admin'}
                        title={user.role !== 'Admin' ? 'Only admins can change task status' : ''}
                        style={{ padding: '0.25rem', width: 'auto' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
