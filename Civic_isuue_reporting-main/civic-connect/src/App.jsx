import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/home/Hero';
import StatsBanner from './components/home/StatsBanner';
import ServicesGrid from './components/home/ServicesGrid';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ReportCivicIssue from './pages/reports/ReportCivicIssue';
import ReportIllegalActivity from './pages/reports/ReportIllegalActivity';
import CitizenDashboard from './pages/dashboard/CitizenDashboard';
import IssuesFeed from './pages/issues/IssuesFeed';
import Settings from './pages/dashboard/Settings';
import MyReports from './pages/dashboard/MyReports';
import IssueDetailPage from './pages/issues/IssueDetailPage';

// Import AuthProvider
import { AuthProvider, useAuth } from './context/AuthContext';

// Protect routes that require authentication
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <div>Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Redirect logged-in users away from auth pages
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <div>Loading...</div>;
    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function HomePage() {
    return (
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-secondary/30">
            <Navbar />
            <main>
                <Hero />
                <StatsBanner />
                <ServicesGrid />
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<HomePage />} />
                
                {/* Public Only Routes */}
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

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <CitizenDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/reports" element={
                    <ProtectedRoute>
                        <MyReports />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/settings" element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                } />
                <Route path="/report-civic-issue" element={
                    <ProtectedRoute>
                        <ReportCivicIssue />
                    </ProtectedRoute>
                } />
                <Route path="/report-illegal-activity" element={
                    <ProtectedRoute>
                        <ReportIllegalActivity />
                    </ProtectedRoute>
                } />
                <Route path="/issues" element={
                    <ProtectedRoute>
                        <IssuesFeed />
                    </ProtectedRoute>
                } />
                <Route path="/issues/:id" element={
                    <ProtectedRoute>
                        <IssueDetailPage />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
