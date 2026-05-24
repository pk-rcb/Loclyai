import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import CitizenAuth from './components/CitizenAuth';
import AuthorityAuth from './components/AuthorityAuth';
import CitizenAppContainer from './components/CitizenAppContainer';
import NotFound404 from './components/NotFound404';
import AccessDenied403 from './components/AccessDenied403';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import SuperAdminLogin from './components/SuperAdminLogin';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import AuthorityAppContainer from './components/AuthorityAppContainer';
import { useAuth } from './context/AuthContext';

const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.type === 'authority') {
    return <AuthorityAppContainer />;
  }
  return <CitizenAppContainer />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<CitizenAuth />} />
            <Route path="/authority-auth" element={<AuthorityAuth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/superadmin/login" element={<SuperAdminLogin />} />
            <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/citizen-dashboard" element={
              <ProtectedRoute allowedRoles={['citizen', 'authority']}>
                <DashboardRouter />
              </ProtectedRoute>
            } />
            <Route path="/access-denied" element={<AccessDenied403 />} />
            {/* Catch-all: any unknown route shows 404 */}
            <Route path="*" element={<NotFound404 />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
