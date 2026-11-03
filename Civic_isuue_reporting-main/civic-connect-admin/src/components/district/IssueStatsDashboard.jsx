import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, BarChart3, PieChart, LineChart } from 'lucide-react';

const IssueStatsDashboard = () => {
  const [stats, setStats] = useState({
    byStatus: {},
    byNagarpalika: [],
    budgetSummary: {},
    completionStats: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('status');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/issue-tracking/stats/dashboard');
      
      setStats({
        byStatus: response.data.byStatus || {},
        byNagarpalika: response.data.byNagarpalika || [],
        budgetSummary: response.data.budgetSummary || {},
        completionStats: response.data.completionStats || {}
      });
      setError('');
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalIssues = Object.values(stats.byStatus || {}).reduce((a, b) => a + b, 0);

  const renderStatusChart = () => {
    const statusOrder = ['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'PENDING_FUNDS', 'COMPLETED'];
    
    return (
      <div className="space-y-4">
        {statusOrder.map(status => {
          const count = stats.byStatus[status] || 0;
          const percentage = totalIssues > 0 ? (count / totalIssues) * 100 : 0;
          
          const colors = {
            SUBMITTED: 'bg-gray-400',
            ACKNOWLEDGED: 'bg-purple-500',
            IN_PROGRESS: 'bg-blue-500',
            PENDING_FUNDS: 'bg-yellow-500',
            COMPLETED: 'bg-green-500'
          };

          return (
            <div key={status} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{status}</h4>
                <span className="text-lg font-bold text-gray-900">{count} ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${colors[status]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderNagarpalikaStats = () => {
    const sortedNagarpalika = (stats.byNagarpalika || [])
      .sort((a, b) => (b.totalIssues || 0) - (a.totalIssues || 0));

    return (
      <div className="space-y-4">
        {sortedNagarpalika.map((nag, idx) => {
          const completed = nag.completedIssues || 0;
          const total = nag.totalIssues || 0;
          const completionRate = total > 0 ? (completed / total) * 100 : 0;

          return (
            <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{nag.name || `Municipality ${idx + 1}`}</h4>
                  <p className="text-sm text-gray-600">{total} total issues</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  completionRate === 100 ? 'bg-green-100 text-green-800' :
                  completionRate > 75 ? 'bg-blue-100 text-blue-800' :
                  completionRate > 50 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {completionRate.toFixed(0)}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all ${
                    completionRate === 100 ? 'bg-green-500' :
                    completionRate > 75 ? 'bg-blue-500' :
                    completionRate > 50 ? 'bg-yellow-500' :
                    'bg-orange-500'
                  }`}
                  style={{ width: `${completionRate}%` }}
                />
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div>
                  <p className="text-gray-600">Submitted</p>
                  <p className="font-bold text-gray-900">{nag.submittedIssues || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Progress</p>
                  <p className="font-bold text-gray-900">{nag.inProgressIssues || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Pending</p>
                  <p className="font-bold text-gray-900">{nag.pendingIssues || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Completed</p>
                  <p className="font-bold text-green-700">{completed}</p>
                </div>
              </div>

              {nag.allocatedBudget && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
                  <span className="text-gray-600">Budget Used:</span>
                  <span className="font-bold text-gray-900">
                    ₹{(nag.utilizedBudget || 0).toLocaleString()} / ₹{nag.allocatedBudget.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderBudgetStats = () => {
    const { totalAllocated = 0, totalUtilized = 0, byCategory = {} } = stats.budgetSummary;
    const categories = Object.keys(byCategory || {});

    return (
      <div className="space-y-4">
        {/* Overall Budget */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Overall Budget</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Total Allocated</p>
              <p className="text-2xl font-bold text-blue-700">₹{totalAllocated.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Utilized</p>
              <p className="text-2xl font-bold text-orange-700">₹{totalUtilized.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-green-700">
                ₹{(totalAllocated - totalUtilized).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Utilization Rate</span>
              <span className="text-sm font-bold text-gray-900">
                {totalAllocated > 0 ? ((totalUtilized / totalAllocated) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  totalAllocated > 0 && totalUtilized > totalAllocated ? 'bg-red-600' :
                  totalAllocated > 0 && (totalUtilized / totalAllocated) > 0.9 ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}
                style={{
                  width: totalAllocated > 0 ? `${Math.min((totalUtilized / totalAllocated) * 100, 100)}%` : '0%'
                }}
              />
            </div>
          </div>
        </div>

        {/* By Category */}
        {categories.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Expense Breakdown by Category</h3>
            <div className="space-y-3">
              {categories.map(category => {
                const amount = byCategory[category] || 0;
                const percentage = totalUtilized > 0 ? (amount / totalUtilized) * 100 : 0;

                return (
                  <div key={category} className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-900">{category}</span>
                      <span className="font-bold text-gray-900">₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{percentage.toFixed(1)}% of total spent</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive statistics and performance metrics</p>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setViewMode('status')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'status'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            By Status
          </button>
          <button
            onClick={() => setViewMode('nagarpalika')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'nagarpalika'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PieChart className="w-4 h-4" />
            By Municipality
          </button>
          <button
            onClick={() => setViewMode('budget')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'budget'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <LineChart className="w-4 h-4" />
            Budget Analysis
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-8 bg-white rounded-lg">
          <p className="text-gray-500">Loading statistics...</p>
        </div>
      ) : (
        <>
          {viewMode === 'status' && (
            <div>
              <div className="bg-white rounded-lg shadow p-6 mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Issues by Status</h2>
                <p className="text-sm text-gray-600 mb-4">Total Issues: {totalIssues}</p>
                {renderStatusChart()}
              </div>
            </div>
          )}

          {viewMode === 'nagarpalika' && (
            <div>
              <div className="bg-white rounded-lg shadow p-6 mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Municipality Performance</h2>
                {renderNagarpalikaStats()}
              </div>
            </div>
          )}

          {viewMode === 'budget' && (
            <div>
              {renderBudgetStats()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IssueStatsDashboard;
