import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, TrendingUp, CheckCircle2, Zap, BarChart3 } from 'lucide-react';
import FundApprovalDashboard from './FundApprovalDashboard';
import FundUtilizationMonitor from './FundUtilizationMonitor';
import CompletionReview from './CompletionReview';
import IssueStatsDashboard from './IssueStatsDashboard';

const DistrictAuthorityMainDashboard = () => {
  const [stats, setStats] = useState({
    totalIssues: 0,
    completedIssues: 0,
    pendingFundReqs: 0,
    totalBudgetAllocated: 0,
    totalBudgetUtilized: 0,
    completionRate: 0,
    highPriorityIssues: 0,
    averageCompletionTime: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/issue-tracking/stats/dashboard');
      
      const {
        totalIssues = 0,
        completedIssues = 0,
        byStatus = {},
        budgetSummary = {},
        completionRate = 0
      } = response.data;

      const pendingFunds = byStatus.PENDING_FUNDS || 0;
      const totalBudgetAllocated = budgetSummary.totalAllocated || 0;
      const totalBudgetUtilized = budgetSummary.totalUtilized || 0;

      setStats({
        totalIssues,
        completedIssues,
        pendingFundReqs: pendingFunds,
        totalBudgetAllocated,
        totalBudgetUtilized,
        completionRate: Math.round(completionRate * 100) / 100,
        highPriorityIssues: byStatus.ACKNOWLEDGED || 0,
        averageCompletionTime: 0 // Would need to calculate from actual data
      });
      setError('');
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      red: 'bg-red-50 border-red-200 text-red-700'
    };

    return (
      <div className={`p-4 rounded-lg border ${colorClasses[color]} bg-opacity-50`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">{title}</p>
            <p className="text-2xl font-bold mt-2 text-gray-900">{value}</p>
            {trend && <p className="text-xs text-gray-600 mt-1">{trend}</p>}
          </div>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    );
  };

  const utilizationRate = stats.totalBudgetAllocated > 0
    ? Math.round((stats.totalBudgetUtilized / stats.totalBudgetAllocated) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-4xl font-bold text-gray-900">District Authority Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all civic issues across your district</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow p-0">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-4 px-6 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'approvals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Fund Approvals
            </button>
            <button
              onClick={() => setActiveTab('utilization')}
              className={`py-4 px-6 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'utilization'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Budget Utilization
            </button>
            <button
              onClick={() => setActiveTab('completion')}
              className={`py-4 px-6 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'completion'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Completion Review
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-6 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Statistics
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={AlertCircle}
                title="Total Issues"
                value={stats.totalIssues}
                color="blue"
              />
              <StatCard
                icon={CheckCircle2}
                title="Completed"
                value={stats.completedIssues}
                trend={`${stats.completionRate}% completion rate`}
                color="green"
              />
              <StatCard
                icon={TrendingUp}
                title="Pending Fund Requests"
                value={stats.pendingFundReqs}
                color="yellow"
              />
              <StatCard
                icon={AlertCircle}
                title="High Priority"
                value={stats.highPriorityIssues}
                color="red"
              />
            </div>

            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={BarChart3}
                title="Total Budget Allocated"
                value={`₹${stats.totalBudgetAllocated.toLocaleString()}`}
                color="blue"
              />
              <StatCard
                icon={Zap}
                title="Budget Utilized"
                value={`₹${stats.totalBudgetUtilized.toLocaleString()}`}
                trend={`${utilizationRate}% utilization`}
                color={utilizationRate > 90 ? 'red' : 'yellow'}
              />
              <StatCard
                icon={CheckCircle2}
                title="Budget Remaining"
                value={`₹${(stats.totalBudgetAllocated - stats.totalBudgetUtilized).toLocaleString()}`}
                color="green"
              />
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Completion Rate */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">District Performance</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-green-600">{stats.completionRate}%</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.completedIssues} of {stats.totalIssues} issues completed
                    </p>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{Math.round(stats.completionRate)}%</span>
                  </div>
                </div>
              </div>

              {/* Budget Utilization */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Budget Health</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Utilization Rate</span>
                    <span className="font-bold text-gray-900">{utilizationRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        utilizationRate > 90 ? 'bg-red-600' : utilizationRate > 75 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {utilizationRate > 90
                      ? '⚠️ Budget highly utilized'
                      : utilizationRate > 75
                      ? '⚠️ Monitor spending carefully'
                      : '✓ Budget on track'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Review Fund Requests
                </button>
                <button
                  onClick={() => setActiveTab('utilization')}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  Monitor Budget
                </button>
                <button
                  onClick={() => setActiveTab('completion')}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                >
                  Review Completions
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fund Approvals Tab */}
        {activeTab === 'approvals' && (
          <FundApprovalDashboard />
        )}

        {/* Budget Utilization Tab */}
        {activeTab === 'utilization' && (
          <FundUtilizationMonitor />
        )}

        {/* Completion Review Tab */}
        {activeTab === 'completion' && (
          <CompletionReview />
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <IssueStatsDashboard />
        )}
      </div>
    </div>
  );
};

export default DistrictAuthorityMainDashboard;
