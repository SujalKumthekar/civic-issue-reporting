import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLogin from './pages/auth/AdminLogin';
import AdminRegister from './pages/auth/AdminRegister';
import MunicipalDashboard from './pages/municipal/MunicipalDashboard';
import ReportManagement from './pages/municipal/ReportManagement';
import ReportDetail from './pages/municipal/ReportDetail';
import AddNagarpalika from './pages/municipal/AddNagarpalika';
import NagarpalikaReports from './pages/municipal/NagarpalikaReports';
import NagarpalikaMainDashboard from './components/dashboard/NagarpalikaMainDashboard';
import DistrictAuthorityMainDashboard from './components/district/DistrictAuthorityMainDashboard';

const ProtectedRoute = ({ children, districtOnly = false }) => {
  const { isAuthenticated, isDistrictAuthority, isLoading } = useAdminAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (districtOnly && !isDistrictAuthority) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AdminRegister /></PublicRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><MunicipalDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/workspace" element={<ProtectedRoute><ReportManagement defaultFilter="ALL" reportCategory="civic" /></ProtectedRoute>} />
        <Route path="/dashboard/illegal-activities" element={<ProtectedRoute><ReportManagement defaultFilter="ALL" reportCategory="illegal" /></ProtectedRoute>} />
        <Route path="/dashboard/district-reports" element={<ProtectedRoute><ReportManagement defaultFilter="ALL" reportCategory="civic" /></ProtectedRoute>} />
        <Route path="/dashboard/pending-funds" element={<ProtectedRoute><ReportManagement defaultFilter="PENDING_FUNDS" reportCategory="civic" /></ProtectedRoute>} />
        <Route path="/dashboard/approvals" element={<ProtectedRoute><ReportManagement defaultFilter="PENDING_APPROVAL" reportCategory="civic" /></ProtectedRoute>} />
        <Route path="/dashboard/:type/:id" element={<ProtectedRoute><ReportDetail /></ProtectedRoute>} />

        {/* District authority only */}
        <Route path="/dashboard/nagarpalikas" element={<ProtectedRoute districtOnly><AddNagarpalika /></ProtectedRoute>} />
        <Route path="/dashboard/nagarpalika-reports" element={<ProtectedRoute districtOnly><NagarpalikaReports /></ProtectedRoute>} />
        <Route path="/dashboard/nagarpalika-reports/:name" element={<ProtectedRoute districtOnly><NagarpalikaReports /></ProtectedRoute>} />
        <Route path="/dashboard/nagarpalika-reports/:name/:id" element={<ProtectedRoute districtOnly><ReportDetail /></ProtectedRoute>} />

        {/* New Enhanced Dashboards */}
        <Route path="/nagarpalika" element={<ProtectedRoute><NagarpalikaMainDashboard /></ProtectedRoute>} />
        <Route path="/district" element={<ProtectedRoute districtOnly><DistrictAuthorityMainDashboard /></ProtectedRoute>} />
      </Routes>
    </AdminAuthProvider>
  );
}

export default App;
