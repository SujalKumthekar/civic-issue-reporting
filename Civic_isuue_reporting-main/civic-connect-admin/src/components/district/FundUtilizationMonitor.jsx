import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingDown, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';

const FundUtilizationMonitor = () => {
  const [systemStats, setSystemStats] = useState({
    totalAllocated: 0,
    totalUtilized: 0,
    byNagarpalika: [],
    byCategory: {},
    issues: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('overview');

  useEffect(() => {
    fetchUtilizationData();
  }, []);

  const fetchUtilizationData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/issue-tracking/stats/dashboard');
      
      const {
        budgetSummary = {},
        byNagarpalika = [],
        byStatus = {}
      } = response.data;

      // Fetch all expenses by category
      const expenseResponse = await axios.get('http://localhost:5000/api/expenses');
      const expensesByCategory = (expenseResponse.data || []).reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amountSpent;
        return acc;
      }, {});

      setSystemStats({
        totalAllocated: budgetSummary.totalAllocated || 0,
        totalUtilized: budgetSummary.totalUtilized || 0,
        byNagarpalika: byNagarpalika || [],
        byCategory: expensesByCategory,
        issues: [] // Will be fetched separately if needed
      });

      setError('');
    } catch (err) {
      setError('Failed to load utilization data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const utilizationRate = systemStats.totalAllocated > 0 
    ? ((systemStats.totalUtilized / systemStats.totalAllocated) * 100).toFixed(1)
    : 0;

  const remaining = systemStats.totalAllocated - systemStats.totalUtilized;
  const isOverBudget = systemStats.totalUtilized > systemStats.totalAllocated;

  const categories = Object.keys(systemStats.byCategory).sort();
  const maxCategoryAmount = Math.max(...Object.values(systemStats.byCategory), 1);

  // Sort nagarpalika by utilization
  const nagarpalikasByUtilization = (systemStats.byNagarpalika || [])
    .sort((a, b) => {
      const aUtil = a.utilizedBudget || 0;
      const bUtil = b.utilizedBudget || 0;
      return bUtil - aUtil;
    });

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      red: 'text-red-600 bg-red-50',
      yellow: 'text-yellow-600 bg-yellow-50'
    };

    return (
      <div className={`p-4 rounded-lg border border-gray-200 ${colorClasses[color]}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">{title}</p>
            <p className="text-2xl font-bold mt-2 text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <Icon className="w-6 h-6 opacity-50" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Fund Utilization Monitor</h1>
        <p className="text-gray-600">Track budget allocation and spending across all municipalities</p>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('nagarpalika')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'nagarpalika'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Municipality
          </button>
          <button
            onClick={() => setViewMode('category')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'category'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Category
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 bg-white rounded-lg">
          <p className="text-gray-500">Loading utilization data...</p>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {viewMode === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Allocated"
                  value={`₹${systemStats.totalAllocated.toLocaleString()}`}
                  color="blue"
                  icon={BarChart3}
                />
                <StatCard
                  title="Total Utilized"
                  value={`₹${systemStats.totalUtilized.toLocaleString()}`}
                  color={isOverBudget ? 'red' : 'green'}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Remaining"
                  value={`₹${Math.max(remaining, 0).toLocaleString()}`}
                  color={remaining < 0 ? 'red' : 'green'}
                  icon={TrendingDown}
                />
                <StatCard
                  title="Utilization Rate"
                  value={`${utilizationRate}%`}
                  color={utilizationRate > 90 ? 'red' : 'blue'}
                  icon={BarChart3}
                />
              </div>

              {/* Utilization Progress */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Budget Status</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Budget Utilization</span>
                      <span className="text-sm font-bold text-gray-900">{utilizationRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all ${
                          utilizationRate > 90 ? 'bg-red-600' : utilizationRate > 75 ? 'bg-yellow-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                      <p className="text-xs text-gray-600">Total Allocated</p>
                      <p className="text-xl font-bold text-blue-700">₹{systemStats.totalAllocated.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 rounded border ${isOverBudget ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                      <p className="text-xs text-gray-600">Utilized</p>
                      <p className={`text-xl font-bold ${isOverBudget ? 'text-red-700' : 'text-green-700'}`}>
                        ₹{systemStats.totalUtilized.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-4 rounded border ${remaining < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                      <p className="text-xs text-gray-600">Remaining</p>
                      <p className={`text-xl font-bold ${remaining < 0 ? 'text-red-700' : 'text-gray-900'}`}>
                        ₹{Math.abs(remaining).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {isOverBudget && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded mt-4">
                      <p className="text-red-700 font-semibold">⚠️ Over Budget</p>
                      <p className="text-red-600 text-sm mt-1">
                        Budget exceeded by ₹{Math.abs(remaining).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Nagarpalika Tab */}
          {viewMode === 'nagarpalika' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Municipality-wise Budget Utilization</h2>
              <div className="space-y-3">
                {nagarpalikasByUtilization.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No municipality data available</p>
                ) : (
                  nagarpalikasByUtilization.map((nag, idx) => {
                    const allocated = nag.allocatedBudget || 0;
                    const utilized = nag.utilizedBudget || 0;
                    const rate = allocated > 0 ? (utilized / allocated) * 100 : 0;
                    const isOver = utilized > allocated;

                    return (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{nag.nagarpalikaName || `Municipality ${idx + 1}`}</h3>
                            <p className="text-sm text-gray-600">Issues: {nag.totalIssues || 0}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isOver ? 'bg-red-100 text-red-700' : rate > 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {rate.toFixed(1)}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOver ? 'bg-red-600' : rate > 80 ? 'bg-yellow-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(rate, 100)}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Allocated</p>
                            <p className="font-bold text-gray-900">₹{allocated.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Utilized</p>
                            <p className={`font-bold ${isOver ? 'text-red-700' : 'text-gray-900'}`}>
                              ₹{utilized.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Remaining</p>
                            <p className={`font-bold ${isOver ? 'text-red-700' : 'text-green-700'}`}>
                              ₹{Math.abs(allocated - utilized).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Category Tab */}
          {viewMode === 'category' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown by Category</h2>
              <div className="space-y-4">
                {categories.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No expense data available</p>
                ) : (
                  categories.map((category, idx) => {
                    const amount = systemStats.byCategory[category] || 0;
                    const percentage = systemStats.totalUtilized > 0 
                      ? (amount / systemStats.totalUtilized) * 100 
                      : 0;

                    return (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{category}</h3>
                          <span className="text-lg font-bold text-gray-900">₹{amount.toLocaleString()}</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <p className="text-sm text-gray-600 mt-2">
                          {percentage.toFixed(1)}% of total spent
                        </p>
                      </div>
                    );
                  })
                )}

                {/* Total by Category */}
                {categories.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-900">Total Expenses</p>
                      <p className="text-2xl font-bold text-blue-700">₹{systemStats.totalUtilized.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FundUtilizationMonitor;
