import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, Plus, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import AddActionPointForm from '../actions/AddActionPointForm';
import AddLegalActionForm from '../actions/AddLegalActionForm';
import RecordExpenseForm from '../expenses/RecordExpenseForm';
import FundRequestForm from '../funds/FundRequestForm';
import CompleteIssueForm from '../completion/CompleteIssueForm';

const IssueManagement = ({ nagarpalikaId }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeIssue, setActiveIssue] = useState(null);
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [issueDetails, setIssueDetails] = useState({});
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Modal states
  const [showActionPointForm, setShowActionPointForm] = useState(false);
  const [showLegalActionForm, setShowLegalActionForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showFundRequestForm, setShowFundRequestForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);

  // Status filter
  const [statusFilter, setStatusFilter] = useState('ALL');

  const statuses = ['ALL', 'SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'PENDING_FUNDS', 'COMPLETED'];
  const statusColors = {
    SUBMITTED: 'bg-gray-100 text-gray-800',
    ACKNOWLEDGED: 'bg-purple-100 text-purple-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    PENDING_FUNDS: 'bg-yellow-100 text-yellow-800',
    PENDING_APPROVAL: 'bg-orange-100 text-orange-800',
    APPROVED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-green-100 text-green-800'
  };

  // Fetch issues on component mount and when filter changes
  useEffect(() => {
    fetchIssues();
  }, [statusFilter, nagarpalikaId]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const endpoint = statusFilter === 'ALL'
        ? `http://localhost:5000/api/issues?nagarpalika=${nagarpalikaId}`
        : `http://localhost:5000/api/issue-tracking/status/${statusFilter}`;
      
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssues(response.data.issues || response.data);
      setError('');
    } catch (err) {
      setError('Failed to load issues');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleIssueExpand = async (issueId) => {
    if (expandedIssueId === issueId) {
      setExpandedIssueId(null);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:5000/api/issue-tracking/details/${issueId}`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      setIssueDetails(prev => ({
        ...prev,
        [issueId]: response.data
      }));
      setExpandedIssueId(issueId);
    } catch (err) {
      setError('Failed to load issue details');
    }
  };

  const handleActionPointAdded = (actionPoint) => {
    setShowActionPointForm(false);
    setIssueDetails(prev => ({
      ...prev,
      [selectedIssue.id]: {
        ...prev[selectedIssue.id],
        actionPoints: [...(prev[selectedIssue.id]?.actionPoints || []), actionPoint]
      }
    }));
  };

  const handleExpenseRecorded = (expense) => {
    setShowExpenseForm(false);
    setIssueDetails(prev => ({
      ...prev,
      [selectedIssue.id]: {
        ...prev[selectedIssue.id],
        expenses: [...(prev[selectedIssue.id]?.expenses || []), expense]
      }
    }));
  };

  const handleFundRequested = (fundRequest) => {
    setShowFundRequestForm(false);
    fetchIssues();
  };

  const handleIssueCompleted = (completion) => {
    setShowCompleteForm(false);
    fetchIssues();
  };

  const openActionPointForm = (issue) => {
    setSelectedIssue(issue);
    setShowActionPointForm(true);
  };

  const openExpenseForm = (issue) => {
    setSelectedIssue(issue);
    setShowExpenseForm(true);
  };

  const openFundRequestForm = (issue) => {
    setSelectedIssue(issue);
    setShowFundRequestForm(true);
  };

  const openCompleteForm = (issue) => {
    setSelectedIssue(issue);
    setShowCompleteForm(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <Clock className="w-4 h-4" />;
      case 'ACKNOWLEDGED':
      case 'IN_PROGRESS':
        return <TrendingUp className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Issue Management</h1>
        <p className="text-gray-600">Manage and track all assigned issues</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Filter by Status</h3>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Issues List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500">Loading issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500">No issues found</p>
          </div>
        ) : (
          issues.map(issue => (
            <div key={issue._id} className="bg-white rounded-lg shadow hover:shadow-md transition">
              {/* Issue Header */}
              <div
                onClick={() => toggleIssueExpand(issue._id)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex gap-3 items-start">
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition ${
                          expandedIssueId === issue._id ? 'rotate-180' : ''
                        }`}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{issue.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[issue.status]} flex items-center gap-1`}>
                            {getStatusIcon(issue.status)}
                            {issue.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                            {issue.location}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedIssueId === issue._id && issueDetails[issue._id] && (
                <div className="border-t p-4 bg-gray-50 space-y-4">
                  {/* Budget Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-sm text-gray-600">Allocated Budget</p>
                      <p className="text-xl font-bold text-gray-900">₹{issue.allocatedBudget || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-sm text-gray-600">Utilized</p>
                      <p className="text-xl font-bold text-blue-700">₹{issue.utilizedBudget || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className="text-xl font-bold text-green-700">₹{(issue.allocatedBudget || 0) - (issue.utilizedBudget || 0)}</p>
                    </div>
                  </div>

                  {/* Action Points */}
                  {issueDetails[issue._id]?.actionPoints?.length > 0 && (
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Action Points ({issueDetails[issue._id].actionPoints.length})</h4>
                      <div className="space-y-2">
                        {issueDetails[issue._id].actionPoints.map((action, idx) => (
                          <div key={idx} className="text-sm p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="font-medium text-gray-900">{action.actionDescription}</p>
                            <p className="text-gray-600">{action.category} - by {action.performedBy}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expenses */}
                  {issueDetails[issue._id]?.expenses?.length > 0 && (
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Expenses ({issueDetails[issue._id].expenses.length})</h4>
                      <div className="space-y-2">
                        {issueDetails[issue._id].expenses.map((expense, idx) => (
                          <div key={idx} className="text-sm p-2 bg-orange-50 rounded border border-orange-200 flex justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{expense.description}</p>
                              <p className="text-gray-600">{expense.category}</p>
                            </div>
                            <p className="font-bold text-orange-700">₹{expense.amountSpent}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    <button
                      onClick={() => openActionPointForm(issue)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Action Point
                    </button>
                    <button
                      onClick={() => { setSelectedIssue(issue); setShowLegalActionForm(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Legal Action
                    </button>
                    <button
                      onClick={() => openExpenseForm(issue)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Record Expense
                    </button>
                    {(issue.status === 'ACKNOWLEDGED' || issue.status === 'IN_PROGRESS') && (
                      <button
                        onClick={() => openFundRequestForm(issue)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Request Funds
                      </button>
                    )}
                    {(issue.status === 'IN_PROGRESS' || issue.status === 'PENDING_APPROVAL') && (
                      <button
                        onClick={() => openCompleteForm(issue)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complete Issue
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showActionPointForm && selectedIssue && (
        <AddActionPointForm
          issueId={selectedIssue._id}
          onActionAdded={handleActionPointAdded}
          onClose={() => setShowActionPointForm(false)}
        />
      )}

      {showLegalActionForm && selectedIssue && (
        <AddLegalActionForm
          issueId={selectedIssue._id}
          onActionAdded={(action) => { setShowLegalActionForm(false); handleActionPointAdded(action); }}
          onClose={() => setShowLegalActionForm(false)}
        />
      )}

      {showExpenseForm && selectedIssue && (
        <RecordExpenseForm
          issueId={selectedIssue._id}
          fundApprovalId={selectedIssue.fundApprovalId}
          onExpenseAdded={handleExpenseRecorded}
          onClose={() => setShowExpenseForm(false)}
        />
      )}

      {showFundRequestForm && selectedIssue && (
        <FundRequestForm
          issueId={selectedIssue._id}
          issueTitle={selectedIssue.title}
          onFundRequested={handleFundRequested}
          onClose={() => setShowFundRequestForm(false)}
        />
      )}

      {showCompleteForm && selectedIssue && (
        <CompleteIssueForm
          issueId={selectedIssue._id}
          allocatedBudget={selectedIssue.allocatedBudget}
          utilizedBudget={selectedIssue.utilizedBudget}
          onIssueCompleted={handleIssueCompleted}
          onClose={() => setShowCompleteForm(false)}
        />
      )}
    </div>
  );
};

export default IssueManagement;
