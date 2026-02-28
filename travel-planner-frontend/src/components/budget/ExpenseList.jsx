import React, { useState, useMemo } from 'react';
import { 
  PencilIcon, 
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  TagIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { formatDate, groupBy } from '../../utils/helpers';
import { BUDGET_CATEGORIES } from '../../utils/constants';

const ExpenseList = ({ 
  expenses, 
  onEdit, 
  onDelete, 
  onTogglePaid, 
  onDuplicate,
  currency = 'USD' 
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [dateRange, setDateRange] = useState('all');

  // Format currency function
  const formatCurrency = (amount, expenseCurrency = null) => {
    if (!amount && amount !== 0) return `${currency} 0`;
    const displayCurrency = expenseCurrency || currency;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: displayCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Local paid status state
  const [localPaidStatus, setLocalPaidStatus] = useState({});

  const handleTogglePaidClick = (expenseId, currentPaid) => {
    setLocalPaidStatus(prev => ({
      ...prev,
      [expenseId]: !currentPaid
    }));
    onTogglePaid(expenseId, !currentPaid);
  };

  // Get expense with paid status
  const getExpenseWithPaidStatus = (expense) => ({
    ...expense,
    isPaid: localPaidStatus[expense.id] !== undefined ? localPaidStatus[expense.id] : expense.isPaid || false
  });

  // Filter and sort expenses
  const processedExpenses = useMemo(() => {
    let filtered = expenses.map(getExpenseWithPaidStatus);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.description.toLowerCase().includes(query) ||
        e.notes?.toLowerCase().includes(query) ||
        e.category?.toLowerCase().includes(query)
      );
    }

    // Apply paid/unpaid filter
    if (filter === 'paid') {
      filtered = filtered.filter(e => e.isPaid === true);
    } else if (filter === 'unpaid') {
      filtered = filtered.filter(e => e.isPaid === false);
    }

    // Apply date range filter
    const now = new Date();
    if (dateRange === 'today') {
      filtered = filtered.filter(e => {
        const date = new Date(e.expenseDate);
        return date.toDateString() === now.toDateString();
      });
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter(e => new Date(e.expenseDate) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filtered = filtered.filter(e => new Date(e.expenseDate) >= monthAgo);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.expenseDate) - new Date(a.expenseDate);
        case 'date-asc':
          return new Date(a.expenseDate) - new Date(b.expenseDate);
        case 'amount-desc':
          return (b.actualAmount || b.estimatedAmount || 0) - (a.actualAmount || a.estimatedAmount || 0);
        case 'amount-asc':
          return (a.actualAmount || a.estimatedAmount || 0) - (b.actualAmount || b.estimatedAmount || 0);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [expenses, searchQuery, filter, dateRange, sortBy, getExpenseWithPaidStatus]);

  // Group by category if enabled
  const groupedExpenses = useMemo(() => {
    if (!groupByCategory) return null;
    return groupBy(processedExpenses, 'category');
  }, [processedExpenses, groupByCategory]);

  const getCategoryIcon = (categoryValue) => {
    const category = BUDGET_CATEGORIES.find(c => c.value === categoryValue);
    return category?.icon || '📦';
  };

  const getCategoryColor = (categoryValue) => {
    const colors = {
      FLIGHT: 'bg-blue-100 text-blue-800 border-blue-200',
      ACCOMMODATION: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      FOOD: 'bg-orange-100 text-orange-800 border-orange-200',
      TRANSPORT: 'bg-green-100 text-green-800 border-green-200',
      ACTIVITIES: 'bg-purple-100 text-purple-800 border-purple-200',
      SHOPPING: 'bg-pink-100 text-pink-800 border-pink-200',
      OTHER: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[categoryValue] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryLabel = (categoryValue) => {
    const category = BUDGET_CATEGORIES.find(c => c.value === categoryValue);
    return category?.label || categoryValue;
  };

  const totalEstimated = processedExpenses.reduce(
    (sum, e) => sum + (e.estimatedAmount || 0), 0
  );
  const totalActual = processedExpenses.reduce(
    (sum, e) => sum + (e.actualAmount || 0), 0
  );

  const renderExpenseItem = (expense) => (
    <div
      key={expense.id}
      className={`border rounded-lg overflow-hidden transition-all ${
        expandedId === expense.id ? 'shadow-md border-primary-300' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Expense Header */}
      <div className="p-4 bg-white hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`w-10 h-10 rounded-xl ${getCategoryColor(expense.category)} flex items-center justify-center flex-shrink-0 border`}>
              <span className="text-xl">{getCategoryIcon(expense.category)}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {expense.description}
                </h3>
                {expense.isPaid ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleSolid className="h-3 w-3 mr-1" />
                    Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <XCircleIcon className="h-3 w-3 mr-1" />
                    Unpaid
                  </span>
                )}
                {expense.isActivity && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <ReceiptPercentIcon className="h-3 w-3 mr-1" />
                    Activity
                  </span>
                )}
                {expense.tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {formatDate(expense.expenseDate)}
                </div>
                {expense.merchant && (
                  <div className="text-xs text-gray-500">
                    {expense.merchant}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 mt-2">
                {expense.estimatedAmount > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-500">Est: </span>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(expense.estimatedAmount, expense.currency)}
                    </span>
                  </div>
                )}
                {expense.actualAmount > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-500">Actual: </span>
                    <span className="font-medium text-primary-600">
                      {formatCurrency(expense.actualAmount, expense.currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={() => handleTogglePaidClick(expense.id, expense.isPaid)}
              className={`p-2 rounded-lg transition-colors ${
                expense.isPaid
                  ? 'text-green-600 hover:bg-green-50'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title={expense.isPaid ? 'Mark as unpaid' : 'Mark as paid'}
            >
              <CheckCircleIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => onEdit(expense)}
              disabled={expense.isActivity}
              className={`p-2 rounded-lg transition-colors ${
                expense.isActivity
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
              }`}
              title={expense.isActivity ? 'Cannot edit activity costs' : 'Edit expense'}
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            
            {onDuplicate && !expense.isActivity && (
              <button
                onClick={() => onDuplicate(expense)}
                className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                title="Duplicate expense"
              >
                <DocumentDuplicateIcon className="h-5 w-5" />
              </button>
            )}
            
            <button
              onClick={() => onDelete(expense.id)}
              disabled={expense.isActivity}
              className={`p-2 rounded-lg transition-colors ${
                expense.isActivity
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }`}
              title={expense.isActivity ? 'Cannot delete activity costs' : 'Delete expense'}
            >
              <TrashIcon className="h-5 w-5" />
            </button>

            <button
              onClick={() => setExpandedId(expandedId === expense.id ? null : expense.id)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {expandedId === expense.id ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {expandedId === expense.id && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 animate-slide-down">
            {expense.notes && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{expense.notes}</p>
              </div>
            )}
            
            {expense.receipt && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Receipt</p>
                <img 
                  src={expense.receipt} 
                  alt="Receipt" 
                  className="max-h-32 rounded-lg border border-gray-200"
                />
              </div>
            )}
            
            {expense.bookingReference && (
              <div className="flex items-center text-xs text-gray-500">
                <span className="font-medium mr-2">Booking Ref:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">{expense.bookingReference}</code>
              </div>
            )}
            
            {expense.estimatedAmount > 0 && expense.actualAmount > 0 && (
              <div className="flex items-center text-sm">
                <span className="text-gray-500 mr-2">Variance:</span>
                <span className={expense.actualAmount > expense.estimatedAmount ? 'text-red-600' : 'text-green-600'}>
                  {expense.actualAmount > expense.estimatedAmount ? '+' : ''}
                  {formatCurrency(expense.actualAmount - expense.estimatedAmount, expense.currency)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header with Filters */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
          <span className="text-sm text-gray-500">
            {processedExpenses.length} {processedExpenses.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          >
            <option value="all">All expenses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amount-desc">Highest amount</option>
            <option value="amount-asc">Lowest amount</option>
            <option value="category">Category</option>
          </select>

          <button
            onClick={() => setGroupByCategory(!groupByCategory)}
            className={`px-3 py-2 border rounded-lg text-sm transition-all flex items-center ${
              groupByCategory
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Group by category
          </button>
        </div>

        {/* Summary */}
        {processedExpenses.length > 0 && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
            <div>
              <p className="text-xs text-primary-600 mb-1">Total Estimated</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalEstimated)}
              </p>
            </div>
            <div>
              <p className="text-xs text-primary-600 mb-1">Total Actual</p>
              <p className="text-xl font-bold text-primary-700">
                {formatCurrency(totalActual)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Expense List */}
      {processedExpenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ReceiptPercentIcon className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-gray-500">No expenses found</p>
          <p className="text-xs text-gray-400 mt-2">
            {searchQuery ? 'Try adjusting your search' : 'Add your first expense to get started'}
          </p>
        </div>
      ) : groupByCategory ? (
        // Grouped by category view
        <div className="space-y-6">
          {Object.entries(groupedExpenses).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <span className="text-xl mr-2">{getCategoryIcon(category)}</span>
                  {getCategoryLabel(category)}
                  <span className="ml-2 text-xs text-gray-500">
                    ({items.length})
                  </span>
                </h3>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(items.reduce((sum, e) => sum + (e.actualAmount || e.estimatedAmount || 0), 0))}
                </span>
              </div>
              <div className="space-y-2">
                {items.map(renderExpenseItem)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat list view
        <div className="space-y-3">
          {processedExpenses.map(renderExpenseItem)}
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ExpenseList;