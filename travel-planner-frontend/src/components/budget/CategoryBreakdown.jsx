import React, { useState } from 'react';
import { 
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import { BUDGET_CATEGORIES } from '../../utils/constants';

const CategoryBreakdown = ({ expenses, total, currency = 'USD' }) => {
  const [showAll, setShowAll] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Group expenses by category with enhanced data
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = {
        amount: 0,
        count: 0,
        estimated: 0,
        actual: 0,
        items: []
      };
    }
    acc[category].amount += expense.actualAmount || expense.estimatedAmount || 0;
    acc[category].estimated += expense.estimatedAmount || 0;
    acc[category].actual += expense.actualAmount || 0;
    acc[category].count += 1;
    acc[category].items.push(expense);
    return acc;
  }, {});

  // Sort categories by amount
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b.amount - a.amount);

  const displayedCategories = showAll ? sortedCategories : sortedCategories.slice(0, 5);
  const hiddenCount = sortedCategories.length - 5;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (categoryValue) => {
    const category = BUDGET_CATEGORIES.find(c => c.value === categoryValue);
    return category?.icon || '📦';
  };

  const getCategoryLabel = (categoryValue) => {
    const category = BUDGET_CATEGORIES.find(c => c.value === categoryValue);
    return category?.label || categoryValue;
  };

  const getCategoryColor = (categoryValue, withOpacity = false) => {
    const colors = {
      FLIGHT: withOpacity ? 'rgba(59, 130, 246, 0.8)' : '#3B82F6',
      ACCOMMODATION: withOpacity ? 'rgba(99, 102, 241, 0.8)' : '#6366F1',
      FOOD: withOpacity ? 'rgba(249, 115, 22, 0.8)' : '#F97316',
      TRANSPORT: withOpacity ? 'rgba(34, 197, 94, 0.8)' : '#22C55E',
      ACTIVITIES: withOpacity ? 'rgba(168, 85, 247, 0.8)' : '#A855F7',
      SHOPPING: withOpacity ? 'rgba(236, 72, 153, 0.8)' : '#EC4899',
      OTHER: withOpacity ? 'rgba(107, 114, 128, 0.8)' : '#6B7280',
    };
    return colors[categoryValue] || (withOpacity ? 'rgba(107, 114, 128, 0.8)' : '#6B7280');
  };

  // Generate pie chart segments
  const generatePieSegments = () => {
    let cumulativePercentage = 0;
    return sortedCategories.map(([category, data]) => {
      const percentage = total > 0 ? (data.amount / total) * 100 : 0;
      const startAngle = cumulativePercentage * 3.6; // Convert to degrees (100% = 360°)
      cumulativePercentage += percentage;
      const endAngle = cumulativePercentage * 3.6;
      
      return {
        category,
        data,
        percentage,
        startAngle,
        endAngle,
        color: getCategoryColor(category, true)
      };
    });
  };

  const pieSegments = generatePieSegments();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <ChartPieIcon className="h-5 w-5 text-primary-600 mr-2" />
          Spending by Category
        </h2>
        {sortedCategories.length > 0 && (
          <span className="text-sm text-gray-500">
            {sortedCategories.length} categories
          </span>
        )}
      </div>
      
      {sortedCategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChartPieIcon className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-gray-500">No expenses yet</p>
          <p className="text-xs text-gray-400 mt-2">
            Add expenses to see category breakdown
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Visual Pie Chart Representation */}
          <div className="relative w-48 h-48 mx-auto mb-4">
            {/* Pie Chart */}
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {pieSegments.map((segment, index) => {
                const start = segment.startAngle;
                const end = segment.endAngle;
                
                // Calculate SVG arc path
                const startRad = (start * Math.PI) / 180;
                const endRad = (end * Math.PI) / 180;
                
                const x1 = 50 + 40 * Math.cos(startRad);
                const y1 = 50 + 40 * Math.sin(startRad);
                const x2 = 50 + 40 * Math.cos(endRad);
                const y2 = 50 + 40 * Math.sin(endRad);
                
                const largeArc = end - start > 180 ? 1 : 0;
                
                const pathData = [
                  `M 50 50`,
                  `L ${x1} ${y1}`,
                  `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ');
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="1"
                    onMouseEnter={() => setHoveredCategory(segment.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className="transition-opacity cursor-pointer hover:opacity-90"
                  />
                );
              })}
              <circle cx="50" cy="50" r="20" fill="white" stroke="white" strokeWidth="2" />
            </svg>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {total > 0 ? Math.round((total / total) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500">of budget</p>
              </div>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-4">
            {displayedCategories.map(([category, data]) => {
              const percentage = total > 0 ? (data.amount / total) * 100 : 0;
              const isHovered = hoveredCategory === category;
              
              return (
                <div 
                  key={category}
                  className={`transition-all duration-200 ${isHovered ? 'scale-105' : ''}`}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center flex-1">
                      <span className="text-xl mr-2">{getCategoryIcon(category)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {getCategoryLabel(category)}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{data.count} expense{data.count !== 1 ? 's' : ''}</span>
                          {data.estimated !== data.actual && (
                            <>
                              <span className="mx-2">•</span>
                              <span className={data.actual > data.estimated ? 'text-red-500' : 'text-green-500'}>
                                {data.actual > data.estimated ? '+' : '-'}
                                {formatCurrency(Math.abs(data.actual - data.estimated))}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(data.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar with Actual vs Estimated */}
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute h-full rounded-full transition-all duration-300`}
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: getCategoryColor(category)
                      }}
                    />
                    {data.estimated > 0 && (
                      <div 
                        className="absolute h-full w-0.5 bg-gray-900 opacity-50"
                        style={{ 
                          left: `${(data.estimated / total) * 100}%`,
                          transform: 'translateX(-50%)'
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Mini Sparkline (if multiple items) */}
                  {data.items.length > 1 && (
                    <div className="mt-1 flex items-center space-x-0.5">
                      {data.items.slice(0, 5).map((item, idx) => (
                        <div
                          key={idx}
                          className="h-1 w-4 bg-gray-300 rounded-full"
                          style={{
                            backgroundColor: item.actualAmount > item.estimatedAmount 
                              ? '#EF4444' 
                              : item.actualAmount < item.estimatedAmount 
                                ? '#10B981' 
                                : '#9CA3AF'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Show More Button */}
            {sortedCategories.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-2 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showAll ? (
                  <>
                    <ChevronUpIcon className="h-4 w-4 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="h-4 w-4 mr-1" />
                    Show {hiddenCount} more categories
                  </>
                )}
              </button>
            )}
          </div>

          {/* Summary with Comparison */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Total Spent</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(total)}
              </span>
            </div>
            
            {/* Comparison with budget if available */}
            {expenses.some(e => e.estimatedAmount > 0) && (
              <div className="mt-2 flex items-center justify-end text-xs">
                <ArrowTrendingUpIcon className="h-3 w-3 text-gray-400 mr-1" />
                <span className="text-gray-500">
                  vs. estimated: 
                  <span className={total > expenses.reduce((s, e) => s + (e.estimatedAmount || 0), 0) 
                    ? 'text-red-500 ml-1' 
                    : 'text-green-500 ml-1'
                  }>
                    {formatCurrency(total - expenses.reduce((s, e) => s + (e.estimatedAmount || 0), 0))}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryBreakdown;