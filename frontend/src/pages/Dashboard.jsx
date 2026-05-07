import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMyTasks = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.get('http://localhost:5000/api/tasks/my-tasks', config);
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTasks();
  }, [user]);

  if (loading) return <div>Loading dashboard...</div>;

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const progressCount = tasks.filter(t => t.status === 'In Progress').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const overdueCount = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Welcome back, {user.name} ({user.role})</h1>
      
      <div className="task-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card text-center" style={overdueCount > 0 ? { border: '2px solid var(--danger)' } : {}}>
          <h3 className="card-title text-muted">Overdue</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>{overdueCount}</p>
        </div>
        <div className="card text-center">
          <h3 className="card-title text-muted">Pending</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{pendingCount}</p>
        </div>
        <div className="card text-center">
          <h3 className="card-title text-muted">In Progress</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{progressCount}</p>
        </div>
        <div className="card text-center">
          <h3 className="card-title text-muted">Completed</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{completedCount}</p>
        </div>
      </div>

      <h2>Your Tasks</h2>
      <div className="card mt-4">
        {tasks.length === 0 ? (
          <p>You have no tasks assigned to you right now.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Title</th>
                <th style={{ padding: '1rem' }}>Project</th>
                <th style={{ padding: '1rem' }}>Due Date</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
                return (
                  <tr key={task._id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                    <td style={{ padding: '1rem' }}>
                      <Link to={`/projects/${task.project._id}`}>{task.title}</Link>
                      {task.description && <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{task.description}</div>}
                    </td>
                    <td style={{ padding: '1rem' }}>{task.project.name}</td>
                    <td style={{ padding: '1rem' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      {isOverdue && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'block', fontWeight: 'bold' }}>Overdue</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-${task.status.replace(' ', '').toLowerCase()}`}>
                        {task.status}
                      </span>
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

export default Dashboard;
