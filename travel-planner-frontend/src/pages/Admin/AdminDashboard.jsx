import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  MapIcon,
  CurrencyDollarIcon,
  TicketIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  BellIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Mock data - Replace with actual API calls
const mockStats = {
  totalUsers: 15234,
  activeUsers: 8765,
  newUsersToday: 234,
  totalTrips: 45678,
  tripsThisMonth: 3456,
  completedTrips: 23456,
  totalBookings: 34567,
  bookingsThisMonth: 2345,
  revenue: 4567890,
  revenueThisMonth: 456789,
  averageRating: 4.8,
};

const mockRecentUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'USER', status: 'active', joinedAt: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN', status: 'active', joinedAt: '2024-01-14' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'USER', status: 'active', joinedAt: '2024-01-13' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'USER', status: 'inactive', joinedAt: '2024-01-12' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'USER', status: 'active', joinedAt: '2024-01-11' },
];

const mockRecentActivities = [
  { id: 1, user: 'John Doe', action: 'Created a new trip', target: 'Summer in Paris', time: '2 minutes ago', type: 'create' },
  { id: 2, user: 'Jane Smith', action: 'Updated user permissions', target: 'alice@example.com', time: '15 minutes ago', type: 'update' },
  { id: 3, user: 'Bob Johnson', action: 'Deleted a trip', target: 'Bali Adventure', time: '1 hour ago', type: 'delete' },
  { id: 4, user: 'System', action: 'Backup completed', target: 'Database backup', time: '2 hours ago', type: 'system' },
  { id: 5, user: 'Alice Brown', action: 'Logged in', target: 'New device', time: '3 hours ago', type: 'auth' },
];

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for charts
  const chartData = useMemo(() => {
    const labels = timeRange === 'week' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : timeRange === 'month'
      ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const userData = timeRange === 'week'
      ? [65, 78, 82, 94, 88, 102, 115]
      : timeRange === 'month'
      ? [420, 450, 480, 520]
      : [5200, 5400, 5800, 6100, 6500, 6800, 7200, 7500, 7800, 8200, 8600, 9000];

    const bookingData = timeRange === 'week'
      ? [45, 52, 48, 63, 58, 71, 82]
      : timeRange === 'month'
      ? [280, 310, 340, 380]
      : [3800, 4000, 4200, 4500, 4800, 5100, 5400, 5700, 6000, 6300, 6600, 7000];

    return { labels, userData, bookingData };
  }, [timeRange]);

  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'New Users',
        data: chartData.userData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Bookings',
        data: chartData.bookingData,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const userRoleData = {
    labels: ['Users', 'Admins', 'Moderators'],
    datasets: [
      {
        data: [14500, 234, 500],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Dashboard data refreshed');
    }, 1500);
  };

  const stats = [
    {
      title: 'Total Users',
      value: mockStats.totalUsers.toLocaleString(),
      change: '+12.5%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Active Users',
      value: mockStats.activeUsers.toLocaleString(),
      change: '+5.2%',
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Trips',
      value: mockStats.totalTrips.toLocaleString(),
      change: '+8.3%',
      changeType: 'increase',
      icon: MapIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Bookings',
      value: mockStats.totalBookings.toLocaleString(),
      change: '+15.7%',
      changeType: 'increase',
      icon: TicketIcon,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
    {
      title: 'Revenue',
      value: `$${(mockStats.revenue / 1000000).toFixed(1)}M`,
      change: '+23.1%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Avg Rating',
      value: mockStats.averageRating,
      change: '+0.2',
      changeType: 'increase',
      icon: ChartBarIcon,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-primary-600 mr-3" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and manage your travel platform
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">Last 12 months</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowPathIcon className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-primary-600 mr-2" />
                User Growth & Bookings
              </h2>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="text-xs text-gray-500">Users</span>
                <span className="w-3 h-3 bg-green-500 rounded-full ml-2"></span>
                <span className="text-xs text-gray-500">Bookings</span>
              </div>
            </div>
            <div className="h-64">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>

          {/* User Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ChartBarIcon className="h-5 w-5 text-primary-600 mr-2" />
                User Role Distribution
              </h2>
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="w-64">
                <Doughnut data={userRoleData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Users */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <UsersIcon className="h-5 w-5 text-primary-600 mr-2" />
                Recent Users
              </h2>
              <Link
                to="/admin/users"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
              >
                View All
                <ArrowTrendingUpIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {mockRecentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                        : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                    }`}>
                      {user.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <BellIcon className="h-5 w-5 text-primary-600 mr-2" />
                Recent Activity
              </h2>
              <Link
                to="/admin/logs"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
              >
                View Logs
                <ArrowTrendingUpIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {mockRecentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className={`mt-1 ${
                    activity.type === 'create' ? 'text-green-500' :
                    activity.type === 'update' ? 'text-blue-500' :
                    activity.type === 'delete' ? 'text-red-500' :
                    activity.type === 'system' ? 'text-purple-500' :
                    'text-gray-500'
                  }`}>
                    {activity.type === 'create' && <CheckCircleIcon className="h-5 w-5" />}
                    {activity.type === 'update' && <ArrowPathIcon className="h-5 w-5" />}
                    {activity.type === 'delete' && <XCircleIcon className="h-5 w-5" />}
                    {activity.type === 'system' && <Cog6ToothIcon className="h-5 w-5" />}
                    {activity.type === 'auth' && <ShieldCheckIcon className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.target} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CloudArrowUpIcon className="h-5 w-5 text-primary-600 mr-2" />
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Server</span>
              </div>
              <span className="text-xs text-green-600 dark:text-green-400">Operational</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database</span>
              </div>
              <span className="text-xs text-green-600 dark:text-green-400">Operational</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Service</span>
              </div>
              <span className="text-xs text-yellow-600 dark:text-yellow-400">Degraded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;