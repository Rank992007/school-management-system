import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, logout }) => {
  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/" className="logo-link">
            <img src="/logo.png" alt="School Management logo" />
            <span>School Management</span>
          </Link>
        </div>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
          {user && (
            <>
              <Link to={`/${user.role}-dashboard`} className="nav-link">Dashboard</Link>
              <button onClick={logout} className="nav-link logout-btn">Logout</button>
            </>
          )}
          {!user && (
            <Link to="/login" className="nav-link login-btn">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
