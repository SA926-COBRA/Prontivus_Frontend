import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CpuChipIcon, 
  DocumentTextIcon,
  MicrophoneIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  SparklesIcon,
  BrainIcon
} from '@heroicons/react/24/outline';
import { ModernCard, GradientButton, AnimatedCounter, StatusIndicator, LoadingSpinner } from '../components/ui/ModernComponents';
import { aiIntegrationApiService, AISummary, AIAnalytics } from '../lib/aiIntegrationApi';

interface AIIntegrationDashboardProps {
  className?: string;
}

const AIIntegrationDashboard: React.FC<AIIntegrationDashboardProps> = ({ className = '' }) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'configurations' | 'summaries' | 'transcriptions' | 'notes'>('overview');
  const [searchFilters, setSearchFilters] = useState({
    provider: '',
    task_type: '',
    status: '',
    patient_id: '',
    doctor_id: '',
    date_from: '',
    date_to: ''
  });
  const [showCreateConfiguration, setShowCreateConfiguration] = useState(false);
  const [showGenerateSummary, setShowGenerateSummary] = useState(false);
  const queryClient = useQueryClient();

  // Fetch AI summary
  const { data: aiSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['ai-summary'],
    queryFn: () => aiIntegrationApiService.getAISummary(),
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch AI analytics
  const { data: aiAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['ai-analytics'],
    queryFn: () => aiIntegrationApiService.getAIAnalytics(),
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch AI configurations
  const { data: configurations, isLoading: configurationsLoading } = useQuery({
    queryKey: ['ai-configurations', searchFilters],
    queryFn: () => aiIntegrationApiService.getAIConfigurations({
      provider: searchFilters.provider || undefined,
      task_type: searchFilters.task_type || undefined,
      is_active: searchFilters.status === 'active' ? true : searchFilters.status === 'inactive' ? false : undefined,
      limit: 100
    }),
  });

  // Fetch pre-consultation summaries
  const { data: summaries, isLoading: summariesLoading } = useQuery({
    queryKey: ['pre-consultation-summaries', searchFilters],
    queryFn: () => aiIntegrationApiService.getPreConsultationSummaries({
      patient_id: searchFilters.patient_id ? parseInt(searchFilters.patient_id) : undefined,
      doctor_id: searchFilters.doctor_id ? parseInt(searchFilters.doctor_id) : undefined,
      status: searchFilters.status || undefined,
      limit: 100
    }),
  });

  // Fetch medical transcriptions
  const { data: transcriptions, isLoading: transcriptionsLoading } = useQuery({
    queryKey: ['medical-transcriptions', searchFilters],
    queryFn: () => aiIntegrationApiService.getMedicalTranscriptions({
      patient_id: searchFilters.patient_id ? parseInt(searchFilters.patient_id) : undefined,
      doctor_id: searchFilters.doctor_id ? parseInt(searchFilters.doctor_id) : undefined,
      status: searchFilters.status || undefined,
      limit: 100
    }),
  });

  // Fetch clinical notes
  const { data: clinicalNotes, isLoading: notesLoading } = useQuery({
    queryKey: ['clinical-notes', searchFilters],
    queryFn: () => aiIntegrationApiService.getClinicalNotes({
      patient_id: searchFilters.patient_id ? parseInt(searchFilters.patient_id) : undefined,
      doctor_id: searchFilters.doctor_id ? parseInt(searchFilters.doctor_id) : undefined,
      status: searchFilters.status || undefined,
      limit: 100
    }),
  });

  // Generate pre-consultation summary mutation
  const generateSummaryMutation = useMutation({
    mutationFn: (request: any) => aiIntegrationApiService.generatePreConsultationSummary(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-consultation-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['ai-summary'] });
      queryClient.invalidateQueries({ queryKey: ['ai-analytics'] });
    },
  });

  const handleGenerateSummary = (request: any) => {
    generateSummaryMutation.mutate(request);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'generated':
        return 'text-purple-600 bg-purple-100';
      case 'transcribed':
        return 'text-indigo-600 bg-indigo-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
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
          <h1 className="text-2xl font-bold text-gray-900">AI Integration</h1>
          <p className="text-gray-600">AI-powered medical assistance and automation</p>
        </div>
        
        <div className="flex items-center gap-2">
          <GradientButton
            onClick={() => setShowCreateConfiguration(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Configuration
          </GradientButton>
        </div>
      </div>

      {/* Summary Cards */}
      {aiSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Configurations</p>
                <AnimatedCounter
                  value={aiSummary.total_configurations}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Cog6ToothIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing Jobs</p>
                <AnimatedCounter
                  value={aiSummary.total_processing_jobs}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CpuChipIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <AnimatedCounter
                  value={aiSummary.success_rate}
                  className="text-2xl font-bold text-gray-900"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <AnimatedCounter
                  value={aiSummary.total_cost}
                  className="text-2xl font-bold text-gray-900"
                />
                <span className="text-sm text-gray-500">USD</span>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <ChartBarIcon className="w-6 h-6 text-orange-600" />
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
            { id: 'configurations', name: 'Configurations', icon: Cog6ToothIcon },
            { id: 'summaries', name: 'Pre-Consultation', icon: DocumentTextIcon },
            { id: 'transcriptions', name: 'Transcriptions', icon: MicrophoneIcon },
            { id: 'notes', name: 'Clinical Notes', icon: ClipboardDocumentListIcon }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
            <select
              value={searchFilters.provider}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, provider: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Providers</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
              <option value="azure">Azure</option>
              <option value="local">Local</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
            <select
              value={searchFilters.task_type}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, task_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="pre_consultation_summary">Pre-Consultation Summary</option>
              <option value="medical_transcription">Medical Transcription</option>
              <option value="clinical_notes">Clinical Notes</option>
              <option value="diagnosis_suggestion">Diagnosis Suggestion</option>
              <option value="treatment_recommendation">Treatment Recommendation</option>
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="generated">Generated</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
            <input
              type="number"
              value={searchFilters.patient_id}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, patient_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Patient ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor ID</label>
            <input
              type="number"
              value={searchFilters.doctor_id}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, doctor_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Doctor ID"
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
        </div>
      </ModernCard>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurations by Provider */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurations by Provider</h3>
            {aiAnalytics && Object.keys(aiAnalytics.configurations_by_provider).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(aiAnalytics.configurations_by_provider).map(([provider, count]) => (
                  <div key={provider} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{provider}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Cog6ToothIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No configuration data available</p>
              </div>
            )}
          </ModernCard>

          {/* Configurations by Task Type */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurations by Task Type</h3>
            {aiAnalytics && Object.keys(aiAnalytics.configurations_by_task_type).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(aiAnalytics.configurations_by_task_type).map(([taskType, count]) => (
                  <div key={taskType} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{taskType.replace('_', ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BrainIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No task type data available</p>
              </div>
            )}
          </ModernCard>

          {/* Processing Job Statistics */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Job Statistics</h3>
            {aiAnalytics && Object.keys(aiAnalytics.processing_job_statistics).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(aiAnalytics.processing_job_statistics).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CpuChipIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No processing job data available</p>
              </div>
            )}
          </ModernCard>

          {/* Performance Metrics */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            {aiAnalytics && Object.keys(aiAnalytics.performance_metrics).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(aiAnalytics.performance_metrics).map(([metric, value]) => (
                  <div key={metric} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{metric.replace('_', ' ')}</span>
                    <span className="font-medium">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No performance data available</p>
              </div>
            )}
          </ModernCard>
        </div>
      )}

      {selectedTab === 'configurations' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AI Configurations</h3>
            <StatusIndicator status="info" />
          </div>
          
          {configurationsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : configurations && configurations.length > 0 ? (
            <div className="space-y-3">
              {configurations.map((configuration) => (
                <div key={configuration.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{configuration.configuration_name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(configuration.is_active ? 'active' : 'inactive')}`}>
                          {configuration.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                          {configuration.provider.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-600">
                          {configuration.task_type.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Model: {configuration.model_name} • Max Tokens: {configuration.max_tokens}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Temperature: {configuration.temperature} • Top P: {configuration.top_p}
                      </p>
                      
                      <p className="text-sm text-gray-600">
                        Usage: {configuration.usage_count} • Success: {configuration.success_count} • 
                        Avg Response: {configuration.average_response_time?.toFixed(2)}ms
                      </p>
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
              <Cog6ToothIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No AI configurations found</p>
            </div>
          )}
        </ModernCard>
      )}

      {selectedTab === 'summaries' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pre-Consultation Summaries</h3>
            <div className="flex items-center gap-2">
              <StatusIndicator status="info" />
              <GradientButton
                onClick={() => setShowGenerateSummary(true)}
                className="flex items-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" />
                Generate Summary
              </GradientButton>
            </div>
          </div>
          
          {summariesLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : summaries && summaries.length > 0 ? (
            <div className="space-y-3">
              {summaries.map((summary) => (
                <div key={summary.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{summary.summary_id}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(summary.status)}`}>
                          {summary.status}
                        </span>
                        {summary.confidence_score && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                            {(summary.confidence_score * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Patient: {summary.patient_id} • Doctor: {summary.doctor_id}
                      </p>
                      
                      {summary.chief_complaint && (
                        <p className="text-sm text-gray-600 mb-1">
                          Chief Complaint: {summary.chief_complaint}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600">
                        Created: {formatDate(summary.created_at)}
                        {summary.reviewed_at && ` • Reviewed: ${formatDate(summary.reviewed_at)}`}
                      </p>
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
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No pre-consultation summaries found</p>
            </div>
          )}
        </ModernCard>
      )}

      {selectedTab === 'transcriptions' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Medical Transcriptions</h3>
            <StatusIndicator status="info" />
          </div>
          
          {transcriptionsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : transcriptions && transcriptions.length > 0 ? (
            <div className="space-y-3">
              {transcriptions.map((transcription) => (
                <div key={transcription.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{transcription.transcription_id}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transcription.status)}`}>
                          {transcription.status}
                        </span>
                        {transcription.confidence_score && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                            {(transcription.confidence_score * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Patient: {transcription.patient_id} • Doctor: {transcription.doctor_id}
                      </p>
                      
                      {transcription.audio_duration_seconds && (
                        <p className="text-sm text-gray-600 mb-1">
                          Duration: {transcription.audio_duration_seconds.toFixed(1)}s
                        </p>
                      )}
                      
                      {transcription.cleaned_transcription && (
                        <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                          {transcription.cleaned_transcription.substring(0, 100)}...
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600">
                        Created: {formatDate(transcription.created_at)}
                        {transcription.reviewed_at && ` • Reviewed: ${formatDate(transcription.reviewed_at)}`}
                      </p>
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
              <MicrophoneIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No medical transcriptions found</p>
            </div>
          )}
        </ModernCard>
      )}

      {selectedTab === 'notes' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Clinical Notes</h3>
            <StatusIndicator status="info" />
          </div>
          
          {notesLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : clinicalNotes && clinicalNotes.length > 0 ? (
            <div className="space-y-3">
              {clinicalNotes.map((notes) => (
                <div key={notes.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{notes.notes_id}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(notes.status)}`}>
                          {notes.status}
                        </span>
                        {notes.confidence_score && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                            {(notes.confidence_score * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Patient: {notes.patient_id} • Doctor: {notes.doctor_id}
                      </p>
                      
                      {notes.assessment && (
                        <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                          Assessment: {notes.assessment.substring(0, 100)}...
                        </p>
                      )}
                      
                      {notes.plan && (
                        <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                          Plan: {notes.plan.substring(0, 100)}...
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600">
                        Created: {formatDate(notes.created_at)}
                        {notes.reviewed_at && ` • Reviewed: ${formatDate(notes.reviewed_at)}`}
                      </p>
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
              <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No clinical notes found</p>
            </div>
          )}
        </ModernCard>
      )}

      {/* Create Configuration Modal */}
      {showCreateConfiguration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create AI Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Configuration Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter configuration name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select provider</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="azure">Azure</option>
                  <option value="local">Local</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter model name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select task type</option>
                  <option value="pre_consultation_summary">Pre-Consultation Summary</option>
                  <option value="medical_transcription">Medical Transcription</option>
                  <option value="clinical_notes">Clinical Notes</option>
                  <option value="diagnosis_suggestion">Diagnosis Suggestion</option>
                  <option value="treatment_recommendation">Treatment Recommendation</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <GradientButton
                onClick={() => setShowCreateConfiguration(false)}
                className="flex-1"
              >
                Cancel
              </GradientButton>
              <GradientButton
                onClick={() => {
                  // Handle create configuration logic here
                  setShowCreateConfiguration(false);
                }}
                className="flex-1"
              >
                Create
              </GradientButton>
            </div>
          </div>
        </div>
      )}

      {/* Generate Summary Modal */}
      {showGenerateSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Pre-Consultation Summary</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter patient ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor ID</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter doctor ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Data</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter patient data (JSON format)"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <GradientButton
                onClick={() => setShowGenerateSummary(false)}
                className="flex-1"
              >
                Cancel
              </GradientButton>
              <GradientButton
                onClick={() => {
                  // Handle generate summary logic here
                  setShowGenerateSummary(false);
                }}
                className="flex-1"
              >
                Generate
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIIntegrationDashboard;
