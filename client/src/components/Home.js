import React from 'react';
import { Link } from 'react-router-dom';

const Home = ({ user }) => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to School Management System</h1>
          <p>A comprehensive platform for managing educational institutions, students, teachers, and academic records.</p>
          <div className="hero-buttons">
            {!user ? (
              <Link to="/" className="btn btn-primary">Get Started</Link>
            ) : (
              <Link to={`/${user.role}-dashboard`} className="btn btn-primary">Go to Dashboard</Link>
            )}
            <Link to="/about" className="btn btn-secondary">Learn More</Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Our Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className='bx bx-user'></i>
            <h3>Student Management</h3>
            <p>Track student information, grades, attendance, and academic progress efficiently.</p>
          </div>
          <div className="feature-card">
            <i className='bx bx-chalkboard'></i>
            <h3>Teacher Portal</h3>
            <p>Empower teachers with tools for managing classes, assigning marks, and generating reports.</p>
          </div>
          <div className="feature-card">
            <i className='bx bx-book'></i>
            <h3>Grade Tracking</h3>
            <p>Comprehensive grade book system with detailed mark tracking and analysis.</p>
          </div>
          <div className="feature-card">
            <i className='bx bx-file'></i>
            <h3>Report Generation</h3>
            <p>Generate detailed bulletins and reports for students and parents.</p>
          </div>
          <div className="feature-card">
            <i className='bx bx-error'></i>
            <h3>Claims System</h3>
            <p>Allow students to submit grade disputes and track resolution progress.</p>
          </div>
          <div className="feature-card">
            <i className='bx bx-shield'></i>
            <h3>Secure & Reliable</h3>
            <p>Enterprise-grade security with role-based access control.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your School Management?</h2>
          <p>Join thousands of educational institutions already using our platform.</p>
          {!user ? (
            <Link to="/" className="btn btn-primary btn-large">Start Free Trial</Link>
          ) : (
            <Link to={`/${user.role}-dashboard`} className="btn btn-primary btn-large">Access Your Dashboard</Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
