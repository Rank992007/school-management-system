import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    grade: '',
    subject: '',
    verificationCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { username: formData.username, password: formData.password }
        : { ...formData, role: selectedRole };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          setUser(data.user);
          navigate(`/${data.user.role}-dashboard`);
        } else {
          // Registration successful, show verification screen
          setShowVerification(true);
          setRegisteredEmail(formData.email);
          setError('');
        }
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: formData.verificationCode })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate(`/${data.user.role}-dashboard`);
      } else {
        setError(data.message || 'Invalid or expired verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: registeredEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setError('');
        alert('Verification code sent successfully. Please check your email.');
      } else {
        setError(data.message || 'Failed to resend verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1 className="title">Verify Your Email</h1>
          <p className="subtitle">Enter the 6-digit code sent to {registeredEmail}</p>

          <form onSubmit={handleVerification}>
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                style={{
                  textAlign: 'center',
                  fontSize: '24px',
                  letterSpacing: '8px',
                  fontWeight: 'bold'
                }}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? (
                <div className="spinner"></div>
              ) : (
                'Verify Email'
              )}
            </button>

            <button
              type="button"
              className="btn"
              onClick={handleResendCode}
              disabled={loading}
              style={{
                background: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                marginTop: '1rem'
              }}
            >
              {loading ? 'Sending...' : 'Resend Code'}
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => {
                setShowVerification(false);
                setSelectedRole('');
                setError('');
              }}
              style={{
                background: 'transparent',
                color: '#666',
                border: '2px solid #666',
                marginTop: '0.5rem'
              }}
            >
              Back to Registration
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isLogin && !selectedRole) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1 className="title">School Management System</h1>
          <p className="subtitle">Choose your role to continue</p>
          <div className="role-buttons">
            <button className="btn" onClick={() => setSelectedRole('student')}>
              <i className='bx bx-user'></i> Register as Student
            </button>
            <button className="btn" onClick={() => setSelectedRole('teacher')}>
              <i className='bx bx-chalkboard'></i> Register as Teacher
            </button>
            <button className="btn" onClick={() => setIsLogin(true)}>
              <i className='bx bx-arrow-back'></i> Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="title">
          {isLogin ? 'Login' : `Register as ${selectedRole}`}
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              {selectedRole === 'student' && (
                <>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Grade</label>
                    <input
                      type="text"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      placeholder="e.g., 10th Grade"
                      required
                    />
                  </div>
                </>
              )}

              {selectedRole === 'teacher' && (
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>
              )}
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? (
              <div className="spinner"></div>
            ) : (
              isLogin ? 'Login' : 'Register'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1rem' }}>
          <button 
            className="btn" 
            onClick={() => {
              setIsLogin(!isLogin);
              setSelectedRole('');
              setError('');
            }}
            style={{ background: 'transparent', color: '#667eea', border: '2px solid #667eea' }}
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
