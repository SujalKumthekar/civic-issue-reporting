import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, CheckCircle2, Clock, Camera, Loader2, DollarSign, Receipt, Shield, ChevronDown, ChevronUp, FileText, Link as LinkIcon, Scale } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getContract } from '../../utils/blockchain';
import FundRequestForm from '../../components/funds/FundRequestForm';
import RecordExpenseForm from '../../components/expenses/RecordExpenseForm';
import LegalActionForm from '../../components/legal/LegalActionForm';

const statusColors = {
    SUBMITTED:        'bg-slate-100 text-slate-600 border-slate-200',
    IN_PROGRESS:      'bg-orange-50 text-orange-600 border-orange-200',
    PENDING_FUNDS:    'bg-red-50 text-red-600 border-red-200',
    PENDING_APPROVAL: 'bg-purple-50 text-purple-600 border-purple-200',
    APPROVED:         'bg-green-50 text-green-600 border-green-200',
    RESOLVED:         'bg-green-50 text-green-600 border-green-200',
    ACKNOWLEDGED:     'bg-blue-50 text-blue-600 border-blue-200',
};
const statusLabels = {
    SUBMITTED: 'New', IN_PROGRESS: 'In Progress',
    PENDING_FUNDS: 'Funds Needed', PENDING_APPROVAL: 'Under Review',
    APPROVED: 'Resolved', RESOLVED: 'Resolved', ACKNOWLEDGED: 'Acknowledged',
};

const ReportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reportType = searchParams.get('type') || 'civic';
    const isIllegal = reportType === 'illegal';
    const { isDistrictAuthority, admin } = useAdminAuth();
    const isSuperAdmin = isDistrictAuthority;

    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [officialNote, setOfficialNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Modal states
    const [showFundRequestForm, setShowFundRequestForm] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [showLegalActionForm, setShowLegalActionForm] = useState(false);

    // Transparency data
    const [transparencyData, setTransparencyData] = useState(null);
    const [loadingTransparency, setLoadingTransparency] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        actions: true, funds: true, expenses: true, blockchain: true
    });

    const token = localStorage.getItem('adminToken');

    // Use correct API based on report type
    const apiBase = isIllegal
        ? `http://localhost:5000/api/illegal/admin`
        : `http://localhost:5000/api/issues/admin`;

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                const res = await fetch(`${apiBase}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok) setReport(data);
                else navigate(-1);
            } catch { navigate(-1); }
            finally { setIsLoading(false); }
        };
        fetchIssue();
    }, [id, apiBase]);

    // Fetch full transparency data (actions, expenses, fund requests, blockchain records)
    useEffect(() => {
        if (!id) return;
        fetchTransparencyData();
    }, [id]);

    const fetchTransparencyData = async () => {
        setLoadingTransparency(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch all transparency data in parallel
            const [detailsRes, fundRequestsRes, expensesRes] = await Promise.allSettled([
                fetch(`http://localhost:5000/api/issue-tracking/details/${id}`, { headers }).then(r => r.json()),
                fetch(`http://localhost:5000/api/funds/issue/${id}`, { headers }).then(r => r.json()),
                fetch(`http://localhost:5000/api/expenses/issue/${id}`, { headers }).then(r => r.json()),
            ]);

            setTransparencyData({
                actionPoints: detailsRes.status === 'fulfilled' ? detailsRes.value.actionPoints || [] : [],
                expenses: expensesRes.status === 'fulfilled' ? (Array.isArray(expensesRes.value) ? expensesRes.value : []) : [],
                fundRequests: fundRequestsRes.status === 'fulfilled' ? (Array.isArray(fundRequestsRes.value) ? fundRequestsRes.value : []) : [],
                blockchainRecords: detailsRes.status === 'fulfilled' ? detailsRes.value.blockchainRecords || [] : [],
                costSummary: detailsRes.status === 'fulfilled' ? detailsRes.value.costSummary || {} : {},
            });
        } catch (err) {
            console.error('Failed to load transparency data:', err);
        } finally {
            setLoadingTransparency(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const updateStatus = async (status, note, extraBody = {}) => {
        if (!note && status !== 'IN_PROGRESS') {
            alert('Please provide official remarks before taking this action.');
            return;
        }
        setIsUpdating(true);
        try {
            let txHash = extraBody.transactionHash || '';

            // MetaMask Integration — for both civic AND illegal issues
            if (!txHash) {
                try {
                    const contract = await getContract();
                    let bnIssueId = 1;
                    try { bnIssueId = BigInt("0x" + id); } catch(e) {}

                    let tx;
                    if (status === 'IN_PROGRESS' && report.status === 'SUBMITTED') {
                        tx = await contract.acknowledgeIssue(bnIssueId, admin?.name || 'Officer');
                    } else if (status === 'RESOLVED' || status === 'APPROVED') {
                        tx = await contract.completeIssue(bnIssueId, note || 'Completed', '', '');
                    } else {
                        tx = await contract.addActionPoint(bnIssueId, note || 'Status Update', admin?.name || 'Officer', []);
                    }
                    await tx.wait();
                    txHash = tx.hash;
                } catch (bcError) {
                    console.error("Blockchain error:", bcError);
                    if (bcError.message?.includes('MetaMask')) {
                       alert(bcError.message);
                       setIsUpdating(false);
                       return;
                    }
                    const proceed = window.confirm("Blockchain transaction failed. Continue saving to database anyway?");
                    if (!proceed) {
                        setIsUpdating(false);
                        return;
                    }
                }
            }

            const res = await fetch(`${apiBase}/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status, note: note || `Status updated to ${status}`, transactionHash: txHash, ...extraBody }),
            });
            const data = await res.json();
            if (res.ok) {
                setReport(data);
                setOfficialNote('');
                // Refresh transparency data after status update
                fetchTransparencyData();
            }
            else alert(data.message);
        } catch { alert('Failed to update status.'); }
        finally { setIsUpdating(false); }
    };

    const handleFundRequested = (fundRequest) => {
        setShowFundRequestForm(false);
        // Refresh report and transparency data
        window.location.reload();
    };

    const handleExpenseAdded = (expense) => {
        setShowExpenseForm(false);
        // Refresh transparency data
        fetchTransparencyData();
    };

    const handleLegalActionSubmitted = (actionData) => {
        setShowLegalActionForm(false);
        // actionData has { status, note, transactionHash, legalAction }
        updateStatus(actionData.status, actionData.note, {
            transactionHash: actionData.transactionHash,
            legalAction: actionData.legalAction
        });
    };

    if (isLoading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-64">
                <Loader2 size={28} className="animate-spin text-primary" />
            </div>
        </DashboardLayout>
    );

    if (!report) return null;

    const needsNoteInput = (
        // For illegal issues: Nagarpalika needs note input when IN_PROGRESS (to resolve directly)
        (!isSuperAdmin && isIllegal && report.status === 'IN_PROGRESS') ||
        // For civic issues: same as before
        (!isSuperAdmin && !isIllegal && !['APPROVED', 'PENDING_APPROVAL', 'PENDING_FUNDS'].includes(report.status) && report.status !== 'SUBMITTED') ||
        (isSuperAdmin && ['PENDING_APPROVAL', 'PENDING_FUNDS'].includes(report.status))
    );

    // Determine if fund request and expense buttons should show
    const canRequestFunds = !isSuperAdmin && !isIllegal && report.status === 'IN_PROGRESS';
    const canRecordExpense = !isSuperAdmin && !isIllegal && ['IN_PROGRESS', 'ACKNOWLEDGED'].includes(report.status);

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <h1 className="text-2xl font-bold text-slate-900 leading-tight">{report.title}</h1>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusColors[report.status]}`}>
                                    {statusLabels[report.status] || report.status}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-slate-600 font-medium mb-6">
                                <div className="flex items-center"><MapPin size={16} className="mr-1.5 text-slate-400" />{report.location}</div>
                                <div className="flex items-center"><Calendar size={16} className="mr-1.5 text-slate-400" />{new Date(report.createdAt).toLocaleDateString()}</div>
                                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${isIllegal ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                    {isIllegal ? 'Illegal Activity' : 'Civic Issue'}
                                </span>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-slate-700 leading-relaxed text-sm">{report.description}</p>
                            </div>

                            {report.mediaUrls?.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Camera size={14} /> Attached Media
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {report.mediaUrls.map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noreferrer">
                                                <img src={url} alt={`media-${i}`} className="aspect-square object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 mb-6">Activity Timeline</h3>
                            <div className="space-y-4">
                                {report.updates?.map((update, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <Clock size={14} className="text-slate-500" />
                                            </div>
                                            {idx < report.updates.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 mt-1" />}
                                        </div>
                                        <div className="pb-4 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColors[update.status] || statusColors.SUBMITTED}`}>
                                                    {statusLabels[update.status] || update.status}
                                                </span>
                                                <span className="text-xs text-slate-400">{new Date(update.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-600">{update.note}</p>
                                            {update.transactionHash && (
                                                <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                                                    <LinkIcon size={10} /> Tx: {update.transactionHash.slice(0, 16)}...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ========== TRANSPARENCY PANEL ========== */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Shield size={20} className="text-blue-600" />
                                Transparency Panel
                            </h3>
                            <p className="text-xs text-slate-500 mb-6">Complete record of all actions, fund requests, expenses, and blockchain records for this issue.</p>

                            {loadingTransparency ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 size={24} className="animate-spin text-blue-500" />
                                    <span className="ml-2 text-slate-500 text-sm">Loading transparency data...</span>
                                </div>
                            ) : transparencyData ? (
                                <div className="space-y-4">
                                    {/* Cost Summary */}
                                    {transparencyData.costSummary && (transparencyData.costSummary.allocatedBudget > 0 || transparencyData.costSummary.totalExpenses > 0) && (
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                                                <p className="text-xs text-slate-500 font-medium">Allocated Budget</p>
                                                <p className="text-lg font-bold text-blue-700">₹{(transparencyData.costSummary.allocatedBudget || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-center">
                                                <p className="text-xs text-slate-500 font-medium">Total Expenses</p>
                                                <p className="text-lg font-bold text-orange-700">₹{(transparencyData.costSummary.totalExpenses || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                                                <p className="text-xs text-slate-500 font-medium">Remaining</p>
                                                <p className="text-lg font-bold text-green-700">₹{(transparencyData.costSummary.remaining || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Points Section */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('actions')}
                                            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-blue-600" />
                                                <span className="font-semibold text-slate-900 text-sm">Action Points</span>
                                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {transparencyData.actionPoints.length}
                                                </span>
                                            </div>
                                            {expandedSections.actions ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                        </button>
                                        {expandedSections.actions && transparencyData.actionPoints.length > 0 && (
                                            <div className="p-4 space-y-3">
                                                {transparencyData.actionPoints.map((action, idx) => (
                                                    <div key={idx} className="flex gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                                            <span className="text-xs font-bold text-blue-700">{idx + 1}</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-slate-900">{action.actionDescription}</p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-xs text-slate-500">By: {action.performedBy || 'System'}</span>
                                                                {action.category && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{action.category}</span>}
                                                                {action.actionDate && <span className="text-xs text-slate-400">{new Date(action.actionDate || action.createdAt).toLocaleDateString()}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {expandedSections.actions && transparencyData.actionPoints.length === 0 && (
                                            <div className="p-4 text-center text-sm text-slate-400">No action points recorded yet</div>
                                        )}
                                    </div>

                                    {/* Fund Requests Section */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('funds')}
                                            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={16} className="text-yellow-600" />
                                                <span className="font-semibold text-slate-900 text-sm">Fund Requests</span>
                                                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {transparencyData.fundRequests.length}
                                                </span>
                                            </div>
                                            {expandedSections.funds ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                        </button>
                                        {expandedSections.funds && transparencyData.fundRequests.length > 0 && (
                                            <div className="p-4 space-y-3">
                                                {transparencyData.fundRequests.map((fr, idx) => (
                                                    <div key={idx} className="p-3 bg-yellow-50/50 rounded-lg border border-yellow-100">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900">Fund Request #{(fr._id || '').slice(-6)}</p>
                                                                <p className="text-xs text-slate-500 mt-0.5">Submitted by: {fr.submittedBy}</p>
                                                            </div>
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                                                                fr.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                fr.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                            }`}>
                                                                {fr.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-700 mb-2">{fr.justification}</p>
                                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                                            <span className="font-bold text-slate-900">₹{(fr.totalAmountRequested || 0).toLocaleString()}</span>
                                                            <span>Timeline: {fr.requestedTimeline ? new Date(fr.requestedTimeline).toLocaleDateString() : 'N/A'}</span>
                                                            <span>{new Date(fr.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        {fr.breakdown && fr.breakdown.length > 0 && (
                                                            <div className="mt-2 space-y-1">
                                                                {fr.breakdown.map((item, bIdx) => (
                                                                    <div key={bIdx} className="flex justify-between text-xs bg-white p-2 rounded border border-yellow-100">
                                                                        <span className="text-slate-700">{item.itemName} — {item.purpose}</span>
                                                                        <span className="font-bold text-slate-900">₹{(item.amount || 0).toLocaleString()}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {expandedSections.funds && transparencyData.fundRequests.length === 0 && (
                                            <div className="p-4 text-center text-sm text-slate-400">No fund requests submitted</div>
                                        )}
                                    </div>

                                    {/* Expenses Section */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('expenses')}
                                            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Receipt size={16} className="text-orange-600" />
                                                <span className="font-semibold text-slate-900 text-sm">Recorded Expenses</span>
                                                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {transparencyData.expenses.length}
                                                </span>
                                            </div>
                                            {expandedSections.expenses ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                        </button>
                                        {expandedSections.expenses && transparencyData.expenses.length > 0 && (
                                            <div className="p-4 space-y-3">
                                                {transparencyData.expenses.map((exp, idx) => (
                                                    <div key={idx} className="p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900">{exp.description}</p>
                                                                <p className="text-xs text-slate-500 mt-0.5">Vendor: {exp.vendorSupplier}</p>
                                                            </div>
                                                            <span className="text-sm font-bold text-orange-700">₹{(exp.amountSpent || 0).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{exp.category}</span>
                                                            <span>Payment: {exp.paymentMethod || 'N/A'}</span>
                                                            <span>Approved by: {exp.approvedBy || 'N/A'}</span>
                                                            <span>{new Date(exp.expenseDate || exp.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        {exp.proofDocumentUrls && exp.proofDocumentUrls.length > 0 && (
                                                            <div className="mt-3">
                                                                <p className="text-xs font-semibold text-slate-700 mb-1.5">Proof Documents:</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {exp.proofDocumentUrls.map((url, i) => {
                                                                        const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                                                                        return (
                                                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 shrink-0">
                                                                                {isImage ? (
                                                                                    <img src={url} alt={`proof-${i}`} className="w-full h-full object-cover rounded-md border border-slate-200 hover:opacity-80 transition-opacity" />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-md border border-slate-200 hover:bg-slate-200 transition-colors text-xs text-slate-500">
                                                                                        <span>📄</span>
                                                                                        <span className="text-[10px] mt-1 text-slate-600 truncate max-w-[50px]">Doc {i + 1}</span>
                                                                                    </div>
                                                                                )}
                                                                            </a>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {exp.blockchainTransactionHash && (
                                                            <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                                                                <Shield size={10} /> Blockchain verified: {exp.blockchainTransactionHash.slice(0, 20)}...
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {expandedSections.expenses && transparencyData.expenses.length === 0 && (
                                            <div className="p-4 text-center text-sm text-slate-400">No expenses recorded yet</div>
                                        )}
                                    </div>

                                    {/* Blockchain Records Section */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('blockchain')}
                                            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Shield size={16} className="text-green-600" />
                                                <span className="font-semibold text-slate-900 text-sm">Blockchain Audit Trail</span>
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {transparencyData.blockchainRecords.length}
                                                </span>
                                            </div>
                                            {expandedSections.blockchain ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                        </button>
                                        {expandedSections.blockchain && transparencyData.blockchainRecords.length > 0 && (
                                            <div className="p-4 space-y-3">
                                                {transparencyData.blockchainRecords.map((record, idx) => (
                                                    <div key={idx} className="p-3 bg-green-50/50 rounded-lg border border-green-100">
                                                        <div className="flex items-start justify-between mb-1">
                                                            <p className="text-sm font-semibold text-slate-900">{record.recordType}</p>
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${record.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {record.verified ? '✓ Verified' : 'Pending'}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-1 text-xs text-slate-500">
                                                            {record.transactionHash && (
                                                                <p className="flex items-center gap-1">
                                                                    <LinkIcon size={10} /> Tx Hash: <span className="font-mono">{record.transactionHash.slice(0, 30)}...</span>
                                                                </p>
                                                            )}
                                                            {record.blockNumber && <p>Block: {record.blockNumber}</p>}
                                                            {record.gasUsed && <p>Gas Used: {record.gasUsed}</p>}
                                                            <p>{new Date(record.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {expandedSections.blockchain && transparencyData.blockchainRecords.length === 0 && (
                                            <div className="p-4 text-center text-sm text-slate-400">No blockchain records yet</div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-sm text-slate-400">No transparency data available</div>
                            )}
                        </div>
                    </div>

                    {/* Right: Meta + Actions */}
                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Details</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium mb-1">Reported By</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center"><User size={12} className="text-slate-500" /></div>
                                        <span className="font-semibold text-slate-700">
                                            {report.isAnonymous ? 'Anonymous' : (report.citizenId?.name || 'Citizen')}
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-100">
                                    <p className="text-xs text-slate-400 font-medium mb-1">Nagarpalika</p>
                                    <span className="font-semibold text-slate-700">{report.nagarpalika}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-100">
                                    <p className="text-xs text-slate-400 font-medium mb-1">Taluka</p>
                                    <span className="font-semibold text-slate-700">{report.taluka}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-100">
                                    <p className="text-xs text-slate-400 font-medium mb-1">Community Support</p>
                                    <span className="font-semibold text-slate-700">{report.supporters?.length || 0} supporters</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Panel */}
                        <div className="bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-700">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-400" /> Action Panel
                            </h3>

                            {needsNoteInput && (
                                <div className="mb-4">
                                    <label className="text-xs font-medium text-slate-300 mb-1.5 block">Official Remarks</label>
                                    <textarea
                                        value={officialNote}
                                        onChange={(e) => setOfficialNote(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-green-500 resize-none"
                                        rows="3"
                                        placeholder="Enter remarks, estimates, or reasons..."
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                {!isSuperAdmin && report.status === 'SUBMITTED' && (
                                    <Button onClick={() => updateStatus('IN_PROGRESS', 'Acknowledged and work started.')} variant="primary" className="w-full" disabled={isUpdating}>
                                        {isUpdating ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Acknowledge & Start Work'}
                                    </Button>
                                )}

                                {!isSuperAdmin && report.status === 'IN_PROGRESS' && isIllegal && (
                                    <div className="space-y-2">
                                        <Button onClick={() => setShowLegalActionForm(true)} variant="primary" className="w-full bg-red-600 hover:bg-red-700" disabled={isUpdating}>
                                            <Scale size={16} className="mr-1 inline" />
                                            {isUpdating ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Take Legal Action & Resolve'}
                                        </Button>
                                    </div>
                                )}

                                {!isSuperAdmin && report.status === 'IN_PROGRESS' && !isIllegal && (
                                    <div className="space-y-2">
                                        <Button onClick={() => updateStatus('PENDING_APPROVAL', officialNote)} variant="primary" className="w-full bg-green-600 hover:bg-green-700" disabled={isUpdating}>
                                            {isUpdating ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Submit for Approval'}
                                        </Button>
                                        <Button
                                            onClick={() => setShowFundRequestForm(true)}
                                            variant="outline"
                                            className="w-full border-orange-500 text-orange-400 hover:bg-orange-500/10"
                                            disabled={isUpdating}
                                        >
                                            <DollarSign size={16} className="mr-1 inline" /> Request Funds
                                        </Button>
                                    </div>
                                )}

                                {/* Record Expense button — visible for Nagarpalika when IN_PROGRESS */}
                                {canRecordExpense && (
                                    <Button
                                        onClick={() => setShowExpenseForm(true)}
                                        variant="outline"
                                        className="w-full border-teal-500 text-teal-400 hover:bg-teal-500/10"
                                    >
                                        <Receipt size={16} className="mr-1 inline" /> Record Expense
                                    </Button>
                                )}

                                {isSuperAdmin && report.status === 'PENDING_APPROVAL' && (
                                    <div className="space-y-2">
                                        <Button onClick={() => updateStatus('APPROVED', officialNote || 'Resolution approved by District Authority.')} variant="primary" className="w-full bg-green-600 hover:bg-green-700" disabled={isUpdating}>
                                            {isUpdating ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Approve Resolution'}
                                        </Button>
                                        <Button onClick={() => updateStatus('IN_PROGRESS', officialNote)} variant="outline" className="w-full border-red-500 text-red-400 hover:bg-red-500/10" disabled={isUpdating}>
                                            Reject & Rework
                                        </Button>
                                    </div>
                                )}

                                {isSuperAdmin && report.status === 'PENDING_FUNDS' && (
                                    <div className="space-y-2">
                                        <Button onClick={() => updateStatus('IN_PROGRESS', officialNote || 'Funds approved by District Authority.')} variant="primary" className="w-full bg-green-600 hover:bg-green-700" disabled={isUpdating}>
                                            {isUpdating ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Approve & Allocate Funds'}
                                        </Button>
                                        <Button onClick={() => updateStatus('IN_PROGRESS', officialNote)} variant="outline" className="w-full border-red-500 text-red-400 hover:bg-red-500/10" disabled={isUpdating}>
                                            Deny Request
                                        </Button>
                                    </div>
                                )}

                                {!isSuperAdmin && report.status === 'PENDING_APPROVAL' && (
                                    <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                        <Clock size={20} className="text-purple-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-purple-200">Awaiting District approval.</p>
                                    </div>
                                )}
                                {!isSuperAdmin && report.status === 'PENDING_FUNDS' && (
                                    <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                        <Clock size={20} className="text-orange-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-orange-200">Awaiting District fund approval.</p>
                                    </div>
                                )}
                                {(report.status === 'APPROVED' || report.status === 'RESOLVED') && (
                                    <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                        <CheckCircle2 size={24} className="text-green-400 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-green-300">Issue Resolved</p>
                                        <p className="text-xs text-green-400/80 mt-1">This report is closed.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== MODALS ========== */}
            {showFundRequestForm && (
                <FundRequestForm
                    issueId={id}
                    issueTitle={report.title}
                    onFundRequested={handleFundRequested}
                    onClose={() => setShowFundRequestForm(false)}
                />
            )}

            {showExpenseForm && (
                <RecordExpenseForm
                    issueId={id}
                    fundApprovalId={report.fundApprovalId || null}
                    onExpenseAdded={handleExpenseAdded}
                    onClose={() => setShowExpenseForm(false)}
                />
            )}

            {showLegalActionForm && (
                <LegalActionForm
                    reportId={id}
                    reportTitle={report.title}
                    onActionSubmitted={handleLegalActionSubmitted}
                    onClose={() => setShowLegalActionForm(false)}
                />
            )}
        </DashboardLayout>
    );
};

export default ReportDetail;
