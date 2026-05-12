import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = ({ user, logout }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    if (activeView === 'students') {
      fetchStudents();
    } else if (activeView === 'marks') {
      fetchAllMarks();
    } else if (activeView === 'add-mark') {
      fetchStudents();
    } else if (activeView === 'claims') {
      fetchAllClaims();
    } else if (activeView === 'bulletins') {
      fetchAllBulletins();
    }
  }, [activeView]);

  const fetchStudents = async () => {
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
    } catch (error) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMarks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/marks/all', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setMarks(data.marks);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch marks');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/claims', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setClaims(data.claims);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBulletins = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/bulletins/all', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        // This would need to be implemented in the backend
        console.log('Bulletins:', data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch bulletins');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const markData = {
      studentId: formData.get('studentId'),
      subject: formData.get('subject'),
      testType: formData.get('testType'),
      score: parseInt(formData.get('score')),
      maxScore: parseInt(formData.get('maxScore') || 100),
      semester: formData.get('semester'),
      academicYear: formData.get('academicYear'),
      comments: formData.get('comments')
    };

    try {
      const response = await fetch('/api/marks', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(markData)
      });
      const data = await response.json();
      if (response.ok) {
        alert('Mark added successfully');
        e.target.reset();
        setActiveView('marks');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to add mark');
    }
  };

  const handleClaimReview = async (claimId, status, reviewComments) => {
    try {
      const response = await fetch(`/api/claims/${claimId}/review`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, reviewComments })
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Claim ${status} successfully`);
        fetchAllClaims();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to review claim');
    }
  };

  const handleBulletinGenerate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bulletinData = {
      studentId: formData.get('studentId'),
      semester: formData.get('semester'),
      academicYear: formData.get('academicYear')
    };

    try {
      const response = await fetch('/api/bulletins', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bulletinData)
      });
      const data = await response.json();
      if (response.ok) {
        alert('Bulletin generated successfully');
        e.target.reset();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to generate bulletin');
    }
  };

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="card" onClick={() => setActiveView('students')}>
        <i className='bx bx-group'></i>
        <h3>Students</h3>
        <p>View all students</p>
      </div>
      <div className="card" onClick={() => setActiveView('marks')}>
        <i className='bx bx-book'></i>
        <h3>Marks</h3>
        <p>View and manage marks</p>
      </div>
      <div className="card" onClick={() => setActiveView('add-mark')}>
        <i className='bx bx-plus-circle'></i>
        <h3>Add Mark</h3>
        <p>Add new student marks</p>
      </div>
      <div className="card" onClick={() => setActiveView('claims')}>
        <i className='bx bx-error'></i>
        <h3>Claims</h3>
        <p>Review student claims</p>
      </div>
      <div className="card" onClick={() => setActiveView('bulletins')}>
        <i className='bx bx-file'></i>
        <h3>Bulletins</h3>
        <p>Generate student bulletins</p>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="table-container">
      <h2>All Students</h2>
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student._id}>
                <td>{student.firstName} {student.lastName}</td>
                <td>{student.username}</td>
                <td>{student.email}</td>
                <td>{student.grade}</td>
                <td>
                  <button 
                    className="btn" 
                    onClick={() => setActiveView('add-mark')}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    Add Mark
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="btn" onClick={() => setActiveView('dashboard')} style={{ marginTop: '1rem' }}>
        Back to Dashboard
      </button>
    </div>
  );

  const renderMarks = () => (
    <div className="table-container">
      <h2>All Marks</h2>
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : marks.length === 0 ? (
        <p>No marks found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject</th>
              <th>Test Type</th>
              <th>Score</th>
              <th>Max Score</th>
              <th>Semester</th>
              <th>Teacher</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {marks.map(mark => (
              <tr key={mark._id}>
                <td>{mark.studentId?.firstName} {mark.studentId?.lastName}</td>
                <td>{mark.subject}</td>
                <td>{mark.testType}</td>
                <td>{mark.score}</td>
                <td>{mark.maxScore}</td>
                <td>{mark.semester}</td>
                <td>{mark.teacherId?.firstName} {mark.teacherId?.lastName}</td>
                <td>{new Date(mark.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="btn" onClick={() => setActiveView('dashboard')} style={{ marginTop: '1rem' }}>
        Back to Dashboard
      </button>
    </div>
  );

  const renderAddMark = () => (
    <div className="table-container">
      <h2>Add New Mark</h2>
      <form onSubmit={handleMarkSubmit}>
        <div className="form-group">
          <label>Student</label>
          <select name="studentId" required>
            <option value="">Select a student</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName} - {student.grade}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Subject</label>
          <input type="text" name="subject" required placeholder="e.g., Mathematics" />
        </div>
        <div className="form-group">
          <label>Test Type</label>
          <select name="testType" required>
            <option value="">Select test type</option>
            <option value="quiz">Quiz</option>
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
            <option value="project">Project</option>
          </select>
        </div>
        <div className="form-group">
          <label>Score</label>
          <input type="number" name="score" required min="0" max="100" />
        </div>
        <div className="form-group">
          <label>Max Score</label>
          <input type="number" name="maxScore" defaultValue="100" min="1" />
        </div>
        <div className="form-group">
          <label>Semester</label>
          <input type="text" name="semester" required placeholder="e.g., Fall 2024" />
        </div>
        <div className="form-group">
          <label>Academic Year</label>
          <input type="text" name="academicYear" required placeholder="e.g., 2024-2025" />
        </div>
        <div className="form-group">
          <label>Comments</label>
          <textarea name="comments" placeholder="Optional comments" rows="3"></textarea>
        </div>
        <button type="submit" className="btn">Add Mark</button>
      </form>
      <button className="btn" onClick={() => setActiveView('dashboard')} style={{ marginTop: '1rem' }}>
        Back to Dashboard
      </button>
    </div>
  );

  const renderClaims = () => (
    <div className="table-container">
      <h2>All Claims</h2>
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : claims.length === 0 ? (
        <p>No claims found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Title</th>
              <th>Subject</th>
              <th>Original Score</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(claim => (
              <tr key={claim._id}>
                <td>{claim.studentId?.firstName} {claim.studentId?.lastName}</td>
                <td>{claim.title}</td>
                <td>{claim.markId?.subject}</td>
                <td>{claim.markId?.score}/{claim.markId?.maxScore}</td>
                <td>
                  <span className={`status-badge status-${claim.status}`}>
                    {claim.status}
                  </span>
                </td>
                <td>{new Date(claim.submittedAt).toLocaleDateString()}</td>
                <td>
                  {claim.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn" 
                        onClick={() => {
                          const comments = prompt('Enter review comments for approval:');
                          if (comments) {
                            handleClaimReview(claim._id, 'approved', comments);
                          }
                        }}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#27ae60' }}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn" 
                        onClick={() => {
                          const comments = prompt('Enter review comments for rejection:');
                          if (comments) {
                            handleClaimReview(claim._id, 'rejected', comments);
                          }
                        }}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#e74c3c' }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="btn" onClick={() => setActiveView('dashboard')} style={{ marginTop: '1rem' }}>
        Back to Dashboard
      </button>
    </div>
  );

  const renderBulletins = () => (
    <div className="table-container">
      <h2>Generate Bulletin</h2>
      <form onSubmit={handleBulletinGenerate}>
        <div className="form-group">
          <label>Student</label>
          <select name="studentId" required>
            <option value="">Select a student</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName} - {student.grade}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Semester</label>
          <input type="text" name="semester" required placeholder="e.g., Fall 2024" />
        </div>
        <div className="form-group">
          <label>Academic Year</label>
          <input type="text" name="academicYear" required placeholder="e.g., 2024-2025" />
        </div>
        <button type="submit" className="btn">Generate Bulletin</button>
      </form>
      <button className="btn" onClick={() => setActiveView('dashboard')} style={{ marginTop: '1rem' }}>
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div>
      <header className="navbar">
        <h2><i className='bx bx-chalkboard'></i> Teacher Dashboard - {user.firstName} {user.lastName}</h2>
        <nav>
          <button className="btn" onClick={logout}>Logout</button>
        </nav>
      </header>
      <main>
        {error && <div className="error-message" style={{ textAlign: 'center', margin: '1rem' }}>{error}</div>}
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'students' && renderStudents()}
        {activeView === 'marks' && renderMarks()}
        {activeView === 'add-mark' && renderAddMark()}
        {activeView === 'claims' && renderClaims()}
        {activeView === 'bulletins' && renderBulletins()}
      </main>
    </div>
  );
};

export default TeacherDashboard;
