import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ user, logout }) => {
  const location = useLocation();

  if (user) {
    return (
      <aside className="sidebar">
        <div className="sidebar-header">
          <i className='bx bx-school'></i>
          <span>SMS Portal</span>
        </div>
        <nav className="sidebar-nav">
          <Link
            to={`/${user.role}-dashboard`}
            className={`sidebar-link ${location.pathname.includes('dashboard') ? 'active' : ''}`}
          >
            <i className='bx bx-grid-alt'></i>
            <span>Dashboard</span>
          </Link>
          <Link
            to="/home"
            className={`sidebar-link ${location.pathname === '/home' ? 'active' : ''}`}
          >
            <i className='bx bx-home'></i>
            <span>Home</span>
          </Link>
          <Link
            to="/about"
            className={`sidebar-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            <i className='bx bx-info-circle'></i>
            <span>About Us</span>
          </Link>
          <Link
            to="/contact"
            className={`sidebar-link ${location.pathname === '/contact' ? 'active' : ''}`}
          >
            <i className='bx bx-envelope'></i>
            <span>Contact Us</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <i className='bx bx-user-circle'></i>
            <div>
              <span className="sidebar-username">{user.firstName} {user.lastName}</span>
              <span className="sidebar-role">{user.role}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout}>
            <i className='bx bx-log-out'></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar sidebar-login">
      <div className="sidebar-header">
        <i className='bx bx-school'></i>
        <span>SMS Portal</span>
      </div>
      <p className="sidebar-subtitle">Login as</p>
      <nav className="sidebar-nav">
        <Link
          to="/?role=admin"
          className={`sidebar-link ${location.search === '?role=admin' ? 'active' : ''}`}
        >
          <i className='bx bx-shield-quarter'></i>
          <span>Admin</span>
        </Link>
        <Link
          to="/?role=teacher"
          className={`sidebar-link ${location.search === '?role=teacher' ? 'active' : ''}`}
        >
          <i className='bx bx-chalkboard'></i>
          <span>Teacher</span>
        </Link>
        <Link
          to="/?role=student"
          className={`sidebar-link ${location.search === '?role=student' ? 'active' : ''}`}
        >
          <i className='bx bx-user'></i>
          <span>Student</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <Link to="/about" className="sidebar-link">
          <i className='bx bx-info-circle'></i>
          <span>About Us</span>
        </Link>
        <Link to="/contact" className="sidebar-link">
          <i className='bx bx-envelope'></i>
          <span>Contact Us</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
