import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import budgetsAPI from "../api/budgets";
import tripsAPI from "../api/trips";
import { destinationsAPI } from "../api/destinations";
import BudgetOverview from "../components/budget/BudgetOverview";
import CategoryBreakdown from "../components/budget/CategoryBreakdown";
import ExpenseList from "../components/budget/ExpenseList";
import ExpenseForm from "../components/budget/ExpenseForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  ArrowLeftIcon,
  PlusIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  WalletIcon,
  ArrowTrendingUpIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  CalendarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const BudgetPage = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showFilters, setShowFilters] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Format currency helper
  const formatCurrency = (amount, currency = "USD") => {
    if (!amount && amount !== 0) return `${currency} 0`;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch trip details
  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
    refetch: refetchTrip,
  } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      try {
        const response = await tripsAPI.getTrip(tripId);
        if (response?.data) return response.data;
        if (response) return response;
        return null;
      } catch (error) {
        console.error("Failed to fetch trip:", error);
        throw error;
      }
    },
    enabled: !!tripId,
  });

  // Fetch destinations with activities
  const { data: destinations, isLoading: destinationsLoading } = useQuery({
    queryKey: ["destinations", tripId],
    queryFn: async () => {
      try {
        const response = await destinationsAPI.getDestinations(tripId);
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
        return [];
      }
    },
    enabled: !!tripId,
  });

  // Fetch budget
  const {
    data: budget,
    isLoading: budgetLoading,
    refetch: refetchBudget,
  } = useQuery({
    queryKey: ["budget", tripId],
    queryFn: async () => {
      try {
        const response = await budgetsAPI.getBudget(tripId);
        return response.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!tripId,
  });

  // Fetch expenses
  const {
    data: expenses,
    isLoading: expensesLoading,
    refetch: refetchExpenses,
  } = useQuery({
    queryKey: ["expenses", tripId],
    queryFn: async () => {
      try {
        const response = await budgetsAPI.getExpenses(tripId);
        return response.data || [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!tripId,
  });

  // Calculate total expenses including activity costs
  const totalExpenses = useMemo(() => {
    const expenseTotal =
      expenses?.reduce(
        (sum, e) => sum + (e.actualAmount || e.estimatedAmount || 0),
        0,
      ) || 0;

    let activityTotal = 0;
    destinations?.forEach((destination) => {
      destination.activities?.forEach((activity) => {
        if (activity.cost) activityTotal += activity.cost;
      });
    });

    return expenseTotal + activityTotal;
  }, [expenses, destinations]);

  // Calculate daily average
  const dailyAverage = useMemo(() => {
    if (!trip?.startDate || !trip?.endDate) return 0;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return totalExpenses / days;
  }, [trip, totalExpenses]);

  const remainingBudget = budget ? budget.totalBudget - totalExpenses : 0;
  const budgetPercentage = budget
    ? (totalExpenses / budget.totalBudget) * 100
    : 0;

  // Create combined expenses array
  const combinedExpenses = useMemo(() => {
    const expenseItems = expenses || [];
    const activityItems = [];

    destinations?.forEach((destination) => {
      destination.activities?.forEach((activity) => {
        if (activity.cost && activity.cost > 0) {
          activityItems.push({
            id: `activity_${activity.id}`,
            category: "ACTIVITIES",
            description: `Activity: ${activity.name}`,
            estimatedAmount: activity.cost,
            actualAmount: activity.cost,
            currency: activity.currency || selectedCurrency,
            expenseDate:
              activity.date || new Date().toISOString().split("T")[0],
            notes: activity.notes || "",
            isPaid: true,
            isActivity: true,
            merchant: activity.location || "",
            tags: [activity.type],
          });
        }
      });
    });

    return [...expenseItems, ...activityItems].sort(
      (a, b) => new Date(b.expenseDate) - new Date(a.expenseDate),
    );
  }, [expenses, destinations, selectedCurrency]);

  // Filter expenses by date range
  const filteredExpenses = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return combinedExpenses;

    return combinedExpenses.filter((expense) => {
      const expenseDate = new Date(expense.expenseDate);
      if (dateRange.start && expenseDate < dateRange.start) return false;
      if (dateRange.end && expenseDate > dateRange.end) return false;
      return true;
    });
  }, [combinedExpenses, dateRange]);

  // Mutations
  const createBudgetMutation = useMutation({
    mutationFn: (budgetData) => budgetsAPI.createBudget(tripId, budgetData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget", tripId] });
      toast.success(
        <div className="flex items-center">
          <CheckCircleSolid className="h-5 w-5 text-green-500 mr-2" />
          Budget created successfully
        </div>,
      );
      refetchBudget();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create budget");
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: (budgetData) => budgetsAPI.updateBudget(tripId, budgetData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget", tripId] });
      toast.success("Budget updated successfully");
      refetchBudget();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update budget");
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: (expenseData) => budgetsAPI.addExpense(tripId, expenseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      queryClient.invalidateQueries({ queryKey: ["budget", tripId] });
      toast.success(
        <div className="flex items-center">
          <CheckCircleSolid className="h-5 w-5 text-green-500 mr-2" />
          Expense added successfully
        </div>,
      );
      setShowExpenseForm(false);
      setEditingExpense(null);
      refetchExpenses();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add expense");
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ expenseId, expenseData }) =>
      budgetsAPI.updateExpense(expenseId, expenseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      queryClient.invalidateQueries({ queryKey: ["budget", tripId] });
      toast.success("Expense updated successfully");
      setShowExpenseForm(false);
      setEditingExpense(null);
      refetchExpenses();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update expense");
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId) => budgetsAPI.deleteExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      queryClient.invalidateQueries({ queryKey: ["budget", tripId] });
      toast.success("Expense deleted successfully");
      refetchExpenses();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete expense");
    },
  });

  const handleSaveBudget = () => {
    const budgetAmount = prompt(
      "Enter your total budget:",
      budget?.totalBudget || "",
    );
    if (budgetAmount) {
      const amount = parseFloat(budgetAmount);
      if (!isNaN(amount) && amount > 0) {
        if (budget) {
          updateBudgetMutation.mutate({
            totalBudget: amount,
            currency: selectedCurrency,
          });
        } else {
          createBudgetMutation.mutate({
            totalBudget: amount,
            currency: selectedCurrency,
          });
        }
      }
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expense) => {
    if (expense.isActivity) {
      toast.error(
        "Activity costs cannot be edited directly. Edit the activity in the itinerary.",
      );
      return;
    }
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = (expenseId) => {
    if (expenseId.toString().startsWith("activity_")) {
      toast.error(
        "Activity costs cannot be deleted directly. Delete the activity in the itinerary.",
      );
      return;
    }
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(expenseId);
    }
  };

  const handleTogglePaid = (expenseId, isPaid) => {
    toast.success(
      `Expense marked as ${isPaid ? "paid" : "unpaid"} (local only)`,
    );
  };

  const handleSaveExpense = (expenseData) => {
    if (editingExpense) {
      updateExpenseMutation.mutate({
        expenseId: editingExpense.id,
        expenseData: { ...expenseData, currency: selectedCurrency },
      });
    } else {
      addExpenseMutation.mutate({ ...expenseData, currency: selectedCurrency });
    }
  };

  const handleRefresh = () => {
    refetchBudget();
    refetchExpenses();
    refetchTrip();
    queryClient.invalidateQueries({ queryKey: ["destinations", tripId] });
    toast.success(
      <div className="flex items-center">
        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
        Data refreshed
      </div>,
    );
  };

  const handleExport = (format) => {
    // Implement export logic here
    toast.success(`Exporting as ${format}...`);
  };

  if (tripLoading || budgetLoading || expensesLoading || destinationsLoading) {
    return <LoadingSpinner fullScreen text="Loading budget data..." />;
  }

  if (tripError || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Trip not found
          </h2>
          <p className="text-gray-600 mb-6">
            The trip you're looking for doesn't exist or you don't have access.
          </p>
          <button
            onClick={() => navigate("/trips")}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg"
          >
            Back to My Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-all group bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to {trip?.title}</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl shadow-lg mr-4">
                  <WalletIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Budget Planner
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center">
                    <span className="font-medium text-gray-900">
                      {trip?.title}
                    </span>
                    <span className="mx-2">•</span>
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(trip?.startDate).toLocaleDateString()} -{" "}
                    {new Date(trip?.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Currency Selector */}
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:border-gray-400"
                >
                  <option value="USD">🇺🇸 USD ($)</option>
                  <option value="EUR">🇪🇺 EUR (€)</option>
                  <option value="GBP">🇬🇧 GBP (£)</option>
                  <option value="INR">🇮🇳 INR (₹)</option>
                  <option value="JPY">🇯🇵 JPY (¥)</option>
                  <option value="CAD">🇨🇦 CAD (C$)</option>
                  <option value="AUD">🇦🇺 AUD (A$)</option>
                </select>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  className="p-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors group"
                  title="Refresh data"
                >
                  <ArrowPathIcon className="h-5 w-5 text-gray-600 group-hover:rotate-180 transition-transform duration-500" />
                </button>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2.5 rounded-xl transition-all ${
                    showFilters
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Toggle filters"
                >
                  <FunnelIcon className="h-5 w-5" />
                </button>

                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setExportMenuOpen(!exportMenuOpen)}
                    className="p-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    title="Export"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5 text-gray-600" />
                  </button>

                  {exportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 animate-slide-down">
                      <button
                        onClick={() => handleExport("PDF")}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        📄 Export as PDF
                      </button>
                      <button
                        onClick={() => handleExport("CSV")}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        📊 Export as CSV
                      </button>
                      <button
                        onClick={() => handleExport("Excel")}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        📈 Export as Excel
                      </button>
                    </div>
                  )}
                </div>

                {/* Budget Button */}
                <button
                  onClick={handleSaveBudget}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md flex items-center font-medium"
                >
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  {budget ? "Edit Budget" : "Set Budget"}
                </button>

                {/* Add Expense Button */}
                <button
                  onClick={handleAddExpense}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-md flex items-center font-medium"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Expense
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 animate-slide-down">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={
                        dateRange.start
                          ? dateRange.start.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          start: e.target.value
                            ? new Date(e.target.value)
                            : null,
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={
                        dateRange.end
                          ? dateRange.end.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          end: e.target.value ? new Date(e.target.value) : null,
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                {(dateRange.start || dateRange.end) && (
                  <button
                    onClick={() => setDateRange({ start: null, end: null })}
                    className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Budget Stats Cards */}
        {budget && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary-500 hover:shadow-xl transition-shadow">
              <p className="text-sm text-gray-500 mb-1">Total Budget</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(budget.totalBudget, selectedCurrency)}
              </p>
              <p className="text-xs text-gray-400 mt-2 flex items-center">
                <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                Planning budget
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
              <p className="text-sm text-gray-500 mb-1">Spent So Far</p>
              <p className="text-3xl font-bold text-yellow-600">
                {formatCurrency(totalExpenses, selectedCurrency)}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">
                  {budgetPercentage.toFixed(1)}% used
                </p>
                <p className="text-xs text-gray-400">
                  💰 Daily avg: {formatCurrency(dailyAverage, selectedCurrency)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
              <p className="text-sm text-gray-500 mb-1">Remaining</p>
              <p
                className={`text-3xl font-bold ${remainingBudget < 0 ? "text-red-600" : "text-green-600"}`}
              >
                {formatCurrency(Math.abs(remainingBudget), selectedCurrency)}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {remainingBudget < 0
                  ? "⚠️ Over budget!"
                  : "✅ Available to spend"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
              <p className="text-sm text-white/80 mb-1">Total Items</p>
              <p className="text-3xl font-bold">{filteredExpenses.length}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-white/80">
                  📝 {expenses?.length || 0} expenses
                </p>
                <p className="text-xs text-white/80">
                  🎯 {combinedExpenses.filter((e) => e.isActivity).length}{" "}
                  activities
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        {budget && (
          <div className="bg-white rounded-t-xl shadow-lg border-b border-gray-200 px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all ${
                  activeTab === "overview"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <ChartPieIcon className="h-5 w-5 mr-2" />
                Overview
                {activeTab === "overview" && (
                  <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("expenses")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all ${
                  activeTab === "expenses"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                All Expenses
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {filteredExpenses.length}
                </span>
              </button>
            </nav>
          </div>
        )}

        {/* Main Content */}
        {!budget ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-200 mt-6">
            <div className="w-28 h-28 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CurrencyDollarIcon className="h-14 w-14 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              No Budget Set
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Set a budget for your trip to start tracking expenses and manage
              your spending effectively.
            </p>
            <button
              onClick={handleSaveBudget}
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg inline-flex items-center text-lg font-medium"
            >
              <PlusIcon className="h-6 w-6 mr-2" />
              Set Your Budget
            </button>
          </div>
        ) : (
          <div className="mt-6">
            {activeTab === "overview" ? (
              <div className="space-y-6">
                <BudgetOverview
                  budget={budget.totalBudget}
                  totalExpenses={totalExpenses}
                  categories={combinedExpenses || []}
                  currency={selectedCurrency}
                  dailyAverage={dailyAverage}
                  startDate={trip?.startDate}
                  endDate={trip?.endDate}
                  onAdjustBudget={handleSaveBudget}
                />

                {filteredExpenses.length > 0 && (
                  <CategoryBreakdown
                    expenses={filteredExpenses}
                    total={totalExpenses}
                    currency={selectedCurrency}
                  />
                )}

                {filteredExpenses.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <span className="bg-primary-100 p-2 rounded-lg mr-3">
                          <ArrowTrendingUpIcon className="h-5 w-5 text-primary-600" />
                        </span>
                        Recent Transactions
                      </h3>
                      <button
                        onClick={() => setActiveTab("expenses")}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center group"
                      >
                        View All
                        <span className="ml-1 group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {filteredExpenses.slice(0, 5).map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-100"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                                expense.isActivity
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-primary-100 text-primary-600"
                              }`}
                            >
                              <span className="text-lg">
                                {expense.isActivity ? "🎯" : "💰"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {expense.description}
                              </p>
                              <div className="flex items-center mt-1">
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full mr-2">
                                  {expense.category}
                                </span>
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    expense.expenseDate,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(
                                expense.actualAmount || expense.estimatedAmount,
                                expense.currency || selectedCurrency,
                              )}
                            </p>
                            {expense.isPaid ? (
                              <p className="text-xs text-green-600 flex items-center justify-end">
                                <CheckCircleSolid className="h-3 w-3 mr-1" />
                                Paid
                              </p>
                            ) : (
                              <p className="text-xs text-yellow-600 flex items-center justify-end">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                                Pending
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredExpenses.length === 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-16 text-center border border-gray-200">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ArrowTrendingUpIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      No Expenses Yet
                    </h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                      Add expenses or activities with costs to track your
                      spending.
                    </p>
                    <button
                      onClick={handleAddExpense}
                      className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg inline-flex items-center text-lg font-medium"
                    >
                      <PlusIcon className="h-6 w-6 mr-2" />
                      Add Your First Expense
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <ExpenseList
                  expenses={filteredExpenses}
                  onEdit={handleEditExpense}
                  onDelete={handleDeleteExpense}
                  onTogglePaid={handleTogglePaid}
                  onDuplicate={(expense) => {
                    const { id, ...expenseData } = expense;
                    handleAddExpense();
                    // You can pre-fill the form with duplicated data
                  }}
                  currency={selectedCurrency}
                />
              </div>
            )}
          </div>
        )}

        {/* Expense Form Modal */}
        <ExpenseForm
          isOpen={showExpenseForm}
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
          onSave={handleSaveExpense}
          initialData={editingExpense}
          tripId={tripId}
          selectedCurrency={selectedCurrency}
          maxDate={new Date(trip?.endDate) || new Date()}
          minDate={new Date(trip?.startDate)}
        />
      </div>
    </div>
  );
};

export default BudgetPage;
