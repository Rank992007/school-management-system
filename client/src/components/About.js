import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Us</h1>
          <p>Empowering education through innovative technology solutions</p>
        </div>
      </section>

      <section className="about-mission">
        <div className="about-container">
          <div className="about-text">
            <h2>Our Mission</h2>
            <p>At School Management System, we believe that every educational institution deserves access to powerful, intuitive tools that streamline operations and enhance the learning experience. Our mission is to transform how schools manage their daily operations through innovative technology.</p>
            <p>We are committed to providing a comprehensive platform that brings together students, teachers, administrators, and parents in a seamless digital ecosystem.</p>
          </div>
          <div className="about-image">
            <i className='bx bx-rocket'></i>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-container">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <i className='bx bx-heart'></i>
              <h3>Student-Centered</h3>
              <p>Everything we do focuses on improving the student experience and academic outcomes.</p>
            </div>
            <div className="value-card">
              <i className='bx bx-shield'></i>
              <h3>Security First</h3>
              <p>We prioritize data security and privacy to protect sensitive educational information.</p>
            </div>
            <div className="value-card">
              <i className='bx bx-lightbulb'></i>
              <h3>Innovation</h3>
              <p>Continuously evolving our platform with cutting-edge features and technologies.</p>
            </div>
            <div className="value-card">
              <i className='bx bx-group'></i>
              <h3>Collaboration</h3>
              <p>Fostering communication and teamwork between all stakeholders in education.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-story">
        <div className="about-container">
          <div className="story-content">
            <h2>Our Story</h2>
            <p>Founded in 2024, School Management System was born from a simple observation: many educational institutions struggle with fragmented systems and manual processes that detract from their core mission of education.</p>
            <p>Our team of educators, technologists, and business leaders came together to create a unified platform that addresses the real-world challenges faced by schools today. We've worked closely with teachers, administrators, and students to understand their needs and build solutions that make a real difference.</p>
            <p>Today, we serve hundreds of educational institutions worldwide, helping them save time, reduce administrative burden, and focus on what matters most - educating the next generation.</p>
          </div>
        </div>
      </section>

      <section className="about-team">
        <div className="about-container">
          <h2>Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">
                <i className='bx bx-user'></i>
              </div>
              <h3>Rank_Intime</h3>
              <p>CEO & Founder</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">
                <i className='bx bx-user'></i>
              </div>
              <h3>Sarah Johnson</h3>
              <p>CTO</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">
                <i className='bx bx-user'></i>
              </div>
              <h3>Michael Brown</h3>
              <p>Lead Developer</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">
                <i className='bx bx-user'></i>
              </div>
              <h3>Emily Davis</h3>
              <p>Product Manager</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
