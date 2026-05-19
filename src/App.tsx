import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AdminApp from './apps/admin/AdminApp';
import RiderApp from './apps/rider/RiderApp';
import Login from './components/auth/Login';

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/rider/*" element={<RiderApp />} />
      <Route path="/" element={<Navigate to={profile.role === 'admin' ? '/admin' : '/rider'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
