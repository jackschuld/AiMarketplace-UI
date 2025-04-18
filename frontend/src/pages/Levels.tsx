import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Level } from '../types';
import { usePoints } from '../context/PointsContext';

const Levels: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();
  const { totalPoints, isLevelUnlocked } = usePoints();

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        if (!token) return;
        const response = await api.levels.getAll(token);
        if (response.success && response.data) {
          setLevels(response.data);
        } else {
          setError(response.error || 'Failed to fetch levels');
        }
      } catch (err) {
        setError('An error occurred while fetching levels');
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ 
          width: '3rem', 
          height: '3rem', 
          border: '2px solid #4f46e5', 
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem',
      background: 'linear-gradient(to bottom, #f5f3ff, #ffffff)',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '2rem',
        color: '#4f46e5',
        textAlign: 'center',
        fontFamily: "'Righteous', 'Poppins', sans-serif",
        letterSpacing: '0.5px'
      }}>
        AI Marketplace
      </h1>
      
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px rgba(79, 70, 229, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        maxWidth: '600px',
        margin: '0 auto 2rem auto'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem',
          fontFamily: "'Righteous', 'Poppins', sans-serif",
          letterSpacing: '0.5px'
        }}>
          Your Progress
        </h2>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ 
            backgroundColor: 'rgba(79, 70, 229, 0.1)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '9999px',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#4f46e5',
            fontFamily: "'Poppins', sans-serif"
          }}>
            {totalPoints} points
          </span>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {levels.map((level) => (
          <div
            key={level.id}
            onClick={() => isLevelUnlocked(level) ? navigate(`/chat/${level.id}`) : null}
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px rgba(79, 70, 229, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              cursor: isLevelUnlocked(level) ? 'pointer' : 'not-allowed',
              border: '1px solid rgba(79, 70, 229, 0.1)',
              position: 'relative',
              opacity: isLevelUnlocked(level) ? 1 : 0.7
            }}
            onMouseOver={(e) => {
              if (isLevelUnlocked(level)) {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(79, 70, 229, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (isLevelUnlocked(level)) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(79, 70, 229, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)';
              }
            }}
          >
            {!isLevelUnlocked(level) && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                textAlign: 'center',
                zIndex: 1
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
                <div>Required Points: {level.requiredPoints}</div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  You need {level.requiredPoints - totalPoints} more points
                </div>
              </div>
            )}
            <div style={{ position: 'relative' }}>
              {/* <img
                src={level.imageUrl}
                alt={level.name}
                style={{ width: '100%', height: '12rem', objectFit: 'cover' }}
              /> */}
              <div style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                backgroundColor: 'rgba(79, 70, 229, 0.9)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                ${level.initialPrice.toFixed(2)}
              </div>
              {level.isCompleted && (
                <div style={{
                  position: 'absolute',
                  top: '0.75rem',
                  left: '0.75rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.9)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span>Completed</span>
                  {level.stars !== null && (
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {'⭐'.repeat(level.stars)}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '500', 
                marginBottom: '0.5rem',
                marginTop: '1.5rem',
                color: '#1f2937',
                fontFamily: "'Righteous', 'Poppins', sans-serif",
                letterSpacing: '0.5px'
              }}>
                {level.name}
              </h2>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.875rem', 
                marginBottom: '1rem',
                lineHeight: '1.5',
                fontFamily: "'Poppins', sans-serif"
              }}>
                {level.productDescription || level.description}
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  Seller: {level.sellerName || level.vendorPersonality || 'Unknown'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280' 
                }}>
                  Target: ${level.targetPrice.toFixed(2)}
                </span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280' 
                }}>
                  Initial: ${level.initialPrice.toFixed(2)}
                </span>
              </div>
              
              {/* User progress section */}
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500',
                    color: '#4f46e5'
                  }}>
                    Your Progress
                  </span>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500',
                    color: level.isCompleted ? '#10b981' : '#6b7280'
                  }}>
                    {level.isCompleted ? 'Completed' : level.isStarted ? 'In Progress' : 'Not Started'}
                  </span>
                </div>
                
                {level.isStarted && (
                  <>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Points:</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#1f2937' }}>
                        {level.points}
                      </span>
                    </div>
                    
                    {level.lastOfferedPrice !== null && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.25rem'
                      }}>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Last Offer:</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#1f2937' }}>
                          ${level.lastOfferedPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {level.vendorOfferedPrice !== null && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.25rem'
                      }}>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Vendor Offer:</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#1f2937' }}>
                          ${level.vendorOfferedPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Messages:</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#1f2937' }}>
                        {level.totalMessages} total
                      </span>
                    </div>
                  </>
                )}
                
                {!level.isStarted && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Required Points:</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#1f2937' }}>
                      {level.requiredPoints}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Levels; 