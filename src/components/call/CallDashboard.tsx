import React, { useState } from 'react';
import { 
  Phone, 
  Users, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown, 
  Filter, 
  Search, 
  Download, 
  AlertCircle, 
  Mic, 
  Eye 
} from 'lucide-react';

interface CallDashboardProps {
  selectedProject?: string;
  onStartNewCall?: () => void;
  onStartBulkCalls?: () => void;
}

// Mock data
const mockCallAnalytics = {
  totalCalls: 156,
  completedCalls: 134,
  successRate: 78.2,
  avgDuration: 142,
  interestedLeads: 45,
  totalConnected: 134,
  notAnswered: 22,
  todayCalls: 24
};

const mockRecentCalls = [
  {
    id: '1',
    leadName: 'रमेश शर्मा',
    phoneNumber: '+91 9876543210',
    status: 'completed',
    duration: 180,
    timestamp: '2025-12-08T10:30:00Z',
    interested: true,
    language: 'Hindi',
    notes: 'बहुत interested है, follow-up करना है'
  },
  {
    id: '2',
    leadName: 'Priya Singh',
    phoneNumber: '+91 8765432109',
    status: 'completed',
    duration: 95,
    timestamp: '2025-12-08T10:15:00Z',
    interested: false,
    language: 'Hinglish',
    notes: 'Not interested right now'
  },
  {
    id: '3',
    leadName: 'अजय कुमार',
    phoneNumber: '+91 7654321098',
    status: 'in-progress',
    duration: 45,
    timestamp: '2025-12-08T10:45:00Z',
    interested: null,
    language: 'Hindi',
    notes: ''
  },
  {
    id: '4',
    leadName: 'Neha Gupta',
    phoneNumber: '+91 6543210987',
    status: 'failed',
    duration: 0,
    timestamp: '2025-12-08T09:30:00Z',
    interested: false,
    language: 'Hinglish',
    notes: 'Call drop हो गई'
  },
  {
    id: '5',
    leadName: 'विकास पटेल',
    phoneNumber: '+91 5432109876',
    status: 'completed',
    duration: 210,
    timestamp: '2025-12-08T09:15:00Z',
    interested: true,
    language: 'Hindi',
    notes: 'Meeting schedule की गई है'
  }
];

export const CallDashboard: React.FC<CallDashboardProps> = ({
  selectedProject,
  onStartNewCall,
  onStartBulkCalls
}) => {
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    interested: undefined as boolean | undefined
  });

  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const analytics = mockCallAnalytics;
  const callHistory = mockRecentCalls;

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInterestIcon = (interested: boolean | null) => {
    if (interested === true) return <ThumbsUp className="w-4 h-4 text-green-600" />;
    if (interested === false) return <ThumbsDown className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      search: '',
      interested: undefined
    });
  };

  const exportCallData = () => {
    console.log('Exporting call data...');
  };

  const filteredCalls = callHistory.filter(call => {
    if (filters.status && call.status !== filters.status) return false;
    if (filters.search && 
        !call.leadName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !call.phoneNumber.includes(filters.search)) return false;
    if (filters.interested !== undefined && call.interested !== filters.interested) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Call Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {selectedProject ? `Project: ${selectedProject}` : 'All Projects'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <button
            onClick={exportCallData}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={onStartNewCall}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            New Call
          </button>
          
          <button
            onClick={onStartBulkCalls}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Bulk Calls
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <Phone className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">आज के Calls</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.todayCalls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.successRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Interested Leads</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.interestedLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(analytics.avgDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Ready to make calls? 📞</h3>
            <p className="text-blue-100 mt-1">Start individual calls या bulk campaigns शुरू करें</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onStartNewCall}
              className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Single Call
            </button>
            <button
              onClick={onStartBulkCalls}
              className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Bulk Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search leads..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Level
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.interested === undefined ? '' : filters.interested.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('interested', 
                    value === '' ? undefined : value === 'true'
                  );
                }}
              >
                <option value="">All</option>
                <option value="true">Interested</option>
                <option value="false">Not Interested</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Calls Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Calls</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md border border-gray-300 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{call.leadName}</div>
                      <div className="text-sm text-gray-500">{call.phoneNumber}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(call.timestamp).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                      {call.status === 'completed' && 'Completed'}
                      {call.status === 'in-progress' && 'In Progress'}
                      {call.status === 'failed' && 'Failed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.duration > 0 ? formatDuration(call.duration) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getInterestIcon(call.interested)}
                      <span className="text-sm text-gray-600">
                        {call.interested === true && 'Interested'}
                        {call.interested === false && 'Not Interested'}
                        {call.interested === null && 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{call.language}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {call.notes || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCalls.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No calls found</h3>
            <p className="text-gray-500">Try adjusting your filters या start making some calls!</p>
          </div>
        )}
      </div>
    </div>
  );
};