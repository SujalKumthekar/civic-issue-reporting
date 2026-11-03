import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    ThumbsUp, MapPin, Calendar, Filter, Search,
    Car, Trash2, Droplets, Lightbulb, Construction,
    HelpCircle, ShieldAlert, AlertTriangle, CheckCircle2,
    Clock, Loader2, Megaphone, SlidersHorizontal, ArrowDownUp
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

const issueTypeIcons = {
    road: Car, garbage: Trash2, water: Droplets,
    streetlight: Lightbulb, drainage: Construction,
    corruption: ShieldAlert, encroachment: AlertTriangle,
    illegal_construction: AlertTriangle, public_nuisance: Megaphone,
    environmental: ShieldAlert, other: HelpCircle,
};

const statusConfig = {
    SUBMITTED:        { label: 'Reported',      color: 'bg-slate-100 text-slate-600 border-slate-200' },
    IN_PROGRESS:      { label: 'In Progress',   color: 'bg-orange-50 text-orange-600 border-orange-200' },
    PENDING_FUNDS:    { label: 'Funds Needed',  color: 'bg-red-50 text-red-600 border-red-200' },
    PENDING_APPROVAL: { label: 'Under Review',  color: 'bg-purple-50 text-purple-600 border-purple-200' },
    APPROVED:         { label: 'Resolved',      color: 'bg-green-50 text-green-600 border-green-200' },
    RESOLVED:         { label: 'Resolved',      color: 'bg-green-50 text-green-600 border-green-200' },
};

const statusFilters = [
    { key: 'all',         label: 'All',         icon: SlidersHorizontal },
    { key: 'latest',      label: 'Latest',      icon: Clock },
    { key: 'pending',     label: 'Pending',     icon: AlertTriangle },
    { key: 'in_progress', label: 'In Progress', icon: Loader2 },
    { key: 'resolved',    label: 'Resolved',    icon: CheckCircle2 },
];

