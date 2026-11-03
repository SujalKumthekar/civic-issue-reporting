import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Zap, CheckCircle2, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import IssueManagement from './IssueManagement';

const NagarpalikaMainDashboard = () => {
  const [stats, setStats] = useState({
    totalIssues: 0,
    acknowledgedIssues: 0,
    inProgressIssues: 0,
    completedIssues: 0,
    totalBudgetAllocated: 0,
    totalBudgetUtilized: 0,
    totalBudgetRemaining: 0,
    completionRate: 0,
    averageCostPerIssue: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Get nagarpalika ID from user session (you may need to adjust this based on your auth context)
  const nagarpalikaId = localStorage.getItem('nagarpalikaId') || 'all';

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
        inProgressIssues = 0,
        byStatus = {},
        budgetSummary = {},
        completionRate = 0
      } = response.data;

      const acknowledged = byStatus.ACKNOWLEDGED || 0;
      const totalBudgetAllocated = budgetSummary.totalAllocated || 0;
      const totalBudgetUtilized = budgetSummary.totalUtilized || 0;
      const totalBudgetRemaining = totalBudgetAllocated - totalBudgetUtilized;
      const avgCost = totalIssues > 0 ? (totalBudgetUtilized / totalIssues) : 0;

      setStats({
        totalIssues,
        acknowledgedIssues: acknowledged,
        inProgressIssues,
        completedIssues,
        totalBudgetAllocated,
        totalBudgetUtilized,
        totalBudgetRemaining,
        completionRate: Math.round(completionRate * 100) / 100,
        averageCostPerIssue: Math.round(avgCost)
      });
      setError('');
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtext, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      red: 'bg-red-50 border-red-200 text-red-700'
    };

    return (
      <div className={`p-4 rounded-lg border ${colorClasses[color]} bg-opacity-50`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">{title}</p>
            <p className="text-2xl font-bold mt-2 text-gray-900">{value}</p>
            {subtext && <p className="text-xs text-gray-600 mt-1">{subtext}</p>}
          </div>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-4xl font-bold text-gray-900">Nagarpalika Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and manage civic issues in your municipality</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow p-0">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-4 px-6 font-medium border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`flex-1 py-4 px-6 font-medium border-b-2 transition ${
                activeTab === 'issues'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Issue Management
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
                icon={Clock}
                title="Acknowledged"
                value={stats.acknowledgedIssues}
                color="yellow"
              />
              <StatCard
                icon={TrendingUp}
                title="In Progress"
                value={stats.inProgressIssues}
                color="purple"
              />
              <StatCard
                icon={CheckCircle2}
                title="Completed"
                value={stats.completedIssues}
                color="green"
              />
            </div>

            {/* Budget Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={BarChart3}
                title="Budget Allocated"
                value={`₹${stats.totalBudgetAllocated.toLocaleString()}`}
                color="blue"
              />
              <StatCard
                icon={Zap}
                title="Budget Utilized"
                value={`₹${stats.totalBudgetUtilized.toLocaleString()}`}
                color="yellow"
              />
              <StatCard
                icon={TrendingUp}
                title="Budget Remaining"
                value={`₹${stats.totalBudgetRemaining.toLocaleString()}`}
                color="green"
              />
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Completion Rate</h3>
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

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Average Cost Per Issue</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-600">₹{stats.averageCostPerIssue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Based on {stats.totalIssues} issues
                    </p>
                  </div>
                  <BarChart3 className="w-20 h-20 text-blue-600 opacity-20" />
                </div>
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Budget Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Utilization Rate</span>
                    <span className="text-sm font-medium text-gray-900">
                      {stats.totalBudgetAllocated > 0 
                        ? Math.round((stats.totalBudgetUtilized / stats.totalBudgetAllocated) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        (stats.totalBudgetUtilized / stats.totalBudgetAllocated) > 0.9
                          ? 'bg-red-600'
                          : 'bg-blue-600'
                      }`}
                      style={{
                        width: stats.totalBudgetAllocated > 0 
                          ? `${(stats.totalBudgetUtilized / stats.totalBudgetAllocated) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div>
                    <p className="text-xs text-gray-600">Total Allocated</p>
                    <p className="text-lg font-bold text-gray-900">₹{stats.totalBudgetAllocated.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Spent</p>
                    <p className="text-lg font-bold text-orange-700">₹{stats.totalBudgetUtilized.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Balance</p>
                    <p className="text-lg font-bold text-green-700">₹{stats.totalBudgetRemaining.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <IssueManagement nagarpalikaId={nagarpalikaId} />
        )}
      </div>
    </div>
  );
};

export default NagarpalikaMainDashboard;
