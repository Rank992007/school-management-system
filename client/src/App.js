import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(error => {
        console.error('Error verifying token:', error);
        localStorage.removeItem('token');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} logout={logout} />
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Home user={user} /> : <Login setUser={setUser} />} 
            />
            <Route 
              path="/home" 
              element={<Home user={user} />} 
            />
            <Route 
              path="/about" 
              element={<About />} 
            />
            <Route 
              path="/contact" 
              element={<Contact />} 
            />
            <Route 
              path="/student-dashboard" 
              element={user?.role === 'student' ? <StudentDashboard user={user} logout={logout} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/teacher-dashboard" 
              element={user?.role === 'teacher' ? <TeacherDashboard user={user} logout={logout} /> : <Navigate to="/" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
