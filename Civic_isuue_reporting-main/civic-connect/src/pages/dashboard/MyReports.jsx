import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, AlertTriangle, CheckCircle2, Loader2, ArrowLeft,
    Clock, Activity, SlidersHorizontal
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ReportCard from '../../components/dashboard/ReportCard';
import Button from '../../components/common/Button';

const statusFilters = [
    { key: 'all',         label: 'All',         icon: SlidersHorizontal },
    { key: 'latest',      label: 'Latest',      icon: Clock },
    { key: 'pending',     label: 'Pending',     icon: AlertTriangle },
    { key: 'in_progress', label: 'In Progress', icon: Activity },
    { key: 'resolved',    label: 'Resolved',    icon: CheckCircle2 },
];

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [civicRes, illegalRes] = await Promise.allSettled([
                    fetch('http://localhost:5000/api/issues/my', { headers }).then(r => r.json()),
                    fetch('http://localhost:5000/api/illegal/my', { headers }).then(r => r.json()),
                ]);

                const civicIssues = civicRes.status === 'fulfilled' ? civicRes.value.map(i => ({ ...i, _type: 'civic' })) : [];
                const illegalReports = illegalRes.status === 'fulfilled' ? illegalRes.value.map(i => ({ ...i, _type: 'illegal' })) : [];

                const all = [...civicIssues, ...illegalReports].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setReports(all);
            } catch {}
            finally { setIsLoading(false); }
        };
        fetchIssues();
    }, []);

    // Status counts
    const statusCounts = useMemo(() => ({
        all: reports.length,
        latest: reports.length,
        pending: reports.filter(r => r.status === 'SUBMITTED').length,
        in_progress: reports.filter(r => r.status === 'IN_PROGRESS' || r.status === 'PENDING_FUNDS' || r.status === 'PENDING_APPROVAL').length,
        resolved: reports.filter(r => r.status === 'APPROVED' || r.status === 'RESOLVED').length,
    }), [reports]);

    // Filtered reports
    const filtered = useMemo(() => {
        let result = [...reports];

        if (statusFilter === 'pending') {
            result = result.filter(r => r.status === 'SUBMITTED');
        } else if (statusFilter === 'in_progress') {
            result = result.filter(r => r.status === 'IN_PROGRESS' || r.status === 'PENDING_FUNDS' || r.status === 'PENDING_APPROVAL');
        } else if (statusFilter === 'resolved') {
            result = result.filter(r => r.status === 'APPROVED' || r.status === 'RESOLVED');
        }

        // "Latest" sorts by newest first (default is already newest first, but enforce it)
        if (statusFilter === 'latest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
    }, [reports, statusFilter]);

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                   <button
                     onClick={() => navigate(-1)}
                     className="flex items-center gap-2 text-primary hover:text-secondary font-medium mb-4 transition-colors"
                   >
                     <ArrowLeft className="w-4 h-4" />
                     Back to Dashboard
                   </button>
                    <h1 className="text-2xl font-bold text-neutral-900">My Reports</h1>
                    <p className="text-neutral-500 mt-1 text-sm">View and track all your submitted issues and activities.</p>
                </div>

                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2">
                    {statusFilters.map(f => {
                        const isActive = statusFilter === f.key;
                        const count = statusCounts[f.key];
                        return (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full border transition-all ${
                                    isActive
                                        ? 'bg-secondary text-white border-secondary shadow-sm shadow-secondary/20'
                                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-secondary/40 hover:text-secondary'
                                }`}
                            >
                                <f.icon size={13} className={isActive ? 'text-white' : ''} />
                                {f.label}
                                {f.key !== 'latest' && (
                                    <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin text-secondary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-neutral-400">
                        <FileText size={48} className="mx-auto mb-4 opacity-40" />
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">
                            {statusFilter !== 'all' ? 'No Matching Reports' : 'No Reports Found'}
                        </h3>
                        <p className="max-w-xs mx-auto mb-6 text-sm">
                            {statusFilter !== 'all'
                                ? `You don't have any ${statusFilters.find(f => f.key === statusFilter)?.label.toLowerCase()} reports.`
                                : "You haven't submitted any civic issues or illegal activities yet."
                            }
                        </p>
                        {statusFilter !== 'all' ? (
                            <Button variant="outline" onClick={() => setStatusFilter('all')}>Show All Reports</Button>
                        ) : (
                            <Link to="/report-civic-issue">
                                <Button variant="primary">Report an Issue</Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-xs text-neutral-400 font-medium">
                            {filtered.length} report{filtered.length !== 1 ? 's' : ''}
                            {statusFilter !== 'all' && statusFilter !== 'latest' ? ` · ${statusFilters.find(f => f.key === statusFilter)?.label}` : ''}
                        </p>
                        {filtered.map((report, index) => (
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
                            }} delay={index * 0.1} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MyReports;
