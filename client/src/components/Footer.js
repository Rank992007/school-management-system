import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>School Management System</h3>
          <p>A comprehensive platform for managing educational institutions, students, teachers, and academic records.</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact Info</h3>
          <ul>
            <li><i className='bx bx-envelope'></i> info@schoolmanagement.com</li>
            <li><i className='bx bx-phone'></i> +250 794421597</li>
            <li><i className='bx bx-map'></i> 123 Education Street, Learning City</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-links">
            <button className="social-link" aria-label="Facebook"><i className='bx bxl-facebook'></i></button>
            <button className="social-link" aria-label="Twitter"><i className='bx bxl-twitter'></i></button>
            <button className="social-link" aria-label="Instagram"><i className='bx bxl-instagram'></i></button>
            <button className="social-link" aria-label="LinkedIn"><i className='bx bxl-linkedin'></i></button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 School Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
