import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PointsProvider } from './context/PointsContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Levels from './pages/Levels';
import Chat from './pages/Chat';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PointsProvider>
        <Router>
          <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            <Navbar />
            <main className="container" style={{ padding: '0' }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/levels"
                  element={
                    <PrivateRoute>
                      <Levels />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/chat/:conversationId"
                  element={
                    <PrivateRoute>
                      <Chat />
                    </PrivateRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/levels" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </PointsProvider>
    </AuthProvider>
  );
};

export default App;
