import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const [authorities, setAuthorities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('superAdminToken');

  useEffect(() => {
    if (!token) {
      navigate('/superadmin/login');
      return;
    }
    fetchPendingAuthorities();
  }, [token, navigate]);

  const fetchPendingAuthorities = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/api/superadmin/pending-authorities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('superAdminToken');
          navigate('/superadmin/login');
        } else {
          setError(data.error || 'Failed to fetch pending requests.');
        }
      } else {
        setAuthorities(data.authorities);
      }
    } catch (err) {
      setError('Network error while fetching authorities.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const endpoint = action === 'approve' 
        ? `/api/superadmin/approve-authority/${id}` 
        : `/api/superadmin/reject-authority/${id}`;
        
      const res = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        setAuthorities(prev => prev.filter(a => a.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${action} authority`);
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const logout = () => {
    localStorage.removeItem('superAdminToken');
    navigate('/superadmin/login');
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f5f7fa', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#1a1f36' }}>👑 Super Admin Dashboard</h1>
        <button 
          onClick={logout}
          style={{ padding: '8px 16px', background: '#e0e6ed', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #edf2f7' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#4a5568' }}>Pending Authority Registrations</h2>
        </div>
        
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>Loading...</div>
        ) : authorities.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>No pending requests at this time.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={{ padding: '12px 20px', borderBottom: '1px solid #edf2f7', color: '#4a5568', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 20px', borderBottom: '1px solid #edf2f7', color: '#4a5568', fontWeight: 600 }}>Employee ID</th>
                <th style={{ padding: '12px 20px', borderBottom: '1px solid #edf2f7', color: '#4a5568', fontWeight: 600 }}>Location</th>
                <th style={{ padding: '12px 20px', borderBottom: '1px solid #edf2f7', color: '#4a5568', fontWeight: 600 }}>Contact</th>
                <th style={{ padding: '12px 20px', borderBottom: '1px solid #edf2f7', color: '#4a5568', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {authorities.map(auth => (
                <tr key={auth.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '16px 20px' }}>{auth.full_name}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {auth.employee_id}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div>{auth.municipality} - {auth.ward}</div>
                    <div style={{ fontSize: '0.85rem', color: '#718096' }}>{auth.district}, {auth.state} ({auth.pincode})</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div>{auth.email}</div>
                    <div style={{ fontSize: '0.85rem', color: '#718096' }}>{auth.phone}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleAction(auth.id, 'approve')}
                        style={{ padding: '6px 12px', background: '#48bb78', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleAction(auth.id, 'reject')}
                        style={{ padding: '6px 12px', background: '#f56565', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
