import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, AlertTriangle, FileText, ArrowUpRight, Clock, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

const statusColors = {
    SUBMITTED:        'bg-slate-100 text-slate-600 border-slate-200',
    IN_PROGRESS:      'bg-orange-50 text-orange-600 border-orange-200',
    PENDING_FUNDS:    'bg-red-50 text-red-600 border-red-200',
    PENDING_APPROVAL: 'bg-purple-50 text-purple-600 border-purple-200',
    APPROVED:         'bg-green-50 text-green-600 border-green-200',
    RESOLVED:         'bg-green-50 text-green-600 border-green-200',
};
const statusLabels = {
    SUBMITTED: 'New', IN_PROGRESS: 'In Progress',
    PENDING_FUNDS: 'Funds Needed', PENDING_APPROVAL: 'Under Review',
    APPROVED: 'Resolved', RESOLVED: 'Resolved',
};

const MunicipalDashboard = () => {
    const navigate = useNavigate();
    const { isDistrictAuthority, admin } = useAdminAuth();
    const isSuperAdmin = isDistrictAuthority;

    const [issues, setIssues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchIssues = async () => {
            if (!isSuperAdmin && !admin?.name) return;
            try {
                const token = localStorage.getItem('adminToken');
                const params = new URLSearchParams();
                if (!isSuperAdmin && admin?.name) params.set('nagarpalika', admin.name.trim());

                const headers = { Authorization: `Bearer ${token}` };

                if (isSuperAdmin) {
                    // District authority only sees civic issues on this dashboard
                    // Illegal reports are accessible via Nagarpalika Reports page
                    const civicRes = await fetch(`http://localhost:5000/api/issues/admin/all?${params}`, { headers }).then(r => r.json());
                    setIssues(Array.isArray(civicRes) ? civicRes.map(i => ({ ...i, _type: 'civic' })) : []);
                } else {
                    // Nagarpalika sees both civic + illegal
                    const [civicRes, illegalRes] = await Promise.allSettled([
                        fetch(`http://localhost:5000/api/issues/admin/all?${params}`, { headers }).then(r => r.json()),
                        fetch(`http://localhost:5000/api/illegal/admin/all?${params}`, { headers }).then(r => r.json()),
                    ]);

                    const civicIssues = civicRes.status === 'fulfilled' ? civicRes.value.map(i => ({ ...i, _type: 'civic' })) : [];
                    const illegalReports = illegalRes.status === 'fulfilled' ? illegalRes.value.map(i => ({ ...i, _type: 'illegal' })) : [];

                    const all = [...civicIssues, ...illegalReports].sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    setIssues(all);
                }
            } catch {}
            finally { setIsLoading(false); }
        };
        fetchIssues();
    }, [isSuperAdmin, admin?.name]);

    const total = issues.length;
    const inProgress = issues.filter(r => r.status === 'IN_PROGRESS').length;
    const resolved = issues.filter(r => r.status === 'APPROVED' || r.status === 'RESOLVED').length;
    const pendingApproval = issues.filter(r => r.status === 'PENDING_APPROVAL').length;
    const pendingFunds = issues.filter(r => r.status === 'PENDING_FUNDS').length;

    const stats = [
        { label: 'Total Reports', value: total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100/50' },
        { label: isSuperAdmin ? 'Awaiting Approval' : 'In Progress', value: isSuperAdmin ? pendingApproval : inProgress, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-100/50' },
        { label: 'Resolved', value: resolved, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100/50' },
        { label: isSuperAdmin ? 'Fund Requests' : 'Pending Funds', value: pendingFunds, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100/50' },
    ];

    const recentIssues = issues
        .filter(r => r.status !== 'APPROVED')
        .slice(0, 5);

    const detailBase = isSuperAdmin ? '/dashboard/district-reports' : '/dashboard/workspace';

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {isSuperAdmin ? 'District Overview' : `${admin?.name || 'Nagarpalika'} Overview`}
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            {isSuperAdmin
                                ? "Here's what is happening across Pune District today."
                                : "Here is the current status of issues in your jurisdiction."
                            }
                        </p>
                    </motion.div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                        >
                            <div className={`absolute -right-6 -top-6 w-24 h-24 ${stat.bg} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none`} />
                            <div className="relative z-10 flex items-center justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${stat.bg} border border-white/40 shadow-sm`}>
                                    <stat.icon size={22} className={stat.color} />
                                </div>
                                <ArrowUpRight size={14} className="text-green-600" />
                            </div>
                            <div className="relative z-10">
                                {isLoading
                                    ? <div className="h-8 w-12 bg-slate-100 rounded animate-pulse mb-1" />
                                    : <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                                }
                                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Issues */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">Requires Attention</h2>
                            <Link to={detailBase} className="text-sm text-primary font-semibold hover:underline">View All</Link>
                        </div>
                        <div className="flex-1">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 size={24} className="animate-spin text-primary" />
                                </div>
                            ) : recentIssues.length > 0 ? (
                                <ul className="divide-y divide-slate-100">
                                    {recentIssues.map((issue) => (
                                        <li
                                            key={issue._id}
                                            onClick={() => navigate(`${detailBase}/${issue._id}`)}
                                            className="p-4 sm:p-5 hover:bg-slate-50 cursor-pointer transition-colors group flex items-start gap-4"
                                        >
                                            <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-xl bg-slate-100 items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <AlertTriangle size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-bold text-slate-900 truncate pr-4 group-hover:text-primary transition-colors">{issue.title}</p>
                                                    <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusColors[issue.status]}`}>
                                                        {statusLabels[issue.status]}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate mb-1">{issue.location} · {issue._type === 'illegal' ? 'Illegal' : 'Civic'}</p>
                                                <div className="flex items-center text-[11px] font-medium text-slate-400">
                                                    <Clock size={11} className="mr-1" />
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                    {isSuperAdmin && <span className="ml-2 pl-2 border-l border-slate-200">Nagarpalika: <strong className="text-slate-600">{issue.nagarpalika}</strong></span>}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <CheckCircle2 size={32} className="mx-auto mb-3 text-green-400 opacity-50" />
                                    <p className="font-medium">All caught up!</p>
                                    <p className="text-sm">No pending issues requiring attention.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Widget */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                            <h3 className="text-lg font-bold mb-2">Performance Goal</h3>
                            <p className="text-white/70 text-sm mb-6 leading-relaxed">
                                Target: resolve all high-priority civic issues within 48 hours of reporting.
                            </p>
                            <div>
                                <div className="flex justify-between text-sm mb-1 font-semibold">
                                    <span>Resolution Rate</span>
                                    <span>{total > 0 ? Math.round((resolved / total) * 100) : 0}%</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-2">
                                    <div className="bg-green-400 h-2 rounded-full transition-all" style={{ width: `${total > 0 ? Math.round((resolved / total) * 100) : 0}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">System Status</h3>
                            <div className="flex items-center justify-between text-sm py-2">
                                <span className="text-slate-600 font-medium">Citizen Portal</span>
                                <span className="flex items-center text-green-600 font-bold text-xs"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" /> Online</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2">
                                <span className="text-slate-600 font-medium">District Database</span>
                                <span className="flex items-center text-green-600 font-bold text-xs"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5" /> Connected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MunicipalDashboard;
