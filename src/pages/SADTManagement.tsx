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
  UserIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { ModernCard, GradientButton, AnimatedCounter, StatusIndicator, LoadingSpinner } from '../components/ui/ModernComponents';
import { advancedEMRApiService, SADT, SADTICDCode, SADTSummary } from '../lib/advancedEMRApi';

interface SADTManagementProps {
  className?: string;
}

const SADTManagement: React.FC<SADTManagementProps> = ({ className = '' }) => {
  const [selectedSADT, setSelectedSADT] = useState<SADT | null>(null);
  const [searchFilters, setSearchFilters] = useState({
    patient_id: '',
    doctor_id: '',
    sadt_type: '',
    status: '',
    procedure_name: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAuthorizationForm, setShowAuthorizationForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch SADT summary
  const { data: sadtSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['sadt-summary'],
    queryFn: () => advancedEMRApiService.getSADTSummary(),
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch SADT requests
  const { data: sadtRequests, isLoading: sadtLoading } = useQuery({
    queryKey: ['sadt-requests', searchFilters],
    queryFn: () => advancedEMRApiService.getSADTRequests({
      patient_id: searchFilters.patient_id ? parseInt(searchFilters.patient_id) : undefined,
      doctor_id: searchFilters.doctor_id ? parseInt(searchFilters.doctor_id) : undefined,
      sadt_type: searchFilters.sadt_type || undefined,
      status: searchFilters.status || undefined,
      procedure_name: searchFilters.procedure_name || undefined,
      limit: 100
    }),
  });

  // Fetch SADT ICD codes
  const { data: icdCodes, isLoading: icdCodesLoading } = useQuery({
    queryKey: ['sadt-icd-codes', selectedSADT?.id],
    queryFn: () => selectedSADT ? advancedEMRApiService.getSADTICDCodes(selectedSADT.id) : [],
    enabled: !!selectedSADT,
  });

  // Fetch SADT audit
  const { data: audit, isLoading: auditLoading } = useQuery({
    queryKey: ['sadt-audit', selectedSADT?.id],
    queryFn: () => selectedSADT ? advancedEMRApiService.getSADTAudit(selectedSADT.id) : [],
    enabled: !!selectedSADT,
  });

  // Authorize SADT mutation
  const authorizeSADTMutation = useMutation({
    mutationFn: ({ sadtId, authorizationNumber }: { sadtId: number; authorizationNumber: string }) =>
      advancedEMRApiService.authorizeSADTRequest(sadtId, {
        sadt_id: sadtId,
        authorization_number: authorizationNumber,
        authorized_by: 1, // Current user ID
        authorized_date: new Date().toISOString(),
        procedure_results: '',
        follow_up_required: false
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sadt-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sadt-summary'] });
      setShowAuthorizationForm(false);
    },
  });

  const handleAuthorizeSADT = (sadtId: number, authorizationNumber: string) => {
    authorizeSADTMutation.mutate({ sadtId, authorizationNumber });
  };

  const getSADTTypeColor = (type: string) => {
    switch (type) {
      case 'surgery':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'procedure':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'consultation':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'examination':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'therapy':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'emergency':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'postponed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'normal':
        return 'text-blue-600 bg-blue-100';
      case 'low':
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

  if (summaryLoading || sadtLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">SADT Management</h1>
          <p className="text-gray-600">Manage procedure authorization requests (Solicitação de Autorização de Procedimentos)</p>
        </div>
        
        <GradientButton
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New SADT Request
        </GradientButton>
      </div>

      {/* Summary Cards */}
      {sadtSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total SADT</p>
                <AnimatedCounter
                  value={sadtSummary.total_sadt}
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <AnimatedCounter
                  value={sadtSummary.pending_sadt}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Authorized</p>
                <AnimatedCounter
                  value={sadtSummary.authorized_sadt}
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
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <AnimatedCounter
                  value={sadtSummary.completed_sadt}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      {/* Search and Filters */}
      <ModernCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">SADT Type</label>
            <select
              value={searchFilters.sadt_type}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, sadt_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="procedure">Procedure</option>
              <option value="surgery">Surgery</option>
              <option value="examination">Examination</option>
              <option value="therapy">Therapy</option>
              <option value="emergency">Emergency</option>
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
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="postponed">Postponed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Procedure</label>
            <input
              type="text"
              value={searchFilters.procedure_name}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, procedure_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Procedure name"
            />
          </div>
        </div>
      </ModernCard>

      {/* SADT Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SADT Table */}
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">SADT Requests</h3>
            <StatusIndicator status="info" />
          </div>
          
          <div className="space-y-3">
            {sadtRequests && sadtRequests.length > 0 ? (
              sadtRequests.map((sadt) => (
                <div
                  key={sadt.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedSADT?.id === sadt.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => setSelectedSADT(sadt)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{sadt.procedure_name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getSADTTypeColor(sadt.sadt_type)}`}>
                          {sadt.sadt_type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(sadt.status)}`}>
                          {sadt.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(sadt.priority)}`}>
                          {sadt.priority}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        {sadt.description}
                      </p>
                      
                      <p className="text-xs text-gray-500">
                        Patient: {sadt.patient_id} • Doctor: {sadt.doctor_id}
                      </p>
                      
                      <p className="text-xs text-gray-500">
                        Requested: {formatDate(sadt.requested_date)}
                      </p>
                      
                      {sadt.scheduled_date && (
                        <p className="text-xs text-gray-500">
                          Scheduled: {formatDate(sadt.scheduled_date)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {sadt.authorization_number && (
                        <ShieldCheckIcon className="w-4 h-4 text-green-500" title="Authorized" />
                      )}
                      {sadt.copayment_required && (
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" title="Copayment Required" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No SADT requests found</p>
              </div>
            )}
          </div>
        </ModernCard>

        {/* SADT Details */}
        {selectedSADT && (
          <ModernCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">SADT Details</h3>
              <div className="flex items-center gap-2">
                {selectedSADT.status === 'scheduled' && (
                  <GradientButton
                    onClick={() => setShowAuthorizationForm(true)}
                    disabled={authorizeSADTMutation.isPending}
                    className="text-sm"
                  >
                    {authorizeSADTMutation.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Authorize'
                    )}
                  </GradientButton>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">SADT Number:</span>
                    <p className="font-medium">{selectedSADT.sadt_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Procedure:</span>
                    <p className="font-medium">{selectedSADT.procedure_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <p className="font-medium">{selectedSADT.sadt_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium">{selectedSADT.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <p className="font-medium">{selectedSADT.priority}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">TUSS Code:</span>
                    <p className="font-medium">{selectedSADT.procedure_code || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Medical Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Clinical Indication:</span>
                    <p className="text-gray-900">{selectedSADT.clinical_indication}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Diagnostic Hypothesis:</span>
                    <p className="text-gray-900">{selectedSADT.diagnostic_hypothesis}</p>
                  </div>
                  {selectedSADT.medical_history && (
                    <div>
                      <span className="text-gray-600">Medical History:</span>
                      <p className="text-gray-900">{selectedSADT.medical_history}</p>
                    </div>
                  )}
                  {selectedSADT.current_symptoms && (
                    <div>
                      <span className="text-gray-600">Current Symptoms:</span>
                      <p className="text-gray-900">{selectedSADT.current_symptoms}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Authorization</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Authorization Number:</span>
                    <p className="font-medium">{selectedSADT.authorization_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Authorized Date:</span>
                    <p className="font-medium">{selectedSADT.authorized_date ? formatDate(selectedSADT.authorized_date) : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Health Plan:</span>
                    <p className="font-medium">{selectedSADT.health_plan_authorization || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Copayment:</span>
                    <p className="font-medium">{selectedSADT.copayment_required ? `R$ ${selectedSADT.copayment_amount}` : 'None'}</p>
                  </div>
                </div>
              </div>
              
              {selectedSADT.procedure_results && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Procedure Results</h4>
                  <p className="text-sm text-gray-600">{selectedSADT.procedure_results}</p>
                </div>
              )}
            </div>
          </ModernCard>
        )}
      </div>

      {/* ICD Codes and Audit */}
      {selectedSADT && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ICD Codes */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ICD Codes</h3>
            
            {icdCodesLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : icdCodes && icdCodes.length > 0 ? (
              <div className="space-y-3">
                {icdCodes.map((icdCode) => (
                  <div key={icdCode.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{icdCode.icd_code}</p>
                          {icdCode.is_primary && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{icdCode.icd_description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="capitalize">{icdCode.icd_category}</span>
                          {icdCode.severity && <span>• {icdCode.severity}</span>}
                          {icdCode.laterality && <span>• {icdCode.laterality}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No ICD codes assigned</p>
              </div>
            )}
          </ModernCard>

          {/* Audit Trail */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Trail</h3>
            
            {auditLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : audit && audit.length > 0 ? (
              <div className="space-y-3">
                {audit.map((auditRecord) => (
                  <div key={auditRecord.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm capitalize">{auditRecord.action}</p>
                        <p className="text-xs text-gray-600">
                          {formatDateTime(auditRecord.performed_at)}
                        </p>
                        {auditRecord.reason && (
                          <p className="text-xs text-gray-500 mt-1">{auditRecord.reason}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {auditRecord.previous_status && (
                          <p className="text-xs text-gray-600">
                            {auditRecord.previous_status} → {auditRecord.new_status}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No audit records</p>
              </div>
            )}
          </ModernCard>
        </div>
      )}

      {/* Authorization Form Modal */}
      {showAuthorizationForm && selectedSADT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Authorize SADT Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Authorization Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter authorization number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Procedure Results</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter procedure results (optional)"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="followUp"
                  className="mr-2"
                />
                <label htmlFor="followUp" className="text-sm text-gray-700">
                  Follow-up required
                </label>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <GradientButton
                onClick={() => setShowAuthorizationForm(false)}
                className="flex-1"
              >
                Cancel
              </GradientButton>
              <GradientButton
                onClick={() => {
                  // Handle authorization logic here
                  setShowAuthorizationForm(false);
                }}
                className="flex-1"
              >
                Authorize
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SADTManagement;
