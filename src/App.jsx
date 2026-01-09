import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import ChatInterface from './components/Chat/ChatInterface';
import RoomSelection from './components/RoomSelection/RoomSelection';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-600">Loading...</div>;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Check if already logged in
const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/chat" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/chat" element={<Navigate to="/rooms" replace />} />
            <Route path="/chat/room/:roomId" element={
              <ProtectedRoute>
                <ChatInterface />
              </ProtectedRoute>
            } />
            <Route path="/rooms" element={
              <ProtectedRoute>
                <RoomSelection />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/rooms" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
