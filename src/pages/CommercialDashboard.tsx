import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  FileText, 
  Users, 
  DollarSign, 
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { ModernLayout, ModernSidebar, ModernPageHeader, ModernStatsGrid } from '@/components/layout/ModernLayout';
import { ModernCard, GradientButton, AnimatedCounter, ProgressRing } from '@/components/ui/ModernComponents';
import { commercialApiService, CommercialDashboardStats, SurgicalEstimate, SurgicalContract } from '@/lib/commercialApi';

const CommercialDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<CommercialDashboardStats | null>(null);
  const [recentEstimates, setRecentEstimates] = useState<SurgicalEstimate[]>([]);
  const [recentContracts, setRecentContracts] = useState<SurgicalContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [stats, estimates, contracts] = await Promise.all([
        commercialApiService.getCommercialDashboard(),
        commercialApiService.getActiveEstimates(),
        commercialApiService.getPendingContracts()
      ]);

      setDashboardStats(stats);
      setRecentEstimates(estimates.slice(0, 5));
      setRecentContracts(contracts.slice(0, 5));
    } catch (error) {
      console.error('Error loading commercial dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Activity className="h-4 w-4" />,
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
      icon: <TrendingUp className="h-4 w-4" />,
      href: '/commercial/estimates',
      badge: recentEstimates.length
    },
    {
      id: 'contracts',
      label: 'Contratos',
      icon: <Users className="h-4 w-4" />,
      href: '/commercial/contracts',
      badge: recentContracts.length
    },
    {
      id: 'packages',
      label: 'Pacotes',
      icon: <BarChart3 className="h-4 w-4" />,
      href: '/commercial/packages'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <PieChart className="h-4 w-4" />,
      href: '/commercial/analytics'
    }
  ];

  const mainStats = [
    {
      title: 'Total de Procedimentos',
      value: <AnimatedCounter value={dashboardStats?.total_procedures || 0} />,
      change: 8,
      changeType: 'positive' as const,
      icon: <FileText className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'Orçamentos Ativos',
      value: <AnimatedCounter value={dashboardStats?.active_estimates || 0} />,
      change: -2,
      changeType: 'negative' as const,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Contratos Pendentes',
      value: <AnimatedCounter value={dashboardStats?.pending_contracts || 0} />,
      change: 5,
      changeType: 'positive' as const,
      icon: <Users className="h-6 w-6" />,
      color: 'yellow' as const
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${(dashboardStats?.monthly_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: 12,
      changeType: 'positive' as const,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'purple' as const
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
      case 'pending_signature':
        return 'text-yellow-600 bg-yellow-50';
      case 'rejected':
      case 'cancelled':
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
      case 'active':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
      case 'pending_signature':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'draft':
        return <Edit className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <ModernLayout title="Módulo Comercial">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando dados comerciais...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout
      title="Módulo Comercial"
      subtitle="Gestão de procedimentos cirúrgicos, orçamentos e contratos"
      sidebar={
        <ModernSidebar
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={setActiveSidebarItem}
        />
      }
    >
      <ModernPageHeader
        title="Dashboard Comercial"
        subtitle="Visão geral do módulo comercial - Procedimentos cirúrgicos e contratos"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Comercial' }
        ]}
        actions={
          <div className="flex items-center space-x-2">
            <GradientButton variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </GradientButton>
            <GradientButton variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Novo Procedimento
            </GradientButton>
          </div>
        }
      />

      {/* Main Stats Grid */}
      <ModernStatsGrid stats={mainStats} className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Estimates */}
        <ModernCard variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Orçamentos Recentes</h3>
            <GradientButton variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver Todos
            </GradientButton>
          </div>
          
          <div className="space-y-3">
            {recentEstimates.length > 0 ? (
              recentEstimates.map((estimate) => (
                <div key={estimate.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(estimate.status)}`}>
                      {getStatusIcon(estimate.status)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{estimate.estimate_number}</p>
                      <p className="text-sm text-gray-500">Paciente ID: {estimate.patient_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">R$ {estimate.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-500 capitalize">{estimate.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum orçamento recente</p>
              </div>
            )}
          </div>
        </ModernCard>

        {/* Recent Contracts */}
        <ModernCard variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contratos Recentes</h3>
            <GradientButton variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver Todos
            </GradientButton>
          </div>
          
          <div className="space-y-3">
            {recentContracts.length > 0 ? (
              recentContracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(contract.status)}`}>
                      {getStatusIcon(contract.status)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{contract.contract_number}</p>
                      <p className="text-sm text-gray-500">Paciente ID: {contract.patient_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">R$ {contract.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-500 capitalize">{contract.status.replace('_', ' ')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum contrato recente</p>
              </div>
            )}
          </div>
        </ModernCard>
      </div>

      {/* Performance Metrics */}
      <div className="mt-8">
        <ModernCard variant="elevated">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Métricas de Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <ProgressRing
                progress={dashboardStats?.conversion_rate || 0}
                size={120}
                color="#10b981"
                className="mx-auto mb-4"
              />
              <h4 className="font-medium text-gray-900">Taxa de Conversão</h4>
              <p className="text-sm text-gray-500">Orçamentos para contratos</p>
            </div>
            <div className="text-center">
              <ProgressRing
                progress={75}
                size={120}
                color="#3b82f6"
                className="mx-auto mb-4"
              />
              <h4 className="font-medium text-gray-900">Taxa de Pagamento</h4>
              <p className="text-sm text-gray-500">Contratos pagos</p>
            </div>
            <div className="text-center">
              <ProgressRing
                progress={85}
                size={120}
                color="#f59e0b"
                className="mx-auto mb-4"
              />
              <h4 className="font-medium text-gray-900">Satisfação</h4>
              <p className="text-sm text-gray-500">Avaliação dos pacientes</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Top Procedures */}
      {dashboardStats?.top_procedures && dashboardStats.top_procedures.length > 0 && (
        <div className="mt-8">
          <ModernCard variant="elevated">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Procedimentos Mais Solicitados</h3>
            <div className="space-y-3">
              {dashboardStats.top_procedures.slice(0, 5).map((procedure, index) => (
                <div key={procedure.procedure_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{procedure.procedure_name}</p>
                      <p className="text-sm text-gray-500">{procedure.count} solicitações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">R$ {procedure.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-500">Receita</p>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>
      )}
    </ModernLayout>
  );
};

export default CommercialDashboard;
