import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = ({ user, logout }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [marks, setMarks] = useState([]);
  const [claims, setClaims] = useState([]);
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    if (activeView === 'marks') {
      fetchMarks();
    } else if (activeView === 'claims') {
      fetchClaims();
    } else if (activeView === 'bulletins') {
      fetchBulletins();
    }
  }, [activeView]);

  const fetchMarks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/marks/student/${user.id}`, {
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

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/claims/student/${user.id}`, {
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

  const fetchBulletins = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/bulletins/student/${user.id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setBulletins(data.bulletins);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch bulletins');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const claimData = {
      markId: formData.get('markId'),
      title: formData.get('title'),
      description: formData.get('description')
    };

    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(claimData)
      });
      const data = await response.json();
      if (response.ok) {
        alert('Claim submitted successfully');
        e.target.reset();
        fetchClaims();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to submit claim');
    }
  };

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="card" onClick={() => setActiveView('marks')}>
        <i className='bx bx-book'></i>
        <h3>View Marks</h3>
        <p>Check your subject marks</p>
      </div>
      <div className="card" onClick={() => setActiveView('claims')}>
        <i className='bx bx-error'></i>
        <h3>Claims</h3>
        <p>Submit and track claims</p>
      </div>
      <div className="card" onClick={() => setActiveView('bulletins')}>
        <i className='bx bx-file'></i>
        <h3>Bulletins</h3>
        <p>View generated bulletins</p>
      </div>
    </div>
  );

  const renderMarks = () => (
    <div className="table-container">
      <h2>Your Marks</h2>
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : marks.length === 0 ? (
        <p>No marks available</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Test Type</th>
              <th>Score</th>
              <th>Max Score</th>
              <th>Teacher</th>
              <th>Date</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {marks.map(mark => (
              <tr key={mark._id}>
                <td>{mark.subject}</td>
                <td>{mark.testType}</td>
                <td>{mark.score}</td>
                <td>{mark.maxScore}</td>
                <td>{mark.teacherId?.firstName} {mark.teacherId?.lastName}</td>
                <td>{new Date(mark.date).toLocaleDateString()}</td>
                <td>{mark.comments || '-'}</td>
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

  const renderClaims = () => (
    <div className="table-container">
      <h2>Claims</h2>
      
      <form onSubmit={handleClaimSubmit} style={{ marginBottom: '2rem' }}>
        <h3>Submit New Claim</h3>
        <div className="form-group">
          <label>Select Mark</label>
          <select name="markId" required>
            <option value="">Select a mark to claim</option>
            {marks.map(mark => (
              <option key={mark._id} value={mark._id}>
                {mark.subject} - {mark.testType} ({mark.score}/{mark.maxScore})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" required placeholder="Claim title" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" required placeholder="Describe your claim" rows="3"></textarea>
        </div>
        <button type="submit" className="btn">Submit Claim</button>
      </form>

      <h3>Your Claims</h3>
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : claims.length === 0 ? (
        <p>No claims submitted</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Review Comments</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(claim => (
              <tr key={claim._id}>
                <td>{claim.title}</td>
                <td>{claim.markId?.subject}</td>
                <td>
                  <span className={`status-badge status-${claim.status}`}>
                    {claim.status}
                  </span>
                </td>
                <td>{new Date(claim.submittedAt).toLocaleDateString()}</td>
                <td>{claim.reviewComments || '-'}</td>
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
      <h2>Your Bulletins</h2>
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : bulletins.length === 0 ? (
        <p>No bulletins available</p>
      ) : (
        bulletins.map(bulletin => (
          <div key={bulletin._id} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #e1e1e1', borderRadius: '8px' }}>
            <h3>{bulletin.semester} - {bulletin.academicYear}</h3>
            <p><strong>Overall Average:</strong> {bulletin.overallAverage.toFixed(2)}%</p>
            <p><strong>Grade:</strong> <span className="status-badge status-approved">{bulletin.grade}</span></p>
            <p><strong>Generated:</strong> {new Date(bulletin.generatedAt).toLocaleDateString()}</p>
            
            <h4>Subjects:</h4>
            <table style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Average</th>
                </tr>
              </thead>
              <tbody>
                {bulletin.subjects.map((subject, index) => (
                  <tr key={index}>
                    <td>{subject.subjectName}</td>
                    <td>{subject.teacherName}</td>
                    <td>{subject.averageScore.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
      <button className="btn" onClick={() => setActiveView('dashboard')} style={{ marginTop: '1rem' }}>
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div>
      <header className="navbar">
        <h2><i className='bx bx-user'></i> Student Dashboard - {user.firstName} {user.lastName}</h2>
        <nav>
          <button className="btn" onClick={logout}>Logout</button>
        </nav>
      </header>
      <main>
        {error && <div className="error-message" style={{ textAlign: 'center', margin: '1rem' }}>{error}</div>}
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'marks' && renderMarks()}
        {activeView === 'claims' && renderClaims()}
        {activeView === 'bulletins' && renderBulletins()}
      </main>
    </div>
  );
};

export default StudentDashboard;
