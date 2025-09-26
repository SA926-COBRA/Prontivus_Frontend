import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  LinkIcon, 
  VideoCameraIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  PlayIcon,
  StopIcon,
  Cog6ToothIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  HeartIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { ModernCard, GradientButton, AnimatedCounter, StatusIndicator, LoadingSpinner } from '../components/ui/ModernComponents';
import { integrationsApiService, IntegrationSummary, IntegrationAnalytics } from '../lib/integrationsApi';

interface IntegrationsDashboardProps {
  className?: string;
}

const IntegrationsDashboard: React.FC<IntegrationsDashboardProps> = ({ className = '' }) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'health-plans' | 'telemedicine' | 'sessions' | 'authorizations'>('overview');
  const [searchFilters, setSearchFilters] = useState({
    integration_name: '',
    status: '',
    provider: '',
    created_by: '',
    date_from: '',
    date_to: ''
  });
  const [showCreateIntegration, setShowCreateIntegration] = useState(false);
  const queryClient = useQueryClient();

  // Fetch integration summary
  const { data: integrationSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['integration-summary'],
    queryFn: () => integrationsApiService.getIntegrationSummary(),
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch integration analytics
  const { data: integrationAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['integration-analytics'],
    queryFn: () => integrationsApiService.getIntegrationAnalytics(),
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch health plan integrations
  const { data: healthPlanIntegrations, isLoading: healthPlanLoading } = useQuery({
    queryKey: ['health-plan-integrations', searchFilters],
    queryFn: () => integrationsApiService.getHealthPlanIntegrations({
      integration_name: searchFilters.integration_name || undefined,
      status: searchFilters.status || undefined,
      created_by: searchFilters.created_by ? parseInt(searchFilters.created_by) : undefined,
      date_from: searchFilters.date_from || undefined,
      date_to: searchFilters.date_to || undefined,
      limit: 100
    }),
  });

  // Fetch telemedicine integrations
  const { data: telemedicineIntegrations, isLoading: telemedicineLoading } = useQuery({
    queryKey: ['telemedicine-integrations', searchFilters],
    queryFn: () => integrationsApiService.getTelemedicineIntegrations({
      integration_name: searchFilters.integration_name || undefined,
      provider: searchFilters.provider || undefined,
      status: searchFilters.status || undefined,
      created_by: searchFilters.created_by ? parseInt(searchFilters.created_by) : undefined,
      date_from: searchFilters.date_from || undefined,
      date_to: searchFilters.date_to || undefined,
      limit: 100
    }),
  });

  // Fetch telemedicine sessions
  const { data: telemedicineSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['telemedicine-sessions', searchFilters],
    queryFn: () => integrationsApiService.getTelemedicineSessions({
      status: searchFilters.status || undefined,
      date_from: searchFilters.date_from || undefined,
      date_to: searchFilters.date_to || undefined,
      limit: 100
    }),
  });

  // Fetch authorizations
  const { data: authorizations, isLoading: authorizationsLoading } = useQuery({
    queryKey: ['authorizations', searchFilters],
    queryFn: () => integrationsApiService.getHealthPlanAuthorizations({
      status: searchFilters.status || undefined,
      date_from: searchFilters.date_from || undefined,
      date_to: searchFilters.date_to || undefined,
      limit: 100
    }),
  });

  // Test integration mutation
  const testIntegrationMutation = useMutation({
    mutationFn: ({ type, id }: { type: 'health-plan' | 'telemedicine'; id: number }) => {
      if (type === 'health-plan') {
        return integrationsApiService.testHealthPlanIntegration(id);
      } else {
        return integrationsApiService.testTelemedicineIntegration(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-plan-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['telemedicine-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['integration-summary'] });
      queryClient.invalidateQueries({ queryKey: ['integration-analytics'] });
    },
  });

  const handleTestIntegration = (type: 'health-plan' | 'telemedicine', id: number) => {
    testIntegrationMutation.mutate({ type, id });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100';
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
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">Manage health plans and telemedicine integrations</p>
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
      {integrationSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Integrations</p>
                <AnimatedCounter
                  value={integrationSummary.total_integrations}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Integrations</p>
                <AnimatedCounter
                  value={integrationSummary.active_integrations}
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
                <p className="text-sm font-medium text-gray-600">Telemedicine Sessions</p>
                <AnimatedCounter
                  value={integrationSummary.total_sessions}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <VideoCameraIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Authorizations</p>
                <AnimatedCounter
                  value={integrationSummary.pending_authorizations}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <DocumentCheckIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: LinkIcon },
            { id: 'health-plans', name: 'Health Plans', icon: HeartIcon },
            { id: 'telemedicine', name: 'Telemedicine', icon: VideoCameraIcon },
            { id: 'sessions', name: 'Sessions', icon: UserGroupIcon },
            { id: 'authorizations', name: 'Authorizations', icon: DocumentCheckIcon }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Integration Name</label>
            <input
              type="text"
              value={searchFilters.integration_name}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, integration_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Integration name"
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="error">Error</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
            <select
              value={searchFilters.provider}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, provider: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Providers</option>
              <option value="zoom">Zoom</option>
              <option value="teams">Teams</option>
              <option value="google_meet">Google Meet</option>
              <option value="webex">Webex</option>
              <option value="custom">Custom</option>
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
          {/* Integrations by Status */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrations by Status</h3>
            {integrationSummary && Object.keys(integrationSummary.integrations_by_status).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(integrationSummary.integrations_by_status).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <LinkIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No integration status data available</p>
              </div>
            )}
          </ModernCard>

          {/* Integrations by Type */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrations by Type</h3>
            {integrationSummary && Object.keys(integrationSummary.integrations_by_type).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(integrationSummary.integrations_by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Cog6ToothIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No integration type data available</p>
              </div>
            )}
          </ModernCard>

          {/* Session Statistics */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Statistics</h3>
            {integrationAnalytics && Object.keys(integrationAnalytics.session_statistics).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(integrationAnalytics.session_statistics).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <VideoCameraIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No session data available</p>
              </div>
            )}
          </ModernCard>

          {/* Authorization Statistics */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Authorization Statistics</h3>
            {integrationAnalytics && Object.keys(integrationAnalytics.authorization_statistics).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(integrationAnalytics.authorization_statistics).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DocumentCheckIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No authorization data available</p>
              </div>
            )}
          </ModernCard>
        </div>
      )}

      {selectedTab === 'health-plans' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Health Plan Integrations</h3>
            <StatusIndicator status="info" />
          </div>
          
          {healthPlanLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : healthPlanIntegrations && healthPlanIntegrations.length > 0 ? (
            <div className="space-y-3">
              {healthPlanIntegrations.map((integration) => (
                <div key={integration.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{integration.integration_name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                          {integration.plan_name || 'Health Plan'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Health Plan ID: {integration.health_plan_id} • API: {integration.api_endpoint}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Auth: {integration.authentication_method} • 
                        {integration.authorization_required ? 'Authorization Required' : 'No Authorization'}
                      </p>
                      
                      <p className="text-sm text-gray-600">
                        Created: {formatDate(integration.created_at)} • 
                        Last Sync: {integration.last_sync ? formatDateTime(integration.last_sync) : 'Never'}
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
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-blue-600"
                        onClick={() => handleTestIntegration('health-plan', integration.id)}
                      >
                        <CloudArrowUpIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <HeartIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No health plan integrations found</p>
            </div>
          )}
        </ModernCard>
      )}

      {selectedTab === 'telemedicine' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Telemedicine Integrations</h3>
            <StatusIndicator status="info" />
          </div>
          
          {telemedicineLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : telemedicineIntegrations && telemedicineIntegrations.length > 0 ? (
            <div className="space-y-3">
              {telemedicineIntegrations.map((integration) => (
                <div key={integration.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{integration.integration_name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-600">
                          {integration.provider.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        API: {integration.api_endpoint} • Max Participants: {integration.max_participants}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Recording: {integration.recording_enabled ? 'Enabled' : 'Disabled'} • 
                        Waiting Room: {integration.waiting_room_enabled ? 'Enabled' : 'Disabled'}
                      </p>
                      
                      <p className="text-sm text-gray-600">
                        Created: {formatDate(integration.created_at)} • 
                        Last Sync: {integration.last_sync ? formatDateTime(integration.last_sync) : 'Never'}
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
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-blue-600"
                        onClick={() => handleTestIntegration('telemedicine', integration.id)}
                      >
                        <CloudArrowUpIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <VideoCameraIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No telemedicine integrations found</p>
            </div>
          )}
        </ModernCard>
      )}

      {selectedTab === 'sessions' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Telemedicine Sessions</h3>
            <StatusIndicator status="info" />
          </div>
          
          {sessionsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : telemedicineSessions && telemedicineSessions.length > 0 ? (
            <div className="space-y-3">
              {telemedicineSessions.map((session) => (
                <div key={session.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{session.session_title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          {session.session_id}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Patient: {session.patient_id} • Doctor: {session.doctor_id}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Scheduled: {formatDateTime(session.scheduled_start)} - {formatDateTime(session.scheduled_end)}
                      </p>
                      
                      {session.meeting_url && (
                        <p className="text-sm text-blue-600 mb-1">
                          Meeting URL: {session.meeting_url}
                        </p>
                      )}
                      
                      {session.actual_start && (
                        <p className="text-sm text-gray-500">
                          Started: {formatDateTime(session.actual_start)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {session.status === 'scheduled' && (
                        <button className="p-2 text-gray-400 hover:text-green-600">
                          <PlayIcon className="w-4 h-4" />
                        </button>
                      )}
                      {session.status === 'started' && (
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
              <UserGroupIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No telemedicine sessions found</p>
            </div>
          )}
        </ModernCard>
      )}

      {selectedTab === 'authorizations' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Health Plan Authorizations</h3>
            <StatusIndicator status="info" />
          </div>
          
          {authorizationsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : authorizations && authorizations.length > 0 ? (
            <div className="space-y-3">
              {authorizations.map((authorization) => (
                <div key={authorization.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{authorization.authorization_number}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(authorization.authorization_status)}`}>
                          {authorization.authorization_status}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-600">
                          {authorization.urgency_level}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Patient: {authorization.patient_id} • Doctor: {authorization.doctor_id}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Procedure: {authorization.procedure_code} - {authorization.procedure_description}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Requested: {formatDate(authorization.requested_date)}
                      </p>
                      
                      {authorization.authorized_amount && (
                        <p className="text-sm text-green-600">
                          Authorized: R$ {authorization.authorized_amount}
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DocumentCheckIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No authorizations found</p>
            </div>
          )}
        </ModernCard>
      )}

      {/* Create Integration Modal */}
      {showCreateIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Integration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Integration Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select type</option>
                  <option value="health_plan">Health Plan</option>
                  <option value="telemedicine">Telemedicine</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Integration Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter integration name"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Authentication Method</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select method</option>
                  <option value="oauth">OAuth</option>
                  <option value="api_key">API Key</option>
                  <option value="basic_auth">Basic Auth</option>
                </select>
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

export default IntegrationsDashboard;
