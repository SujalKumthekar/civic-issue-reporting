import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Search, ChevronDown, FileText, Loader2,
  Calendar, ArrowLeft, Activity, CheckCircle2, AlertTriangle,
  ShieldAlert, ChevronRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigate, useParams } from 'react-router-dom';
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

const NagarpalikaReports = () => {
  const { name } = useParams(); // nagarpalika name from URL
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const token = localStorage.getItem('adminToken');

  const [nagarpalikas, setNagarpalikas] = useState([]);
  const [selectedNp, setSelectedNp] = useState(name ? decodeURIComponent(name) : null);
  const [reports, setReports] = useState([]);
  const [isLoadingNps, setIsLoadingNps] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'civic', 'illegal'

  // Fetch list of nagarpalikas
  useEffect(() => {
    const fetchNps = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/nagarpalikas', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setNagarpalikas(data);
      } catch {}
      finally { setIsLoadingNps(false); }
    };
    fetchNps();
  }, []);

  // Fetch reports for selected nagarpalika
  useEffect(() => {
    if (!selectedNp) { setReports([]); return; }
    const fetchReports = async () => {
      setIsLoadingReports(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const params = new URLSearchParams();
        params.set('nagarpalika', selectedNp);
        if (statusFilter !== 'ALL') params.set('status', statusFilter);

        const [civicRes, illegalRes] = await Promise.allSettled([
          fetch(`http://localhost:5000/api/issues/admin/all?${params}`, { headers }).then(r => r.json()),
          fetch(`http://localhost:5000/api/illegal/admin/all?${params}`, { headers }).then(r => r.json()),
        ]);

        const civicIssues = civicRes.status === 'fulfilled' ? civicRes.value.map(i => ({ ...i, _type: 'civic' })) : [];
        const illegalReports = illegalRes.status === 'fulfilled' ? illegalRes.value.map(i => ({ ...i, _type: 'illegal' })) : [];
        const all = [...civicIssues, ...illegalReports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReports(all);
      } catch {}
      finally { setIsLoadingReports(false); }
    };
    fetchReports();
  }, [selectedNp, statusFilter]);

  // Compute stats
  const stats = useMemo(() => {
    const civicCount = reports.filter(r => r._type === 'civic').length;
    const illegalCount = reports.filter(r => r._type === 'illegal').length;
    const pending = reports.filter(r => r.status === 'SUBMITTED').length;
    const inProgress = reports.filter(r => r.status === 'IN_PROGRESS').length;
    const resolved = reports.filter(r => r.status === 'APPROVED' || r.status === 'RESOLVED').length;
    return { total: reports.length, civicCount, illegalCount, pending, inProgress, resolved };
  }, [reports]);

  // Filter reports
  const filtered = useMemo(() => {
    let result = reports;
    if (categoryFilter !== 'all') result = result.filter(r => r._type === categoryFilter);
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(i =>
        i.title?.toLowerCase().includes(s) ||
        i.location?.toLowerCase().includes(s) ||
        i._id?.toLowerCase().includes(s)
      );
    }
    return result;
  }, [reports, categoryFilter, searchTerm]);

  const handleRowClick = (issue) => {
    const type = issue._type || 'civic';
    navigate(`/dashboard/nagarpalika-reports/${encodeURIComponent(selectedNp)}/${issue._id}?type=${type}`);
  };

  // ── Nagarpalika Selection View ──
  if (!selectedNp) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nagarpalika Reports</h1>
            <p className="text-slate-500 mt-1 text-sm">Select a Nagarpalika to view all their civic issues and illegal activity reports.</p>
          </div>

          {isLoadingNps ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : nagarpalikas.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Building2 size={48} className="mx-auto mb-4 opacity-40" />
              <p className="font-medium text-slate-600">No Nagarpalikas registered yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nagarpalikas.map((np, index) => (
                <motion.div
                  key={np._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedNp(np.name)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Building2 size={22} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{np.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{np.taluka} Taluka</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ── Reports View for Selected Nagarpalika ──
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => { setSelectedNp(null); setReports([]); setStatusFilter('ALL'); setCategoryFilter('all'); setSearchTerm(''); }}
              className="flex items-center gap-1.5 text-primary hover:text-primary/80 font-medium text-sm mb-2 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Nagarpalikas
            </button>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 size={22} className="text-primary" />
              {selectedNp}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">All civic issues and illegal reports for this Nagarpalika</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText },
            { label: 'Civic', value: stats.civicCount, color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: FileText },
            { label: 'Illegal', value: stats.illegalCount, color: 'bg-red-50 text-red-700 border-red-200', icon: ShieldAlert },
            { label: 'Pending', value: stats.pending, color: 'bg-slate-50 text-slate-700 border-slate-200', icon: AlertTriangle },
            { label: 'In Progress', value: stats.inProgress, color: 'bg-orange-50 text-orange-700 border-orange-200', icon: Activity },
            { label: 'Resolved', value: stats.resolved, color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border p-4 ${s.color}`}>
              <div className="flex items-center justify-between mb-2">
                <s.icon size={18} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-70">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            {['all', 'civic', 'illegal'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  categoryFilter === cat
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {cat === 'all' ? 'All Reports' : cat === 'civic' ? 'Civic Issues' : 'Illegal Reports'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full bg-white"
            />
          </div>

          {/* Status filter */}
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

        {/* Reports Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Issue Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingReports ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
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
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          issue._type === 'illegal' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>
                          {issue._type === 'illegal' ? 'Illegal' : 'Civic'}
                        </span>
                      </td>
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
                    <td colSpan={4} className="px-6 py-12 text-center">
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

export default NagarpalikaReports;
