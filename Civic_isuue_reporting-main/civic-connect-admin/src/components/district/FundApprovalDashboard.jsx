import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, Check, X, AlertCircle } from 'lucide-react';

const FundApprovalDashboard = () => {
  const [pendingRequests, setFundRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('REQUESTED');
  const [approvalForm, setApprovalForm] = useState({});

  const statuses = ['REQUESTED', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'DISBURSED', 'UTILIZED'];

  useEffect(() => {
    fetchPendingRequests();
  }, [statusFilter]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const endpoint = statusFilter === 'REQUESTED'
        ? 'http://localhost:5000/api/funds/pending/all'
        : `http://localhost:5000/api/funds?status=${statusFilter}`;
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFundRequests(response.data.fundRequests || response.data);
      setError('');
    } catch (err) {
      setError('Failed to load fund requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRequestExpand = (requestId) => {
    setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
  };

  const handleApprovalInputChange = (requestId, field, value) => {
    setApprovalForm(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [field]: field === 'approvedAmount' ? Number(value) : value
      }
    }));
  };

  const submitApproval = async (fundRequestId, approvalStatus) => {
    const form = approvalForm[fundRequestId];
    
    if (!form?.approvedAmount || form.approvedAmount <= 0) {
      setError('Approved amount must be greater than 0');
      return;
    }

    if (!form?.approvalRemark) {
      setError('Approval remark is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`http://localhost:5000/api/funds/approve/${fundRequestId}`, {
        fundRequestId,
        approvedAmount: form.approvedAmount,
        approvalStatus,
        remarks: form.approvalRemark,
        approvedBy: localStorage.getItem('officerName') || 'District Officer'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFundRequests(prev =>
        prev.map(req =>
          req._id === fundRequestId ? { ...req, status: approvalStatus } : req
        )
      );

      setError('');
      setExpandedRequestId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve fund request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      REQUESTED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      APPROVED: 'bg-green-100 text-green-800 border-green-300',
      PARTIALLY_APPROVED: 'bg-blue-100 text-blue-800 border-blue-300',
      REJECTED: 'bg-red-100 text-red-800 border-red-300',
      DISBURSED: 'bg-purple-100 text-purple-800 border-purple-300',
      UTILIZED: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Fund Approval Dashboard</h1>
        <p className="text-gray-600">Review and approve fund requests from municipalities</p>
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Fund Requests List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500">Loading fund requests...</p>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500">No fund requests found</p>
          </div>
        ) : (
          pendingRequests.map(request => (
            <div key={request._id} className="bg-white rounded-lg shadow hover:shadow-md transition">
              {/* Request Header */}
              <div
                onClick={() => toggleRequestExpand(request._id)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex gap-3 items-start">
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition flex-shrink-0 mt-1 ${
                          expandedRequestId === request._id ? 'rotate-180' : ''
                        }`}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">Fund Request #{request._id.slice(-6)}</h3>
                        <p className="text-sm text-gray-600 mt-1">{request.justification}</p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                            ₹{request.totalAmountRequested.toLocaleString()}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                            Submitted by: {request.submittedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              {expandedRequestId === request._id && (
                <div className="border-t p-4 bg-gray-50 space-y-4">
                  {/* Timeline & Request Timeline */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-sm text-gray-600">Requested Timeline</p>
                      <p className="font-semibold text-gray-900">{new Date(request.requestedTimeline).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-sm text-gray-600">Budget Line Item</p>
                      <p className="font-semibold text-gray-900">{request.budgetLineItem || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Breakdown Items */}
                  {request.breakdown && request.breakdown.length > 0 && (
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Budget Breakdown</h4>
                      <div className="space-y-2">
                        {request.breakdown.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start p-2 bg-gray-50 rounded border border-gray-100">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.itemName}</p>
                              <p className="text-sm text-gray-600">{item.purpose}</p>
                            </div>
                            <p className="font-bold text-gray-900 whitespace-nowrap ml-4">₹{item.amount.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                        <p className="font-semibold text-gray-900">Total</p>
                        <p className="font-bold text-blue-700">₹{request.totalAmountRequested.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {/* Support Documents */}
                  {request.supportDocumentsUrls && request.supportDocumentsUrls.length > 0 && (
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Support Documents ({request.supportDocumentsUrls.length})</h4>
                      <div className="text-sm text-gray-600">
                        <p className="bg-blue-50 p-2 rounded border border-blue-200">
                          {request.supportDocumentsUrls.length} document(s) uploaded for review
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Approval Form */}
                  {(request.status === 'REQUESTED' || request.status === 'REJECTED') && (
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Approval Decision</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Approved Amount (₹) *
                          </label>
                          <input
                            type="number"
                            value={approvalForm[request._id]?.approvedAmount || request.totalAmountRequested}
                            onChange={(e) => handleApprovalInputChange(request._id, 'approvedAmount', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            Requested: ₹{request.totalAmountRequested.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Remarks/Conditions *
                          </label>
                          <textarea
                            value={approvalForm[request._id]?.approvalRemark || ''}
                            onChange={(e) => handleApprovalInputChange(request._id, 'approvalRemark', e.target.value)}
                            placeholder="Any conditions or remarks for this approval"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="2"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => submitApproval(request._id, 'APPROVED')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => submitApproval(request._id, 'PARTIALLY_APPROVED')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                          >
                            Partial Approve
                          </button>
                          <button
                            onClick={() => submitApproval(request._id, 'REJECTED')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FundApprovalDashboard;
