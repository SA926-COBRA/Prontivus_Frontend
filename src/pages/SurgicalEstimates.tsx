import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  FileText,
  Filter,
  Download,
  Send
} from 'lucide-react';
import { ModernLayout, ModernSidebar, ModernPageHeader, ModernStatsGrid } from '@/components/layout/ModernLayout';
import { ModernCard, GradientButton, LoadingSpinner, AnimatedCounter } from '@/components/ui/ModernComponents';
import { commercialApiService, SurgicalEstimate } from '@/lib/commercialApi';

const SurgicalEstimates: React.FC = () => {
  const [estimates, setEstimates] = useState<SurgicalEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [activeSidebarItem, setActiveSidebarItem] = useState('estimates');

  useEffect(() => {
    loadEstimates();
  }, []);

  const loadEstimates = async () => {
    try {
      setLoading(true);
      const data = await commercialApiService.getEstimates({
        status: selectedStatus || undefined,
        // Add other filters as needed
      });
      setEstimates(data);
    } catch (error) {
      console.error('Error loading estimates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstimates();
  }, [selectedStatus, selectedPriority]);

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FileText className="h-4 w-4" />,
      href: '/commercial'
    },
    {
      id: 'procedures',
      label: 'Procedimentos',
      icon: <FileText className="h-4 w-4" />,
      href: '/commercial/procedures'
    },
    {
      id: 'estimates',
      label: 'Orçamentos',
      icon: <FileText className="h-4 w-4" />,
      href: '/commercial/estimates'
    },
    {
      id: 'contracts',
      label: 'Contratos',
      icon: <FileText className="h-4 w-4" />,
      href: '/commercial/contracts'
    },
    {
      id: 'packages',
      label: 'Pacotes',
      icon: <FileText className="h-4 w-4" />,
      href: '/commercial/packages'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <FileText className="h-4 w-4" />,
      href: '/commercial/analytics'
    }
  ];

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'draft', label: 'Rascunho' },
    { value: 'pending', label: 'Pendente' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'rejected', label: 'Rejeitado' },
    { value: 'expired', label: 'Expirado' },
    { value: 'converted', label: 'Convertido' }
  ];

  const priorityOptions = [
    { value: '', label: 'Todas as prioridades' },
    { value: 'low', label: 'Baixa' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'converted':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'rejected':
      case 'expired':
        return 'text-red-600 bg-red-50';
      case 'draft':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'converted':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      case 'draft':
        return <Edit className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'normal':
        return 'text-blue-600 bg-blue-50';
      case 'low':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  const handleApproveEstimate = async (id: number) => {
    try {
      await commercialApiService.approveEstimate(id);
      await loadEstimates();
    } catch (error) {
      console.error('Error approving estimate:', error);
    }
  };

  const handleRejectEstimate = async (id: number) => {
    const reason = window.prompt('Motivo da rejeição:');
    if (reason) {
      try {
        await commercialApiService.rejectEstimate(id, reason);
        await loadEstimates();
      } catch (error) {
        console.error('Error rejecting estimate:', error);
      }
    }
  };

  const filteredEstimates = estimates.filter(estimate => {
    const matchesSearch = !searchTerm || 
      estimate.estimate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimate.patient_id.toString().includes(searchTerm);
    
    const matchesPriority = !selectedPriority || estimate.priority === selectedPriority;
    
    return matchesSearch && matchesPriority;
  });

  const stats = [
    {
      title: 'Total de Orçamentos',
      value: <AnimatedCounter value={estimates.length} />,
      change: 12,
      changeType: 'positive' as const,
      icon: <FileText className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'Pendentes',
      value: <AnimatedCounter value={estimates.filter(e => e.status === 'pending').length} />,
      change: -3,
      changeType: 'negative' as const,
      icon: <Clock className="h-6 w-6" />,
      color: 'yellow' as const
    },
    {
      title: 'Aprovados',
      value: <AnimatedCounter value={estimates.filter(e => e.status === 'approved').length} />,
      change: 8,
      changeType: 'positive' as const,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Valor Total',
      value: `R$ ${estimates.reduce((sum, e) => sum + e.total_price, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: 15,
      changeType: 'positive' as const,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'purple' as const
    }
  ];

  return (
    <ModernLayout
      title="Orçamentos Cirúrgicos"
      subtitle="Gestão de orçamentos para procedimentos cirúrgicos"
      sidebar={
        <ModernSidebar
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={setActiveSidebarItem}
        />
      }
    >
      <ModernPageHeader
        title="Orçamentos Cirúrgicos"
        subtitle="Gestão completa de orçamentos para procedimentos"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Comercial', href: '/commercial' },
          { label: 'Orçamentos' }
        ]}
        actions={
          <GradientButton variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </GradientButton>
        }
      />

      {/* Stats Grid */}
      <ModernStatsGrid stats={stats} className="mb-6" />

      {/* Filters */}
      <ModernCard variant="elevated" className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar orçamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {priorityOptions.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>
      </ModernCard>

      {/* Estimates List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEstimates.map((estimate) => (
            <ModernCard key={estimate.id} variant="elevated" hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${getStatusColor(estimate.status)}`}>
                    {getStatusIcon(estimate.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{estimate.estimate_number}</h3>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(estimate.priority)}`}>
                        {getPriorityLabel(estimate.priority)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Paciente: {estimate.patient_id}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>Procedimento: {estimate.procedure_id}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {estimate.estimated_date 
                            ? new Date(estimate.estimated_date).toLocaleDateString('pt-BR')
                            : 'Não agendado'
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium text-green-600">
                          R$ {estimate.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {estimate.notes && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{estimate.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {estimate.status === 'pending' && (
                    <>
                      <GradientButton
                        variant="success"
                        size="sm"
                        onClick={() => handleApproveEstimate(estimate.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </GradientButton>
                      <GradientButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleRejectEstimate(estimate.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeitar
                      </GradientButton>
                    </>
                  )}
                  
                  <GradientButton
                    variant="outline"
                    size="sm"
                    onClick={() => {/* View estimate */}}
                  >
                    <Eye className="h-4 w-4" />
                  </GradientButton>
                  
                  <GradientButton
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Edit estimate */}}
                  >
                    <Edit className="h-4 w-4" />
                  </GradientButton>
                  
                  <GradientButton
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Download estimate */}}
                  >
                    <Download className="h-4 w-4" />
                  </GradientButton>
                  
                  <GradientButton
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Send estimate */}}
                  >
                    <Send className="h-4 w-4" />
                  </GradientButton>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>
      )}

      {!loading && filteredEstimates.length === 0 && (
        <ModernCard variant="elevated">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento encontrado</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedStatus || selectedPriority
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Comece criando seu primeiro orçamento'}
            </p>
            <GradientButton variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </GradientButton>
          </div>
        </ModernCard>
      )}
    </ModernLayout>
  );
};

export default SurgicalEstimates;
