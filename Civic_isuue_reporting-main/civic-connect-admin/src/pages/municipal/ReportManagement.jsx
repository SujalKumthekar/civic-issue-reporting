import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, ChevronDown, FileText, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigate, useLocation } from 'react-router-dom';
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

const ReportManagement = ({ defaultFilter = 'ALL', reportCategory = 'all' }) => {
    const [issues, setIssues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(defaultFilter);
    const navigate = useNavigate();
    const location = useLocation();
    const { isDistrictAuthority, admin } = useAdminAuth();
    const isSuperAdmin = isDistrictAuthority;

    useEffect(() => { setStatusFilter(defaultFilter); }, [defaultFilter]);

    useEffect(() => {
        const fetchIssues = async () => {
            if (!isSuperAdmin && !admin?.name) return;
            setIsLoading(true);
            try {
                const token = localStorage.getItem('adminToken');
                const params = new URLSearchParams();
                if (!isSuperAdmin && admin?.name) params.set('nagarpalika', admin.name.trim());
                if (statusFilter !== 'ALL') params.set('status', statusFilter);

                const headers = { Authorization: `Bearer ${token}` };

                if (reportCategory === 'illegal') {
                    // Only fetch illegal reports
                    const res = await fetch(`http://localhost:5000/api/illegal/admin/all?${params}`, { headers });
                    const data = await res.json();
                    if (res.ok) setIssues(data.map(i => ({ ...i, _type: 'illegal' })));
                } else if (reportCategory === 'civic') {
                    // Only fetch civic issues
                    const res = await fetch(`http://localhost:5000/api/issues/admin/all?${params}`, { headers });
                    const data = await res.json();
                    if (res.ok) setIssues(data.map(i => ({ ...i, _type: 'civic' })));
                } else {
                    // Fetch both
                    const [civicRes, illegalRes] = await Promise.allSettled([
                        fetch(`http://localhost:5000/api/issues/admin/all?${params}`, { headers }).then(r => r.json()),
                        fetch(`http://localhost:5000/api/illegal/admin/all?${params}`, { headers }).then(r => r.json()),
                    ]);
                    const civicIssues = civicRes.status === 'fulfilled' ? civicRes.value.map(i => ({ ...i, _type: 'civic' })) : [];
                    const illegalReports = illegalRes.status === 'fulfilled' ? illegalRes.value.map(i => ({ ...i, _type: 'illegal' })) : [];
                    const all = [...civicIssues, ...illegalReports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setIssues(all);
                }
            } catch {}
            finally { setIsLoading(false); }
        };
        fetchIssues();
    }, [isSuperAdmin, admin?.name, reportCategory, statusFilter]);

    const pageTitle = useMemo(() => {
        if (!isSuperAdmin) return reportCategory === 'illegal' ? 'Illegal Activities' : 'Civic Issues';
        if (defaultFilter === 'PENDING_FUNDS') return 'Fund Requests';
        if (defaultFilter === 'PENDING_APPROVAL') return 'Pending Approvals';
        return 'District Reports';
    }, [isSuperAdmin, defaultFilter, reportCategory]);

    const filtered = useMemo(() => {
        if (!searchTerm) return issues;
        const s = searchTerm.toLowerCase();
        return issues.filter(i =>
            i.title?.toLowerCase().includes(s) ||
            i.location?.toLowerCase().includes(s) ||
            i._id?.toLowerCase().includes(s)
        );
    }, [issues, searchTerm]);

    const handleRowClick = (issue) => {
        const type = issue._type || 'civic';
        navigate(`${location.pathname}/${issue._id}?type=${type}`);
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{pageTitle}</h1>
                        <p className="text-slate-500 mt-1 text-sm">
                            {isSuperAdmin ? 'District-wide issue resolution portal' : `Managing tasks assigned to ${admin?.name}`}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search title or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-64 bg-white"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 pl-4 pr-10 py-2 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer font-medium"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="SUBMITTED">New Requests</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="PENDING_FUNDS">Funds Required</option>
                                <option value="PENDING_APPROVAL">Pending Approval</option>
                                <option value="APPROVED">Resolved</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4">Issue Title</th>
                                    <th className="px-6 py-4">Category</th>
                                    {isSuperAdmin && <th className="px-6 py-4">Nagarpalika</th>}
                                    <th className="px-6 py-4">Submitted</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={isSuperAdmin ? 5 : 4} className="px-6 py-16 text-center">
                                            <Loader2 size={24} className="animate-spin text-primary mx-auto" />
                                        </td>
                                    </tr>
                                ) : filtered.length > 0 ? (
                                    filtered.map((issue) => (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            key={issue._id}
                                            onClick={() => handleRowClick(issue)}
                                            className="hover:bg-slate-50 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">{issue.title}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{issue.location}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${issue._type === 'illegal' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                                    {issue._type === 'illegal' ? 'Illegal' : 'Civic'}
                                                </span>
                                            </td>
                                            {isSuperAdmin && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{issue.nagarpalika}</td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-slate-500">
                                                    <Calendar size={14} className="mr-1.5 opacity-70" />
                                                    {new Date(issue.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusColors[issue.status] || statusColors.SUBMITTED}`}>
                                                    {statusLabels[issue.status] || issue.status}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isSuperAdmin ? 5 : 4} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <FileText size={32} className="mb-3 opacity-50" />
                                                <p className="text-sm font-medium text-slate-600">No reports found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReportManagement;
