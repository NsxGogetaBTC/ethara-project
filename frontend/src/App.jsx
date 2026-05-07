import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const { logout } = useAuth();
  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>ProjectManager</h2>
        <Link to="/" className="nav-link">Dashboard</Link>
        <Link to="/projects" className="nav-link">Projects</Link>
        <button onClick={logout} className="btn btn-logout mt-4">Logout</button>
      </div>
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/projects" element={
          <PrivateRoute>
            <Layout><Projects /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/projects/:id" element={
          <PrivateRoute>
            <Layout><ProjectDetails /></Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
