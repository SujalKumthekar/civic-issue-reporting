import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp, MapPin, Calendar, User, Eye, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EnhancedIssuesFeed = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
  }, [selectedCategory]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      let url = '/api/issues';
      if (selectedCategory !== 'all') {
        url = `/api/issue-tracking/status/${selectedCategory}`;
      }
      const response = await axios.get(url);
      setIssues(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SUBMITTED: { bg: 'bg-gray-100', text: 'text-gray-800' },
      ACKNOWLEDGED: { bg: 'bg-purple-100', text: 'text-purple-800' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800' },
      PENDING_FUNDS: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      PENDING_APPROVAL: { bg: 'bg-orange-100', text: 'text-orange-800' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800' }
    };
    const config = statusConfig[status] || statusConfig.SUBMITTED;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="text-center py-12">Loading issues...</div>;

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['all', 'SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedCategory(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCategory === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status === 'all' ? 'All Issues' : status}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Issues Grid */}
      <div className="space-y-4">
        {issues.map((issue) => (
          <div
            key={issue._id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate(`/issues/${issue._id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{issue.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{issue.description}</p>
              </div>
              <div className="ml-4">{getStatusBadge(issue.status)}</div>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{issue.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{issue.nagarpalika}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ThumbsUp className="w-4 h-4" />
                <span>{issue.supporters?.length || 0} Supporters</span>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {issue.acknowledgedBy && (
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium text-gray-900">Acknowledged</p>
                </div>
              )}
              {issue.allocatedBudget > 0 && (
                <div>
                  <p className="text-gray-600">Allocated</p>
                  <p className="font-medium text-green-700">₹{issue.allocatedBudget}</p>
                </div>
              )}
              {issue.utilizedBudget > 0 && (
                <div>
                  <p className="text-gray-600">Spent</p>
                  <p className="font-medium text-blue-700">₹{issue.utilizedBudget}</p>
                </div>
              )}
              {issue.category && (
                <div>
                  <p className="text-gray-600">Category</p>
                  <p className="font-medium text-gray-900 capitalize">{issue.category}</p>
                </div>
              )}
            </div>

            {/* Progress Bar (if in progress or completed) */}
            {(issue.status === 'IN_PROGRESS' || issue.status === 'COMPLETED') && issue.allocatedBudget > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Budget Usage</span>
                  <span className="text-sm text-gray-600">
                    {issue.allocatedBudget > 0 ? Math.round((issue.utilizedBudget / issue.allocatedBudget) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition ${
                      (issue.utilizedBudget / issue.allocatedBudget) > 0.9 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((issue.utilizedBudget / issue.allocatedBudget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* View Details Link */}
            <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800">
              <Eye className="w-4 h-4" />
              View Full Details
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {issues.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <p>No issues found in this category</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedIssuesFeed;
