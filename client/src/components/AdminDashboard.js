import React, { useState, useEffect, useCallback } from 'react';

const AdminDashboard = ({ user, logout }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/students', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setStudents(data.students);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/teachers', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setTeachers(data.teachers);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeView === 'students') {
      fetchStudents();
    } else if (activeView === 'teachers') {
      fetchTeachers();
    }
  }, [activeView, fetchStudents, fetchTeachers]);

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="card" onClick={() => setActiveView('students')}>
        <i className='bx bx-group'></i>
        <h3>Students</h3>
        <p>View and manage all students</p>
      </div>
      <div className="card" onClick={() => setActiveView('teachers')}>
        <i className='bx bx-chalkboard'></i>
        <h3>Teachers</h3>
        <p>View and manage all teachers</p>
      </div>
      <div className="card" onClick={() => setActiveView('marks')}>
        <i className='bx bx-book'></i>
        <h3>Marks</h3>
        <p>View all student marks</p>
      </div>
      <div className="card" onClick={() => setActiveView('claims')}>
        <i className='bx bx-error'></i>
        <h3>Claims</h3>
        <p>Review all student claims</p>
      </div>
      <div className="card" onClick={() => setActiveView('bulletins')}>
        <i className='bx bx-file'></i>
        <h3>Bulletins</h3>
        <p>Manage student bulletins</p>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="table-container">
      <h2>All Students</h2>
      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : students.length === 0 ? (
        <p>No students found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Grade</th>
              <th>Date of Birth</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.firstName || student.first_name} {student.lastName || student.last_name}</td>
                <td>{student.username}</td>
                <td>{student.email}</td>
                <td>{student.grade || '-'}</td>
                <td>{student.dateOfBirth || student.date_of_birth ? new Date(student.dateOfBirth || student.date_of_birth).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="btn" onClick={() => setActiveView('dashboard')} style={{ marginTop: '1rem' }}>
        <i className='bx bx-arrow-back'></i> Back to Dashboard
      </button>
    </div>
  );

  const renderTeachers = () => (
    <div className="table-container">
      <h2>All Teachers</h2>
      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : teachers.length === 0 ? (
        <p>No teachers found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Subject</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher.id}>
                <td>{teacher.firstName || teacher.first_name} {teacher.lastName || teacher.last_name}</td>
                <td>{teacher.username}</td>
                <td>{teacher.email}</td>
                <td>{teacher.subject || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="btn" onClick={() => setActiveView('dashboard')} style={{ marginTop: '1rem' }}>
        <i className='bx bx-arrow-back'></i> Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2><i className='bx bx-shield-quarter'></i> Admin Dashboard - {user.firstName} {user.lastName}</h2>
        <nav>
          <button onClick={logout} className="btn logout-btn">Logout</button>
        </nav>
      </header>
      <main className="dashboard-content">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'students' && renderStudents()}
        {activeView === 'teachers' && renderTeachers()}
        {activeView === 'marks' && (
          <div className="table-container">
            <h2>All Marks</h2>
            <p>Marks management coming soon</p>
            <button className="btn" onClick={() => setActiveView('dashboard')} style={{ marginTop: '1rem' }}>
              <i className='bx bx-arrow-back'></i> Back to Dashboard
            </button>
          </div>
        )}
        {activeView === 'claims' && (
          <div className="table-container">
            <h2>All Claims</h2>
            <p>Claims management coming soon</p>
            <button className="btn" onClick={() => setActiveView('dashboard')} style={{ marginTop: '1rem' }}>
              <i className='bx bx-arrow-back'></i> Back to Dashboard
            </button>
          </div>
        )}
        {activeView === 'bulletins' && (
          <div className="table-container">
            <h2>All Bulletins</h2>
            <p>Bulletin management coming soon</p>
            <button className="btn" onClick={() => setActiveView('dashboard')} style={{ marginTop: '1rem' }}>
              <i className='bx bx-arrow-back'></i> Back to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
