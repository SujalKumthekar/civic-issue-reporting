import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, Check, X, AlertCircle, Star } from 'lucide-react';

const CompletionReview = () => {
  const [completedIssues, setCompletedIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('COMPLETED');

  useEffect(() => {
    fetchCompletedIssues();
  }, [statusFilter]);

  const fetchCompletedIssues = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/completions/all');
      setCompletedIssues(response.data.completedIssues || response.data);
      setError('');
    } catch (err) {
      setError('Failed to load completed issues');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleIssueExpand = (issueId) => {
    setExpandedIssueId(expandedIssueId === issueId ? null : issueId);
  };

  const handleApproveCompletion = async (issueId) => {
    try {
      setLoading(true);
      // This would approve the completion in your backend
      // For now, we'll just fetch the updated data
      await axios.put(`/api/completions/${issueId}`, { approved: true });
      fetchCompletedIssues();
    } catch (err) {
      setError('Failed to approve completion');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCompletion = async (issueId) => {
    try {
      setLoading(true);
      await axios.put(`/api/completions/${issueId}`, { approved: false });
      fetchCompletedIssues();
    } catch (err) {
      setError('Failed to reject completion');
    } finally {
      setLoading(false);
    }
  };

  const getQualityBadge = (status) => {
    const badges = {
      PASSED: 'bg-green-100 text-green-800 border-green-300',
      FAILED: 'bg-red-100 text-red-800 border-red-300'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-900">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Completion Review</h1>
        <p className="text-gray-600">Review and approve completed civic issues</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Completed Issues List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500">Loading completed issues...</p>
          </div>
        ) : completedIssues.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500">No completed issues found</p>
          </div>
        ) : (
          completedIssues.map(completion => {
            const issue = completion.issueId || {};

            return (
              <div key={completion._id} className="bg-white rounded-lg shadow hover:shadow-md transition">
                {/* Completion Header */}
                <div
                  onClick={() => toggleIssueExpand(completion._id)}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex gap-3 items-start">
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition flex-shrink-0 mt-1 ${
                            expandedIssueId === completion._id ? 'rotate-180' : ''
                          }`}
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{issue.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{issue.location}</p>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getQualityBadge(completion.qualityCheckStatus)}`}>
                              Quality: {completion.qualityCheckStatus}
                            </span>
                            <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                              ₹{completion.actualCost?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedIssueId === completion._id && (
                  <div className="border-t p-4 bg-gray-50 space-y-4">
                    {/* Completion Summary */}
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Completion Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <p className="text-gray-600">Work Summary</p>
                          <p className="font-medium text-gray-900">{completion.workSummary}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-gray-600">Completion Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(completion.completionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-gray-600">Responsible Officer</p>
                          <p className="font-medium text-gray-900">{completion.responsibleOfficer}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-gray-600">Quality Officer</p>
                          <p className="font-medium text-gray-900">{completion.qualityOfficer}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quality Check Details */}
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Quality Verification</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-700">Quality Check Status</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getQualityBadge(completion.qualityCheckStatus)}`}>
                            {completion.qualityCheckStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-gray-700">Check Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(completion.qualityCheckDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Budget Details */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-sm text-gray-600">Approved Budget</p>
                        <p className="text-xl font-bold text-blue-700">
                          ₹{completion.approvedBudget?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p className="text-sm text-gray-600">Actual Cost</p>
                        <p className="text-xl font-bold text-yellow-700">
                          ₹{completion.actualCost?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className={`p-3 rounded border ${
                        (completion.approvedBudget || 0) >= (completion.actualCost || 0)
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <p className="text-sm text-gray-600">Variance</p>
                        <p className={`text-xl font-bold ${
                          (completion.approvedBudget || 0) >= (completion.actualCost || 0)
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}>
                          ₹{((completion.approvedBudget || 0) - (completion.actualCost || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Photos */}
                    {(completion.preWorkPhotoUrl || completion.postCompletionPhotoUrl) && (
                      <div className="bg-white p-4 rounded border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Project Photos</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {completion.preWorkPhotoUrl && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Before</p>
                              <img
                                src={completion.preWorkPhotoUrl}
                                alt="Before work"
                                className="w-full h-32 object-cover rounded border border-gray-200"
                              />
                            </div>
                          )}
                          {completion.postCompletionPhotoUrl && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">After</p>
                              <img
                                src={completion.postCompletionPhotoUrl}
                                alt="After work"
                                className="w-full h-32 object-cover rounded border border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Citizen Feedback */}
                    {(completion.citizenRating || completion.citizenFeedback) && (
                      <div className="bg-white p-4 rounded border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Citizen Feedback</h4>
                        <div className="space-y-2">
                          {completion.citizenRating && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Rating</p>
                              {renderStars(completion.citizenRating)}
                            </div>
                          )}
                          {completion.citizenFeedback && (
                            <div>
                              <p className="text-sm text-gray-600">Feedback</p>
                              <p className="text-gray-900 mt-1">{completion.citizenFeedback}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Approval Actions */}
                    <div className="flex gap-2 border-t pt-4">
                      <button
                        onClick={() => handleApproveCompletion(completion._id)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                      >
                        <Check className="w-4 h-4" />
                        Approve Completion
                      </button>
                      <button
                        onClick={() => handleRejectCompletion(completion._id)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CompletionReview;
