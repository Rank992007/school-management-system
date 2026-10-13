import React from 'react';
import { Link } from 'react-router-dom';

const Home = ({ user }) => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Every School Mark, Clearly Organized</h1>
          <p>Keep student marks, grades, attendance, and academic reports together in one easy-to-use school information system.</p>
          <div className="hero-buttons">
            {!user ? (
              <Link to="/login" className="btn btn-primary">Get Started</Link>
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
            <h3>Student Information</h3>
            <p>Keep student profiles, class details, attendance, and academic progress organized.</p>
          </div>
          <div className="feature-card">
            <i className='bx bx-chalkboard'></i>
            <h3>Marks and Grades</h3>
            <p>Teachers can record and update marks so students can follow their results by subject.</p>
          </div>
          <div className="feature-card">
            <i className='bx bx-book'></i>
            <h3>Academic Reports</h3>
            <p>Review subject results and generated bulletins to understand academic performance.</p>
          </div>
          <div className="feature-card">
            <i className='bx bx-file'></i>
            <h3>Student Mark Claims</h3>
            <p>Submit a question about a mark and follow its review through the system.</p>
          </div>
          <div className="feature-card">
            <i className='bx bx-error'></i>
            <h3>School Information</h3>
            <p>Students and teachers can find the academic information relevant to their role.</p>
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
          <h2>Keep Learning Progress in View</h2>
          <p>Sign in to review marks, academic reports, and important student information.</p>
          {!user ? (
          <Link to="/login" className="btn btn-primary btn-large">Login to Get Started</Link>
          ) : (
            <Link to={`/${user.role}-dashboard`} className="btn btn-primary btn-large">Access Your Dashboard</Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
