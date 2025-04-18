import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePoints } from '../context/PointsContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalPoints } = usePoints();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: '#4f46e5',
      padding: '1rem',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/levels" style={{ 
          color: 'white', 
          textDecoration: 'none', 
          fontWeight: 'bold',
          fontSize: '1.25rem',
          marginRight: '2rem',
          fontFamily: "'Righteous', 'Poppins', sans-serif",
          letterSpacing: '0.5px'
        }}>
          AI Marketplace
        </Link>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: "'Poppins', sans-serif" }}>{user.username}</span>
              <span style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500',
                fontFamily: "'Poppins', sans-serif"
              }}>
                {totalPoints} pts
              </span>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar; 