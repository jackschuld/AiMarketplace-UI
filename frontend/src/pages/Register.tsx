import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await api.auth.register(username, email, password);
      if (response.success && response.data) {
        login(response.data.token, response.data.user);
        navigate('/levels');
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
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
            Create your account
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="username" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontFamily: "'Poppins', sans-serif"
            }}>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="form-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
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
          <div style={{ marginBottom: '1rem' }}>
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
              autoComplete="new-password"
              required
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="confirm-password" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontFamily: "'Poppins', sans-serif"
            }}>
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="form-input"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Sign up
            </button>
          </div>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontFamily: "'Poppins', sans-serif" }}>
          <p>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4f46e5', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 