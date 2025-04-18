import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.auth.login(email, password);
      if (response.success && response.data) {
        login(response.data.token, response.data.user);
        navigate('/levels');
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container" style={{ maxWidth: '400px' }}>
        <div>
          <h2 className="text-center" style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            marginBottom: '2rem',
            fontFamily: "'Righteous', 'Poppins', sans-serif",
            letterSpacing: '0.5px'
          }}>
            Sign in to your account
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email-address" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontFamily: "'Poppins', sans-serif"
            }}>
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontFamily: "'Poppins', sans-serif"
            }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <div style={{ color: '#ef4444', marginBottom: '1rem', fontFamily: "'Poppins', sans-serif" }}>
              {error}
            </div>
          )}
          <div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Sign in
            </button>
          </div>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontFamily: "'Poppins', sans-serif" }}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#4f46e5', textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 