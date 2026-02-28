import React, { useState } from 'react';
import { 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const BudgetOverview = ({ 
  budget = 0, 
  totalExpenses = 0, 
  categories = [], 
  currency = 'USD',
  dailyAverage = 0,
  startDate,
  endDate,
  onAdjustBudget 
}) => {
  const [showTips, setShowTips] = useState(false);
  
  // Handle case when budget is 0 or not set
  const hasBudget = budget > 0;
  const remaining = hasBudget ? budget - totalExpenses : 0;
  const spentPercentage = hasBudget ? (totalExpenses / budget) * 100 : 0;
  const isOverBudget = hasBudget && remaining < 0;
  
  // Calculate days remaining in trip
  const getDaysRemaining = () => {
    if (!startDate || !endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();
  const dailyBudget = daysRemaining > 0 ? remaining / daysRemaining : 0;

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return `${currency} 0`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' };
    return symbols[currency] || '$';
  };

  // Get status color based on spending
  const getStatusColor = () => {
    if (spentPercentage > 100) return 'text-red-600';
    if (spentPercentage > 80) return 'text-yellow-600';
    if (spentPercentage > 50) return 'text-blue-600';
    return 'text-green-600';
  };

  // Get progress bar color
  const getProgressColor = () => {
    if (spentPercentage > 100) return 'bg-red-500';
    if (spentPercentage > 80) return 'bg-yellow-500';
    if (spentPercentage > 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Budget tips based on spending patterns
  const getBudgetTips = () => {
    const tips = [];
    
    if (isOverBudget) {
      tips.push({
        icon: '⚠️',
        title: 'You\'re over budget!',
        description: `Consider reviewing your expenses or increasing your budget by ${formatCurrency(Math.abs(remaining))}.`
      });
    } else if (remaining < budget * 0.2) {
      tips.push({
        icon: '💡',
        title: 'Budget running low',
        description: `You have only ${formatCurrency(remaining)} left. Try to cut back on non-essential expenses.`
      });
    } else if (spentPercentage < 30 && daysRemaining && daysRemaining > 0) {
      tips.push({
        icon: '🎯',
        title: 'Under budget!',
        description: `You're spending less than planned. You have ${formatCurrency(remaining)} left for the remaining ${daysRemaining} days.`
      });
    }

    if (dailyAverage > 0) {
      tips.push({
        icon: '📊',
        title: 'Daily average',
        description: `You're spending an average of ${formatCurrency(dailyAverage)} per day.`
      });
    }

    if (daysRemaining && dailyBudget > 0) {
      tips.push({
        icon: '💰',
        title: 'Daily budget remaining',
        description: `You can spend ${formatCurrency(dailyBudget)} per day for the rest of your trip.`
      });
    }

    return tips;
  };

  const budgetTips = getBudgetTips();

  // If no budget is set, show a message with CTA
  if (!hasBudget) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CurrencyDollarIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Budget Set</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Set a budget to track your expenses and manage your spending effectively.
          </p>
          <button
            onClick={onAdjustBudget}
            className="btn-primary inline-flex items-center"
          >
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Set Your Budget
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <ChartBarIcon className="h-5 w-5 text-primary-600 mr-2" />
          Budget Overview
        </h2>
        <button
          onClick={() => setShowTips(!showTips)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
        >
          <InformationCircleIcon className="h-4 w-4 mr-1" />
          {showTips ? 'Hide Tips' : 'Show Tips'}
        </button>
      </div>
      
      {/* Budget Tips */}
      {showTips && budgetTips.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
            <InformationCircleIcon className="h-4 w-4 mr-2" />
            Budget Insights
          </h3>
          <div className="space-y-3">
            {budgetTips.map((tip, index) => (
              <div key={index} className="flex items-start text-sm">
                <span className="mr-2">{tip.icon}</span>
                <div>
                  <p className="font-medium text-blue-800">{tip.title}</p>
                  <p className="text-blue-600">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Stats with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(budget)}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
          <div className="flex items-center justify-between mb-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-primary-400" />
            <span className="text-xs text-primary-400">Spent</span>
          </div>
          <p className="text-sm text-primary-600 mb-1">Spent So Far</p>
          <p className="text-2xl font-bold text-primary-600">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-primary-400 mt-1">
            {spentPercentage.toFixed(1)}% of budget
          </p>
        </div>
        
        <div className={`bg-gradient-to-br rounded-lg p-4 border ${
          isOverBudget 
            ? 'bg-red-50 border-red-200' 
            : remaining < budget * 0.2 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            {isOverBudget ? (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-400" />
            ) : (
              <CurrencyDollarIcon className={`h-5 w-5 ${
                remaining < budget * 0.2 ? 'text-yellow-400' : 'text-green-400'
              }`} />
            )}
            <span className="text-xs text-gray-400">Left</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Remaining</p>
          <p className={`text-2xl font-bold ${
            isOverBudget ? 'text-red-600' : 
            remaining < budget * 0.2 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {formatCurrency(Math.abs(remaining))}
            {isOverBudget && ' over'}
          </p>
        </div>
      </div>

      {/* Progress Bar with Segments */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full ${getProgressColor()} mr-2`}></span>
            Budget Used
          </span>
          <span className="font-medium">{spentPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          />
        </div>
        
        {/* Category Segments (if categories provided) */}
        {categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.slice(0, 5).map((cat, index) => (
              <div key={index} className="flex items-center text-xs">
                <span className={`inline-block w-2 h-2 rounded-full bg-${cat.color}-500 mr-1`}></span>
                <span className="text-gray-600">{cat.label}: {cat.percentage}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Breakdown (if trip dates available) */}
      {daysRemaining > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 mb-1">Daily Average</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(dailyAverage)}
            </p>
            <p className="text-xs text-gray-400">per day so far</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Daily Budget Left</p>
            <p className="text-lg font-semibold text-primary-600">
              {formatCurrency(dailyBudget)}
            </p>
            <p className="text-xs text-gray-400">for {daysRemaining} days</p>
          </div>
        </div>
      )}

      {/* Warning Messages */}
      {isOverBudget && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start animate-pulse">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Budget Exceeded!</p>
            <p className="text-sm text-red-700 mt-1">
              You've exceeded your budget by {formatCurrency(Math.abs(remaining))}. 
              Consider adjusting your expenses or increasing your budget.
            </p>
            <button
              onClick={onAdjustBudget}
              className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium underline"
            >
              Adjust Budget
            </button>
          </div>
        </div>
      )}

      {!isOverBudget && remaining < budget * 0.2 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Low Budget Warning</p>
            <p className="text-sm text-yellow-700 mt-1">
              You have less than 20% of your budget remaining ({formatCurrency(remaining)}). 
              Keep an eye on your spending.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;