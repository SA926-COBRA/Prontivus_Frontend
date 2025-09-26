import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CurrencyDollarIcon, 
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { ModernCard, GradientButton, AnimatedCounter, StatusIndicator, LoadingSpinner } from '../components/ui/ModernComponents';
import { financialTISSApiService, FinancialSummary, TISSProcedure, Invoice, Payment } from '../lib/financialTISSApi';

interface FinancialDashboardProps {
  className?: string;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ className = '' }) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'procedures' | 'invoices' | 'payments'>('overview');
  const [searchFilters, setSearchFilters] = useState({
    patient_id: '',
    doctor_id: '',
    status: '',
    date_from: '',
    date_to: ''
  });
  const queryClient = useQueryClient();

  // Fetch financial summary
  const { data: financialSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => financialTISSApiService.getFinancialSummary(),
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch TISS procedures
  const { data: procedures, isLoading: proceduresLoading } = useQuery({
    queryKey: ['tiss-procedures', searchFilters],
    queryFn: () => financialTISSApiService.getTISSProcedures({
      patient_id: searchFilters.patient_id ? parseInt(searchFilters.patient_id) : undefined,
      doctor_id: searchFilters.doctor_id ? parseInt(searchFilters.doctor_id) : undefined,
      status: searchFilters.status || undefined,
      date_from: searchFilters.date_from || undefined,
      date_to: searchFilters.date_to || undefined,
      limit: 100
    }),
  });

  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', searchFilters],
    queryFn: () => financialTISSApiService.getInvoices({
      patient_id: searchFilters.patient_id ? parseInt(searchFilters.patient_id) : undefined,
      status: searchFilters.status || undefined,
      date_from: searchFilters.date_from || undefined,
      date_to: searchFilters.date_to || undefined,
      limit: 100
    }),
  });

  // Fetch payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', searchFilters],
    queryFn: () => financialTISSApiService.getPayments({
      patient_id: searchFilters.patient_id ? parseInt(searchFilters.patient_id) : undefined,
      date_from: searchFilters.date_from || undefined,
      date_to: searchFilters.date_to || undefined,
      limit: 100
    }),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
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
          <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600">Manage TISS procedures, invoices, and payments</p>
        </div>
        
        <div className="flex items-center gap-2">
          <GradientButton
            onClick={() => setSelectedTab('procedures')}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Procedure
          </GradientButton>
        </div>
      </div>

      {/* Summary Cards */}
      {financialSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <AnimatedCounter
                  value={financialSummary.total_revenue}
                  className="text-2xl font-bold text-gray-900"
                  prefix="R$ "
                />
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <AnimatedCounter
                  value={financialSummary.total_payments}
                  className="text-2xl font-bold text-gray-900"
                  prefix="R$ "
                />
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <AnimatedCounter
                  value={financialSummary.total_outstanding}
                  className="text-2xl font-bold text-gray-900"
                  prefix="R$ "
                />
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Procedures</p>
                <AnimatedCounter
                  value={financialSummary.total_procedures}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
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
            { id: 'procedures', name: 'Procedures', icon: DocumentTextIcon },
            { id: 'invoices', name: 'Invoices', icon: CurrencyDollarIcon },
            { id: 'payments', name: 'Payments', icon: CheckCircleIcon }
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
              <option value="paid">Paid</option>
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
          {/* Revenue by Category */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
            {financialSummary && Object.keys(financialSummary.revenue_by_category).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(financialSummary.revenue_by_category).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{category.replace('_', ' ')}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No revenue data available</p>
              </div>
            )}
          </ModernCard>

          {/* Payments by Method */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payments by Method</h3>
            {financialSummary && Object.keys(financialSummary.payments_by_method).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(financialSummary.payments_by_method).map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{method}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No payment data available</p>
              </div>
            )}
          </ModernCard>
        </div>
      )}

      {selectedTab === 'procedures' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">TISS Procedures</h3>
            <StatusIndicator status="info" />
          </div>
          
          {proceduresLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : procedures && procedures.length > 0 ? (
            <div className="space-y-3">
              {procedures.map((procedure) => (
                <div key={procedure.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{procedure.procedure_number}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(procedure.status)}`}>
                          {procedure.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(procedure.payment_status)}`}>
                          {procedure.payment_status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Patient: {procedure.patient_id} • Doctor: {procedure.doctor_id}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        {procedure.medical_indication}
                      </p>
                      
                      <p className="text-sm text-gray-600">
                        {formatDateTime(procedure.procedure_date)} • {formatCurrency(procedure.final_value)}
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
              <p>No procedures found</p>
            </div>
          )}
        </ModernCard>
      )}

      {selectedTab === 'invoices' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
            <StatusIndicator status="info" />
          </div>
          
          {invoicesLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : invoices && invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{invoice.invoice_number}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.payment_status)}`}>
                          {invoice.payment_status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Patient: {invoice.patient_id} • Procedure: {invoice.procedure_id}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Due: {formatDate(invoice.due_date)}
                      </p>
                      
                      <p className="text-sm text-gray-600">
                        {formatCurrency(invoice.total_amount)} • Paid: {formatCurrency(invoice.paid_amount)}
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
              <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No invoices found</p>
            </div>
          )}
        </ModernCard>
      )}

      {selectedTab === 'payments' && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
            <StatusIndicator status="info" />
          </div>
          
          {paymentsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : payments && payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{payment.payment_number}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Patient: {payment.patient_id} • Invoice: {payment.invoice_id}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Method: {payment.payment_method}
                      </p>
                      
                      <p className="text-sm text-gray-600">
                        {formatDateTime(payment.payment_date)} • {formatCurrency(payment.amount)}
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
              <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No payments found</p>
            </div>
          )}
        </ModernCard>
      )}
    </div>
  );
};

export default FinancialDashboard;