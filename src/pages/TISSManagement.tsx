import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { ModernCard, GradientButton, AnimatedCounter, StatusIndicator, LoadingSpinner } from '../components/ui/ModernComponents';
import { financialTISSApiService, TISSDashboardSummary, TISSIntegration, TISSSubmission } from '../lib/financialTISSApi';

interface TISSManagementProps {
  className?: string;
}

const TISSManagement: React.FC<TISSManagementProps> = ({ className = '' }) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'integrations' | 'submissions' | 'codes'>('overview');
  const [searchFilters, setSearchFilters] = useState({
    integration_id: '',
    procedure_id: '',
    status: '',
    date_from: '',
    date_to: ''
  });
  const [showCreateIntegration, setShowCreateIntegration] = useState(false);
  const queryClient = useQueryClient();

  // Fetch TISS dashboard summary
  const { data: tissSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['tiss-dashboard-summary'],
    queryFn: () => financialTISSApiService.getTISSDashboardSummary(),
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch TISS integrations
  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ['tiss-integrations'],
    queryFn: () => financialTISSApiService.getTISSIntegrations({ limit: 100 }),
  });

  // Fetch TISS submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['tiss-submissions', searchFilters],
    queryFn: () => financialTISSApiService.getTISSSubmissions({
      integration_id: searchFilters.integration_id ? parseInt(searchFilters.integration_id) : undefined,
      procedure_id: searchFilters.procedure_id ? parseInt(searchFilters.procedure_id) : undefined,
      status: searchFilters.status || undefined,
      limit: 100
    }),
  });

  // Fetch TISS codes
  const { data: tissCodes, isLoading: tissCodesLoading } = useQuery({
    queryKey: ['tiss-codes'],
    queryFn: () => financialTISSApiService.getTISSCodes({ limit: 100 }),
  });

  // Submit to TISS mutation
  const submitToTISSMutation = useMutation({
    mutationFn: ({ procedureId, integrationId }: { procedureId: number; integrationId: number }) =>
      financialTISSApiService.submitToTISS({
        procedure_id: procedureId,
        integration_id: integrationId,
        submission_type: 'procedure'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiss-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['tiss-dashboard-summary'] });
    },
  });

  const handleSubmitToTISS = (procedureId: number, integrationId: number) => {
    submitToTISSMutation.mutate({ procedureId, integrationId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'successful':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
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

  if (summaryLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">TISS Management</h1>
          <p className="text-gray-600">Manage TISS integrations, submissions, and codes</p>
        </div>
        
        <div className="flex items-center gap-2">
          <GradientButton
            onClick={() => setShowCreateIntegration(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Integration
          </GradientButton>
        </div>
      </div>

      {/* Summary Cards */}
      {tissSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <AnimatedCounter
                  value={tissSummary.total_submissions}
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
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <AnimatedCounter
                  value={tissSummary.successful_submissions}
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
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <AnimatedCounter
                  value={tissSummary.failed_submissions}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <AnimatedCounter
                  value={tissSummary.pending_submissions}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
            { id: 'integrations', name: 'Integrations', icon: Cog6ToothIcon },
            { id: 'submissions', name: 'Submissions', icon: CloudArrowUpIcon },
            { id: 'codes', name: 'TISS Codes', icon: DocumentTextIcon }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Integration ID</label>
            <input
              type="number"
              value={searchFilters.integration_id}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, integration_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Integration ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Procedure ID</label>
            <input
              type="number"
              value={searchFilters.procedure_id}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, procedure_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Procedure ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={searchFilters.status}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
          {/* Recent Submissions */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
            {tissSummary && tissSummary.recent_submissions.length > 0 ? (
              <div className="space-y-3">
                {tissSummary.recent_submissions.map((submission) => (
                  <div key={submission.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{submission.submission_id}</p>
                        <p className="text-xs text-gray-600">
                          {formatDateTime(submission.submission_date)}
                        </p>
                        {submission.tiss_message && (
                          <p className="text-xs text-gray-500 mt-1">{submission.tiss_message}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No recent submissions</p>
              </div>
            )}
          </ModernCard>

          {/* Integration Status */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
            {tissSummary && Object.keys(tissSummary.integration_status).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(tissSummary.integration_status).map(([name, status]) => (
                  <div key={name} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-gray-600">
                          {status.last_sync ? `Last sync: ${formatDateTime(status.last_sync)}` : 'Never synced'}
                        </p>
                        {status.last_error && (
                          <p className="text-xs text-red-500 mt-1">{status.last_error}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${status.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                        {status.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Cog6ToothIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No integrations configured</p>
              </div>
            )}
          </ModernCard>
        </div>
      )}

      {selectedTab === 'integrations' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">TISS Integrations</h3>
            <StatusIndicator status="info" />
          </div>
          
          {integrationsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : integrations && integrations.length > 0 ? (
            <div className="space-y-3">
              {integrations.map((integration) => (
                <div key={integration.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{integration.integration_name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${integration.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                          {integration.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Health Plan: {integration.health_plan_id} • Version: {integration.tiss_version}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Frequency: {integration.submission_frequency} • Auto: {integration.auto_submission ? 'Yes' : 'No'}
                      </p>
                      
                      <p className="text-sm text-gray-600">
                        Last sync: {integration.last_sync ? formatDateTime(integration.last_sync) : 'Never'}
                      </p>
                      
                      {integration.last_error && (
                        <p className="text-sm text-red-600 mt-1">Error: {integration.last_error}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600">
                        <Cog6ToothIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Cog6ToothIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No integrations found</p>
            </div>
          )}
        </ModernCard>
      )}

      {selectedTab === 'submissions' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">TISS Submissions</h3>
            <StatusIndicator status="info" />
          </div>
          
          {submissionsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : submissions && submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div key={submission.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{submission.submission_id}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Integration: {submission.integration_id} • Procedure: {submission.procedure_id || 'N/A'}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Type: {submission.submission_type}
                      </p>
                      
                      <p className="text-sm text-gray-600">
                        {formatDateTime(submission.submission_date)}
                      </p>
                      
                      {submission.tiss_message && (
                        <p className="text-sm text-gray-500 mt-1">{submission.tiss_message}</p>
                      )}
                      
                      {submission.error_message && (
                        <p className="text-sm text-red-600 mt-1">Error: {submission.error_message}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {submission.status === 'pending' && (
                        <button 
                          className="p-2 text-gray-400 hover:text-green-600"
                          onClick={() => submission.procedure_id && handleSubmitToTISS(submission.procedure_id, submission.integration_id)}
                        >
                          <CloudArrowUpIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No submissions found</p>
            </div>
          )}
        </ModernCard>
      )}

      {selectedTab === 'codes' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">TISS Codes</h3>
            <StatusIndicator status="info" />
          </div>
          
          {tissCodesLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : tissCodes && tissCodes.length > 0 ? (
            <div className="space-y-3">
              {tissCodes.map((code) => (
                <div key={code.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{code.code}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${code.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                          {code.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        {code.description}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Category: {code.category.replace('_', ' ')} • Version: {code.tiss_version}
                      </p>
                      
                      <p className="text-sm text-gray-600">
                        Value: {code.base_value ? `R$ ${code.base_value}` : 'N/A'} • Unit: {code.unit_of_measure || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No TISS codes found</p>
            </div>
          )}
        </ModernCard>
      )}

      {/* Create Integration Modal */}
      {showCreateIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create TISS Integration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Integration Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter integration name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Health Plan ID</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter health plan ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter API endpoint"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TISS Version</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter TISS version"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <GradientButton
                onClick={() => setShowCreateIntegration(false)}
                className="flex-1"
              >
                Cancel
              </GradientButton>
              <GradientButton
                onClick={() => {
                  // Handle create integration logic here
                  setShowCreateIntegration(false);
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

export default TISSManagement;