const IssuesFeed = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('civic');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('most_supported'); // 'newest', 'most_supported'
    const [supporting, setSupporting] = useState(null);

    const token = localStorage.getItem('token');

    const fetchIssues = async (category) => {
        setIsLoading(true);
        setIssues([]); // Immediately clear old tab's data
        try {
            const baseUrl = category === 'illegal'
                ? `http://localhost:5000/api/illegal/nagarpalika`
                : `http://localhost:5000/api/issues/nagarpalika`;
            const res = await fetch(
                `${baseUrl}?name=${encodeURIComponent(user?.area)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (res.ok) setIssues(data);
        } catch {}
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        if (user?.area) fetchIssues(activeTab);
    }, [user, activeTab]);

    const handleSupport = async (e, issueId) => {
        e.stopPropagation();
        setSupporting(issueId);
        try {
            const apiBase = activeTab === 'illegal'
                ? `http://localhost:5000/api/illegal/${issueId}/support`
                : `http://localhost:5000/api/issues/${issueId}/support`;
            const res = await fetch(apiBase, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setIssues(prev => prev.map(i =>
                    i._id === issueId
                        ? { ...i, supporters: [...(i.supporters || []), user._id] }
                        : i
                ));
            } else {
                alert(data.message);
            }
        } catch {}
        finally { setSupporting(null); }
    };

    // Status counts for the filter pills
    const statusCounts = useMemo(() => ({
        all: issues.length,
        latest: issues.length, // same as all, just sorted differently
        pending: issues.filter(i => i.status === 'SUBMITTED').length,
        in_progress: issues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'PENDING_FUNDS' || i.status === 'PENDING_APPROVAL').length,
        resolved: issues.filter(i => i.status === 'APPROVED' || i.status === 'RESOLVED').length,
    }), [issues]);

    const filtered = useMemo(() => {
        let result = [...issues];

        // Status filter
        if (statusFilter === 'pending') {
            result = result.filter(i => i.status === 'SUBMITTED');
        } else if (statusFilter === 'in_progress') {
            result = result.filter(i => i.status === 'IN_PROGRESS' || i.status === 'PENDING_FUNDS' || i.status === 'PENDING_APPROVAL');
        } else if (statusFilter === 'resolved') {
            result = result.filter(i => i.status === 'APPROVED' || i.status === 'RESOLVED');
        }

        // Search filter
        if (search) {
            const s = search.toLowerCase();
            result = result.filter(i =>
                i.title?.toLowerCase().includes(s) ||
                i.location?.toLowerCase().includes(s)
            );
        }

        // Sort: 'latest' filter always sorts by date; otherwise respect sortBy toggle
        if (statusFilter === 'latest' || sortBy === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            // Default: most supported first (most raised issues on top)
            result.sort((a, b) => (b.supporters?.length || 0) - (a.supporters?.length || 0));
        }

        return result;
    }, [issues, statusFilter, search, sortBy]);

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Community Issues</h1>
                    <p className="text-neutral-500 mt-1 text-sm flex items-center gap-1.5">
                        <MapPin size={14} /> {user?.area} · {user?.taluka} Taluka
                    </p>
                </div>

                {/* Category Tabs + Search */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="flex bg-neutral-100 rounded-xl p-1">
                        {['civic', 'illegal'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setStatusFilter('all'); }}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                            >
                                {tab === 'civic' ? 'Civic Issues' : 'Illegal Activities'}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-56">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search issues..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                            />
                        </div>
                        {/* Sort toggle */}
                        <button
                            onClick={() => setSortBy(s => s === 'newest' ? 'most_supported' : 'newest')}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-neutral-200 rounded-xl bg-white hover:bg-neutral-50 text-neutral-600 transition-all shrink-0"
                            title={sortBy === 'newest' ? 'Sorted by newest' : 'Sorted by most supported'}
                        >
                            <ArrowDownUp size={14} />
                            {sortBy === 'newest' ? 'Newest' : 'Top'}
                        </button>
                    </div>
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
                                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                                }`}>
                                    {f.key === 'latest' ? '' : count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Issues List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin text-secondary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-neutral-400">
                        <AlertTriangle size={32} className="mx-auto mb-3 opacity-40" />
                        <p className="font-medium text-neutral-600">No issues found</p>
                        <p className="text-sm mt-1">
                            {statusFilter !== 'all'
                                ? `No ${statusFilters.find(f => f.key === statusFilter)?.label.toLowerCase()} issues at the moment.`
                                : 'Be the first to report an issue in your area.'
                            }
                        </p>
                        {statusFilter !== 'all' ? (
                            <button
                                onClick={() => setStatusFilter('all')}
                                className="inline-block mt-4 px-5 py-2.5 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-secondary/90 transition-all"
                            >
                                Clear Filter
                            </button>
                        ) : (
                            <Link to="/report-civic-issue" className="inline-block mt-4 px-5 py-2.5 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-secondary/90 transition-all">
                                Report an Issue
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-xs text-neutral-400 font-medium">{filtered.length} issue{filtered.length !== 1 ? 's' : ''} found</p>
                        {filtered.map((issue, index) => {
                            const issueType = issue.issueType || issue.category;
                            const Icon = issueTypeIcons[issueType] || HelpCircle;
                            const status = statusConfig[issue.status] || statusConfig.SUBMITTED;
                            const hasSupported = issue.supporters?.includes(user?._id);
                            const isOwn = issue.citizenId?._id === user?._id || issue.citizenId === user?._id;
                            const supportCount = issue.supporters?.length || 0;

                            return (
                                <motion.div
                                    key={issue._id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => navigate(`/issues/${issue._id}`)}
                                    className="bg-white border border-neutral-200 rounded-2xl p-5 cursor-pointer hover:shadow-md hover:border-secondary/30 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                                            <Icon size={20} className="text-secondary" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <h3 className="text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-secondary transition-colors">{issue.title}</h3>
                                                <span className={`shrink-0 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{issue.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-xs text-neutral-400">
                                                    <span className="flex items-center gap-1"><MapPin size={12} />{issue.location}</span>
                                                    <span className="flex items-center gap-1"><Calendar size={12} />{new Date(issue.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                                {/* Support Button */}
                                                <button
                                                    onClick={(e) => handleSupport(e, issue._id)}
                                                    disabled={hasSupported || isOwn || supporting === issue._id || issue.status === 'APPROVED' || issue.status === 'RESOLVED'}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                        hasSupported || isOwn
                                                            ? 'bg-secondary/10 text-secondary cursor-default'
                                                            : issue.status === 'APPROVED' || issue.status === 'RESOLVED'
                                                            ? 'bg-neutral-100 text-neutral-400 cursor-default'
                                                            : 'bg-neutral-100 text-neutral-600 hover:bg-secondary/10 hover:text-secondary'
                                                    }`}
                                                >
                                                    {supporting === issue._id
                                                        ? <Loader2 size={12} className="animate-spin" />
                                                        : <ThumbsUp size={12} className={hasSupported ? 'fill-secondary' : ''} />
                                                    }
                                                    {supportCount} {supportCount === 1 ? 'Support' : 'Supports'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default IssuesFeed;
