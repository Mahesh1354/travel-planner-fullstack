import React, { useState } from 'react';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  GlobeAltIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Mock audit logs - Replace with actual API calls
const mockLogs = [
  { id: 1, user: 'John Doe', action: 'USER_LOGIN', details: 'Logged in from 192.168.1.1', ip: '192.168.1.1', timestamp: '2024-01-20T10:30:00Z', status: 'success', resource: 'Auth' },
  { id: 2, user: 'Jane Smith', action: 'TRIP_CREATE', details: 'Created trip "Summer in Paris"', ip: '192.168.1.2', timestamp: '2024-01-20T09:45:00Z', status: 'success', resource: 'Trip' },
  { id: 3, user: 'Bob Johnson', action: 'USER_UPDATE', details: 'Updated profile information', ip: '192.168.1.3', timestamp: '2024-01-20T08:20:00Z', status: 'success', resource: 'User' },
  { id: 4, user: 'Alice Brown', action: 'BOOKING_CREATE', details: 'Booked flight to Tokyo', ip: '192.168.1.4', timestamp: '2024-01-19T23:15:00Z', status: 'success', resource: 'Booking' },
  { id: 5, user: 'Charlie Wilson', action: 'TRIP_DELETE', details: 'Deleted trip "Bali Adventure"', ip: '192.168.1.5', timestamp: '2024-01-19T22:30:00Z', status: 'warning', resource: 'Trip' },
  { id: 6, user: 'Diana Prince', action: 'USER_LOGIN_FAILED', details: 'Failed login attempt from 192.168.1.6', ip: '192.168.1.6', timestamp: '2024-01-19T21:45:00Z', status: 'error', resource: 'Auth' },
  { id: 7, user: 'Bruce Wayne', action: 'PERMISSION_UPDATE', details: 'Updated user permissions', ip: '192.168.1.7', timestamp: '2024-01-19T20:10:00Z', status: 'success', resource: 'Admin' },
  { id: 8, user: 'Clark Kent', action: 'SYSTEM_BACKUP', details: 'Database backup completed', ip: 'system', timestamp: '2024-01-19T19:00:00Z', status: 'success', resource: 'System' },
];

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter logs
  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.ip.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesResource = resourceFilter === 'all' || log.resource === resourceFilter;
    
    // Date filtering
    let matchesDate = true;
    if (dateRange !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      switch (dateRange) {
        case 'today':
          matchesDate = logDate >= today;
          break;
        case 'yesterday':
          matchesDate = logDate >= yesterday && logDate < today;
          break;
        case 'week':
          matchesDate = logDate >= weekAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesResource && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleSolid className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getActionColor = (action) => {
    if (action.includes('CREATE')) return 'text-green-600';
    if (action.includes('UPDATE')) return 'text-blue-600';
    if (action.includes('DELETE')) return 'text-red-600';
    if (action.includes('LOGIN')) return 'text-purple-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-primary-600 mr-3" />
            Audit Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and monitor system activities
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Resource Filter */}
            <div className="relative">
              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Resources</option>
                <option value="Auth">Authentication</option>
                <option value="User">Users</option>
                <option value="Trip">Trips</option>
                <option value="Booking">Bookings</option>
                <option value="Admin">Admin</option>
                <option value="System">System</option>
              </select>
              <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Date Range */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
              </select>
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Showing {paginatedLogs.length} of {filteredLogs.length} logs
          </p>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{log.details}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-full">
                        {log.resource}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {log.ip}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(log.status)}
                        <span className={`ml-2 text-sm capitalize ${
                          log.status === 'success' ? 'text-green-600' :
                          log.status === 'warning' ? 'text-yellow-600' :
                          log.status === 'error' ? 'text-red-600' :
                          'text-blue-600'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => toast.success('Logs exported successfully')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Export Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;