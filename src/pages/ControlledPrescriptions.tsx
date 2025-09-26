import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PillsIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { ModernCard, GradientButton, AnimatedCounter, StatusIndicator, LoadingSpinner } from '../components/ui/ModernComponents';
import { advancedEMRApiService, ControlledPrescription, PrescriptionRefill, PrescriptionSummary } from '../lib/advancedEMRApi';

interface ControlledPrescriptionsProps {
  className?: string;
}

const ControlledPrescriptions: React.FC<ControlledPrescriptionsProps> = ({ className = '' }) => {
  const [selectedPrescription, setSelectedPrescription] = useState<ControlledPrescription | null>(null);
  const [searchFilters, setSearchFilters] = useState({
    patient_id: '',
    doctor_id: '',
    control_level: '',
    status: '',
    medication_name: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDispenseForm, setShowDispenseForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch prescription summary
  const { data: prescriptionSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['prescription-summary'],
    queryFn: () => advancedEMRApiService.getPrescriptionSummary(),
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch controlled prescriptions
  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['controlled-prescriptions', searchFilters],
    queryFn: () => advancedEMRApiService.getControlledPrescriptions({
      patient_id: searchFilters.patient_id ? parseInt(searchFilters.patient_id) : undefined,
      doctor_id: searchFilters.doctor_id ? parseInt(searchFilters.doctor_id) : undefined,
      control_level: searchFilters.control_level || undefined,
      status: searchFilters.status || undefined,
      medication_name: searchFilters.medication_name || undefined,
      limit: 100
    }),
  });

  // Fetch prescription refills
  const { data: refills, isLoading: refillsLoading } = useQuery({
    queryKey: ['prescription-refills', selectedPrescription?.id],
    queryFn: () => selectedPrescription ? advancedEMRApiService.getPrescriptionRefills(selectedPrescription.id) : [],
    enabled: !!selectedPrescription,
  });

  // Fetch prescription audit
  const { data: audit, isLoading: auditLoading } = useQuery({
    queryKey: ['prescription-audit', selectedPrescription?.id],
    queryFn: () => selectedPrescription ? advancedEMRApiService.getPrescriptionAudit(selectedPrescription.id) : [],
    enabled: !!selectedPrescription,
  });

  // Dispense prescription mutation
  const dispensePrescriptionMutation = useMutation({
    mutationFn: ({ prescriptionId, quantity }: { prescriptionId: number; quantity: number }) =>
      advancedEMRApiService.dispensePrescription(prescriptionId, {
        prescription_id: prescriptionId,
        quantity_dispensed: quantity,
        patient_identification_verified: true,
        prescription_verified: true,
        regulatory_compliance_checked: true
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlled-prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription-refills'] });
      queryClient.invalidateQueries({ queryKey: ['prescription-summary'] });
      setShowDispenseForm(false);
    },
  });

  const handleDispensePrescription = (prescriptionId: number, quantity: number) => {
    dispensePrescriptionMutation.mutate({ prescriptionId, quantity });
  };

  const getControlLevelColor = (level: string) => {
    switch (level) {
      case 'A1':
      case 'A2':
      case 'A3':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'B1':
      case 'B2':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'C1':
      case 'C2':
      case 'C3':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'M1':
      case 'M2':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      case 'suspended':
        return 'text-yellow-600 bg-yellow-100';
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

  if (summaryLoading || prescriptionsLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Controlled Prescriptions</h1>
          <p className="text-gray-600">Manage controlled substance prescriptions with regulatory compliance</p>
        </div>
        
        <GradientButton
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New Prescription
        </GradientButton>
      </div>

      {/* Summary Cards */}
      {prescriptionSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <AnimatedCounter
                  value={prescriptionSummary.total_prescriptions}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <PillsIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                <AnimatedCounter
                  value={prescriptionSummary.active_prescriptions}
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
                <p className="text-sm font-medium text-gray-600">Controlled Substances</p>
                <AnimatedCounter
                  value={prescriptionSummary.controlled_prescriptions}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ShieldCheckIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired Prescriptions</p>
                <AnimatedCounter
                  value={prescriptionSummary.expired_prescriptions}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Control Level</label>
            <select
              value={searchFilters.control_level}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, control_level: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              <option value="A1">A1 - Highest Control</option>
              <option value="A2">A2 - High Control</option>
              <option value="A3">A3 - Medium Control</option>
              <option value="B1">B1 - Low Control</option>
              <option value="B2">B2 - Lowest Control</option>
              <option value="C1">C1 - Prescription Only</option>
              <option value="C2">C2 - Special Control</option>
              <option value="C3">C3 - Additional Control</option>
              <option value="M1">M1 - Over-the-counter</option>
              <option value="M2">M2 - OTC Restricted</option>
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
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medication</label>
            <input
              type="text"
              value={searchFilters.medication_name}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, medication_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Medication name"
            />
          </div>
        </div>
      </ModernCard>

      {/* Prescriptions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prescriptions Table */}
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Prescriptions</h3>
            <StatusIndicator status="info" />
          </div>
          
          <div className="space-y-3">
            {prescriptions && prescriptions.length > 0 ? (
              prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedPrescription?.id === prescription.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{prescription.medication_name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getControlLevelColor(prescription.control_level)}`}>
                          {prescription.control_level}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(prescription.status)}`}>
                          {prescription.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                      </p>
                      
                      <p className="text-xs text-gray-500">
                        Patient: {prescription.patient_id} • Doctor: {prescription.doctor_id}
                      </p>
                      
                      <p className="text-xs text-gray-500">
                        Created: {formatDate(prescription.created_at)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {prescription.controlled_substance && (
                        <ShieldCheckIcon className="w-4 h-4 text-red-500" title="Controlled Substance" />
                      )}
                      {prescription.digital_signature && (
                        <DocumentTextIcon className="w-4 h-4 text-green-500" title="Digitally Signed" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PillsIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No prescriptions found</p>
              </div>
            )}
          </div>
        </ModernCard>

        {/* Prescription Details */}
        {selectedPrescription && (
          <ModernCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Prescription Details</h3>
              <div className="flex items-center gap-2">
                {selectedPrescription.status === 'active' && (
                  <GradientButton
                    onClick={() => setShowDispenseForm(true)}
                    disabled={dispensePrescriptionMutation.isPending}
                    className="text-sm"
                  >
                    {dispensePrescriptionMutation.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Dispense'
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
                    <span className="text-gray-600">Prescription Number:</span>
                    <p className="font-medium">{selectedPrescription.prescription_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Medication:</span>
                    <p className="font-medium">{selectedPrescription.medication_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Dosage:</span>
                    <p className="font-medium">{selectedPrescription.dosage}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Frequency:</span>
                    <p className="font-medium">{selectedPrescription.frequency}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">{selectedPrescription.duration}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Quantity:</span>
                    <p className="font-medium">{selectedPrescription.quantity} {selectedPrescription.unit}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Control Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Control Level:</span>
                    <p className="font-medium">{selectedPrescription.control_level}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">ANVISA Code:</span>
                    <p className="font-medium">{selectedPrescription.anvisa_code || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Controlled Substance:</span>
                    <p className="font-medium">{selectedPrescription.controlled_substance ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Special Authorization:</span>
                    <p className="font-medium">{selectedPrescription.requires_special_authorization ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Refills</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Allowed:</span>
                    <p className="font-medium">{selectedPrescription.refills_allowed}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Used:</span>
                    <p className="font-medium">{selectedPrescription.refills_used}</p>
                  </div>
                </div>
              </div>
              
              {selectedPrescription.instructions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                  <p className="text-sm text-gray-600">{selectedPrescription.instructions}</p>
                </div>
              )}
            </div>
          </ModernCard>
        )}
      </div>

      {/* Refills and Audit */}
      {selectedPrescription && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Refills */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Refills</h3>
            
            {refillsLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : refills && refills.length > 0 ? (
              <div className="space-y-3">
                {refills.map((refill) => (
                  <div key={refill.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Refill #{refill.refill_number}</p>
                        <p className="text-xs text-gray-600">
                          {formatDateTime(refill.refill_date)}
                        </p>
                        <p className="text-xs text-gray-600">
                          Quantity: {refill.quantity_dispensed}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Dispensed</p>
                        <p className="text-xs text-gray-600">
                          {refill.pharmacy_name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PillsIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No refills yet</p>
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

      {/* Dispense Form Modal */}
      {showDispenseForm && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispense Prescription</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity to Dispense</label>
                <input
                  type="number"
                  min="1"
                  max={selectedPrescription.quantity}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quantity"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pharmacy Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter pharmacy name"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <GradientButton
                onClick={() => setShowDispenseForm(false)}
                className="flex-1"
              >
                Cancel
              </GradientButton>
              <GradientButton
                onClick={() => {
                  // Handle dispense logic here
                  setShowDispenseForm(false);
                }}
                className="flex-1"
              >
                Dispense
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlledPrescriptions;
