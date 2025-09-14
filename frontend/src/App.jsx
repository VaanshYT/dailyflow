import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

const AuthPages = () => {
  const { isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return isLogin ? (
    <Login onToggleMode={() => setIsLogin(false)} />
  ) : (
    <Signup onToggleMode={() => setIsLogin(true)} />
  );
};

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar />
        <AuthPages />
      </div>
    </AuthProvider>
  );
};

export default App;