import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Activity, CheckCircle2, AlertTriangle, FileText, MapPin, Building2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ReportCard from '../../components/dashboard/ReportCard';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

const CitizenDashboard = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'in_progress', 'resolved'

    useEffect(() => {
        const fetchNagarpalikaReports = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const nagarpalikaName = encodeURIComponent(user?.area);

                // Fetch ALL reports for the citizen's nagarpalika (civic + illegal)
                const [civicRes, illegalRes] = await Promise.allSettled([
                    fetch(`http://localhost:5000/api/issues/nagarpalika?name=${nagarpalikaName}`, { headers }).then(r => r.json()),
                    fetch(`http://localhost:5000/api/illegal/nagarpalika?name=${nagarpalikaName}`, { headers }).then(r => r.json()),
                ]);

                const civicIssues = civicRes.status === 'fulfilled' ? civicRes.value.map(i => ({ ...i, _type: 'civic' })) : [];
                const illegalReports = illegalRes.status === 'fulfilled' ? illegalRes.value.map(i => ({ ...i, _type: 'illegal' })) : [];

                // Merge and sort by newest first
                const all = [...civicIssues, ...illegalReports].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setReports(all);
            } catch {}
            finally { setIsLoading(false); }
        };
        if (user?.area) fetchNagarpalikaReports();
    }, [user]);

    // Compute stats from ALL nagarpalika reports
    const totalReports = reports.length;
    const inProgressCount = reports.filter(r => r.status === 'IN_PROGRESS').length;
    const resolvedCount = reports.filter(r => r.status === 'APPROVED' || r.status === 'RESOLVED').length;
    const pendingCount = reports.filter(r => r.status === 'SUBMITTED').length;

    const stats = [
        { label: 'Total Reports', value: totalReports, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100/50', filter: 'all' },
        { label: 'In Progress', value: inProgressCount, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-100/50', filter: 'in_progress' },
        { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100/50', filter: 'resolved' },
        { label: 'Pending', value: pendingCount, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100/50', filter: 'pending' },
    ];

    // Filter reports based on active filter
    const filteredReports = reports.filter(r => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'pending') return r.status === 'SUBMITTED';
        if (activeFilter === 'in_progress') return r.status === 'IN_PROGRESS';
        if (activeFilter === 'resolved') return r.status === 'APPROVED' || r.status === 'RESOLVED';
        return true;
    });
    
    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Citizen Dashboard</h1>
                        <p className="text-neutral-500 mt-1 flex items-center gap-1.5">
                            <Building2 size={16} className="text-secondary" />
                            <span className="font-semibold text-secondary">{user?.area}</span>
                            <span className="mx-1">·</span>
                            <MapPin size={14} /> {user?.taluka} Taluka
                        </p>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                        <Link to="/dashboard/reports">
                            <Button variant="outline" className="py-2.5 px-5">
                                <User size={18} />
                                My Reports
                            </Button>
                        </Link>
                        <Link to="/report-civic-issue">
                            <Button variant="primary" className="py-2.5 px-5 shadow-lg shadow-secondary/20 hover:shadow-secondary/30 transition-shadow">
                                <Plus size={18} />
                                New Report
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Nagarpalika Overview Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-secondary/10 via-primary/5 to-secondary/10 border border-secondary/20 rounded-2xl p-4 flex items-center gap-3"
                >
                    <div className="p-2 bg-secondary/20 rounded-xl">
                        <Building2 size={20} className="text-secondary" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-neutral-800">Nagarpalika Progress Overview</p>
                        <p className="text-xs text-neutral-500">Showing all civic issues and illegal reports across <span className="font-semibold text-secondary">{user?.area}</span></p>
                    </div>
                </motion.div>

                {/* Stats Grid — clickable to filter */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {stats.map((stat, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setActiveFilter(stat.filter)}
                            className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-pointer ${
                                activeFilter === stat.filter ? 'border-secondary/50 ring-2 ring-secondary/20' : 'border-neutral-200'
                            }`}
                        >
                            <div className={`absolute -right-6 -top-6 w-24 h-24 ${stat.bg} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none`}></div>
                            <div className="relative z-10 flex items-center justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${stat.bg} border border-white/40 shadow-sm`}>
                                    <stat.icon size={22} className={stat.color} />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</h3>
                                <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Reports Section */}
                <div className="pt-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-neutral-900">
                            {activeFilter === 'all' && 'All Nagarpalika Reports'}
                            {activeFilter === 'pending' && 'Pending Reports'}
                            {activeFilter === 'in_progress' && 'In Progress Reports'}
                            {activeFilter === 'resolved' && 'Resolved Reports'}
                        </h2>
                        <Link to="/issues" className="text-sm text-secondary font-semibold hover:text-primary transition-colors hover:underline">
                            Community Feed →
                        </Link>
                    </div>
                    
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-10 text-neutral-400">Loading nagarpalika reports...</div>
                        ) : filteredReports.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="bg-white border border-neutral-200 border-dashed rounded-3xl p-12 text-center"
                            >
                                <div className="w-20 h-20 bg-blue-50 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FileText size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">No Reports Found</h3>
                                <p className="text-neutral-500 max-w-sm mx-auto mb-8">
                                    {activeFilter === 'all'
                                        ? `No reports have been submitted in ${user?.area} yet. Be the first!`
                                        : `No ${activeFilter.replace('_', ' ')} reports at the moment.`
                                    }
                                </p>
                                <Link to="/report-civic-issue">
                                    <Button variant="outline">Create a Report</Button>
                                </Link>
                            </motion.div>
                        ) : (
                            filteredReports.slice(0, 10).map((report, index) => (
                                <ReportCard key={report._id} report={{
                                    id: report._id,
                                    title: report.title,
                                    type: report.issueType || report.category,
                                    date: new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                    location: report.location,
                                    description: report.description,
                                    statusIndex: report._type === 'illegal'
                                        ? ['SUBMITTED','IN_PROGRESS','RESOLVED'].indexOf(report.status)
                                        : ['SUBMITTED','IN_PROGRESS','PENDING_FUNDS','PENDING_APPROVAL','APPROVED'].indexOf(report.status),
                                    totalSteps: report._type === 'illegal' ? 3 : 5,
                                    lastUpdated: new Date(report.updatedAt).toLocaleDateString(),
                                    reportType: report._type,
                                }} delay={index * 0.1 + 0.3} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CitizenDashboard;
