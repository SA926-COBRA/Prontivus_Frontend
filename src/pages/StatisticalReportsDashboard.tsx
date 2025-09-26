import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DocumentTextIcon, 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DownloadIcon,
  PlayIcon,
  StopIcon,
  Cog6ToothIcon,
  TableCellsIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';
import { ModernCard, GradientButton, AnimatedCounter, StatusIndicator, LoadingSpinner } from '../components/ui/ModernComponents';
import { statisticalReportsApiService, StatisticalReport, ReportSummary, ReportAnalytics } from '../lib/statisticalReportsApi';

interface StatisticalReportsDashboardProps {
  className?: string;
}

const StatisticalReportsDashboard: React.FC<StatisticalReportsDashboardProps> = ({ className = '' }) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'reports' | 'templates' | 'metrics' | 'dashboards'>('overview');
  const [searchFilters, setSearchFilters] = useState({
    report_name: '',
    report_type: '',
    status: '',
    created_by: '',
    date_from: '',
    date_to: ''
  });
  const [showCreateReport, setShowCreateReport] = useState(false);
  const queryClient = useQueryClient();

  // Fetch report summary
  const { data: reportSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['report-summary'],
    queryFn: () => statisticalReportsApiService.getReportSummary(),
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch report analytics
  const { data: reportAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['report-analytics'],
    queryFn: () => statisticalReportsApiService.getReportAnalytics(),
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch statistical reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['statistical-reports', searchFilters],
    queryFn: () => statisticalReportsApiService.getStatisticalReports({
      report_name: searchFilters.report_name || undefined,
      report_type: searchFilters.report_type || undefined,
      status: searchFilters.status || undefined,
      created_by: searchFilters.created_by ? parseInt(searchFilters.created_by) : undefined,
      date_from: searchFilters.date_from || undefined,
      date_to: searchFilters.date_to || undefined,
      limit: 100
    }),
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: (reportId: number) =>
      statisticalReportsApiService.generateReport({
        report_id: reportId,
        format: 'pdf'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statistical-reports'] });
      queryClient.invalidateQueries({ queryKey: ['report-summary'] });
      queryClient.invalidateQueries({ queryKey: ['report-analytics'] });
    },
  });

  const handleGenerateReport = (reportId: number) => {
    generateReportMutation.mutate(reportId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'generating':
        return 'text-blue-600 bg-blue-100';
      case 'draft':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (summaryLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistical Reports</h1>
          <p className="text-gray-600">Generate and manage statistical reports and analytics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <GradientButton
            onClick={() => setShowCreateReport(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Report
          </GradientButton>
        </div>
      </div>

      {/* Summary Cards */}
      {reportSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <AnimatedCounter
                  value={reportSummary.total_reports}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Reports</p>
                <AnimatedCounter
                  value={reportSummary.active_reports}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Generations</p>
                <AnimatedCounter
                  value={reportSummary.total_generations}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <AnimatedCounter
                  value={reportSummary.total_downloads}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <DownloadIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'reports', name: 'Reports', icon: DocumentTextIcon },
            { id: 'templates', name: 'Templates', icon: Cog6ToothIcon },
            { id: 'metrics', name: 'Metrics', icon: TableCellsIcon },
            { id: 'dashboards', name: 'Dashboards', icon: PresentationChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <ModernCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
            <input
              type="text"
              value={searchFilters.report_name}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, report_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Report name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={searchFilters.report_type}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, report_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="clinical">Clinical</option>
              <option value="financial">Financial</option>
              <option value="operational">Operational</option>
              <option value="quality">Quality</option>
              <option value="compliance">Compliance</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={searchFilters.status}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="generating">Generating</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
            <input
              type="number"
              value={searchFilters.created_by}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, created_by: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="User ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
            <input
              type="date"
              value={searchFilters.date_from}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, date_from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
            <input
              type="date"
              value={searchFilters.date_to}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, date_to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </ModernCard>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports by Type */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Type</h3>
            {reportSummary && Object.keys(reportSummary.reports_by_type).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(reportSummary.reports_by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{type}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No report type data available</p>
              </div>
            )}
          </ModernCard>

          {/* Reports by Status */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Status</h3>
            {reportSummary && Object.keys(reportSummary.reports_by_status).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(reportSummary.reports_by_status).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No report status data available</p>
              </div>
            )}
          </ModernCard>

          {/* Most Accessed Reports */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Accessed Reports</h3>
            {reportAnalytics && reportAnalytics.most_accessed_reports.length > 0 ? (
              <div className="space-y-3">
                {reportAnalytics.most_accessed_reports.map((report) => (
                  <div key={report.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{report.name}</p>
                        <p className="text-xs text-gray-600 capitalize">{report.type}</p>
                      </div>
                      <span className="text-sm font-medium">{report.downloads} downloads</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DownloadIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No access data available</p>
              </div>
            )}
          </ModernCard>

          {/* Generation Statistics */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Statistics</h3>
            {reportAnalytics ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-medium">{reportAnalytics.generation_success_rate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Generation Time</span>
                  <span className="font-medium">{reportAnalytics.average_generation_time.toFixed(2)}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Generated Today</span>
                  <span className="font-medium">{reportAnalytics.reports_generated_today}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Generated This Week</span>
                  <span className="font-medium">{reportAnalytics.reports_generated_this_week}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Generated This Month</span>
                  <span className="font-medium">{reportAnalytics.reports_generated_this_month}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClockIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No generation data available</p>
              </div>
            )}
          </ModernCard>
        </div>
      )}

      {selectedTab === 'reports' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Statistical Reports</h3>
            <StatusIndicator status="info" />
          </div>
          
          {reportsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{report.report_name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          {report.report_type}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                          {report.report_format.toUpperCase()}
                        </span>
                      </div>
                      
                      {report.description && (
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Data Source: {report.data_source} • Frequency: {report.frequency}
                      </p>
                      
                      <p className="text-sm text-gray-600">
                        Created: {formatDate(report.created_at)} • 
                        Generations: {report.generation_count} • 
                        Downloads: {report.download_count}
                      </p>
                      
                      {report.last_generated && (
                        <p className="text-sm text-gray-500 mt-1">
                          Last Generated: {formatDateTime(report.last_generated)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      {report.status === 'completed' && (
                        <button className="p-2 text-gray-400 hover:text-blue-600">
                          <DownloadIcon className="w-4 h-4" />
                        </button>
                      )}
                      {report.status === 'draft' && (
                        <button 
                          className="p-2 text-gray-400 hover:text-green-600"
                          onClick={() => handleGenerateReport(report.id)}
                        >
                          <PlayIcon className="w-4 h-4" />
                        </button>
                      )}
                      {report.status === 'generating' && (
                        <button className="p-2 text-gray-400 hover:text-red-600">
                          <StopIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No reports found</p>
            </div>
          )}
        </ModernCard>
      )}

      {selectedTab === 'templates' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Report Templates</h3>
            <StatusIndicator status="info" />
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <Cog6ToothIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Templates management coming soon</p>
          </div>
        </ModernCard>
      )}

      {selectedTab === 'metrics' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Report Metrics</h3>
            <StatusIndicator status="info" />
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <TableCellsIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Metrics management coming soon</p>
          </div>
        </ModernCard>
      )}

      {selectedTab === 'dashboards' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Report Dashboards</h3>
            <StatusIndicator status="info" />
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <PresentationChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Dashboards management coming soon</p>
          </div>
        </ModernCard>
      )}

      {/* Create Report Modal */}
      {showCreateReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Statistical Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter report name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select type</option>
                  <option value="clinical">Clinical</option>
                  <option value="financial">Financial</option>
                  <option value="operational">Operational</option>
                  <option value="quality">Quality</option>
                  <option value="compliance">Compliance</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter data source"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Format</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                  <option value="html">HTML</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <GradientButton
                onClick={() => setShowCreateReport(false)}
                className="flex-1"
              >
                Cancel
              </GradientButton>
              <GradientButton
                onClick={() => {
                  // Handle create report logic here
                  setShowCreateReport(false);
                }}
                className="flex-1"
              >
                Create
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticalReportsDashboard;
