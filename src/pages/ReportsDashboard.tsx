import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Plus, 
  Eye, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Settings,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';
import { ModernLayout, ModernSidebar, ModernPageHeader, ModernStatsGrid } from '@/components/layout/ModernLayout';
import { ModernCard, GradientButton, AnimatedCounter, ProgressRing, LoadingSpinner } from '@/components/ui/ModernComponents';
import { reportsApiService, GeneratedReport, ReportTemplate, ReportDashboardStats } from '@/lib/reportsApi';

const ReportsDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<ReportDashboardStats | null>(null);
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [stats, reports, templatesData] = await Promise.all([
        reportsApiService.getReportDashboard(),
        reportsApiService.getReports({ limit: 10 }),
        reportsApiService.getTemplates({ is_active: true })
      ]);

      setDashboardStats(stats);
      setRecentReports(reports);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading reports dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Activity className="h-4 w-4" />,
      href: '/reports'
    },
    {
      id: 'templates',
      label: 'Modelos',
      icon: <FileText className="h-4 w-4" />,
      href: '/reports/templates'
    },
    {
      id: 'generate',
      label: 'Gerar Relatório',
      icon: <Plus className="h-4 w-4" />,
      href: '/reports/generate'
    },
    {
      id: 'my-reports',
      label: 'Meus Relatórios',
      icon: <Eye className="h-4 w-4" />,
      href: '/reports/my-reports'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      href: '/reports/analytics'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings className="h-4 w-4" />,
      href: '/reports/settings'
    }
  ];

  const mainStats = [
    {
      title: 'Total de Modelos',
      value: <AnimatedCounter value={dashboardStats?.total_templates || 0} />,
      change: 2,
      changeType: 'positive' as const,
      icon: <FileText className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'Relatórios Hoje',
      value: <AnimatedCounter value={dashboardStats?.completed_reports_today || 0} />,
      change: 15,
      changeType: 'positive' as const,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Pendentes',
      value: <AnimatedCounter value={dashboardStats?.pending_reports || 0} />,
      change: -3,
      changeType: 'negative' as const,
      icon: <Clock className="h-6 w-6" />,
      color: 'yellow' as const
    },
    {
      title: 'Downloads Hoje',
      value: <AnimatedCounter value={dashboardStats?.total_downloads_today || 0} />,
      change: 8,
      changeType: 'positive' as const,
      icon: <Download className="h-6 w-6" />,
      color: 'purple' as const
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'generating':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'expired':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'generating':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'excel':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'csv':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'html':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'clinical':
        return 'Clínico';
      case 'financial':
        return 'Financeiro';
      case 'administrative':
        return 'Administrativo';
      case 'commercial':
        return 'Comercial';
      case 'audit':
        return 'Auditoria';
      case 'custom':
        return 'Personalizado';
      default:
        return type;
    }
  };

  const handleDownloadReport = async (report: GeneratedReport) => {
    try {
      await reportsApiService.downloadReportFile(report);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
      try {
        await reportsApiService.deleteReport(reportId);
        await loadDashboardData();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  if (loading) {
    return (
      <ModernLayout title="Sistema de Relatórios">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout
      title="Sistema de Relatórios"
      subtitle="Geração e gestão de relatórios em PDF, Excel e outros formatos"
      sidebar={
        <ModernSidebar
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={setActiveSidebarItem}
        />
      }
    >
      <ModernPageHeader
        title="Dashboard de Relatórios"
        subtitle="Visão geral do sistema de relatórios e geração de documentos"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Relatórios' }
        ]}
        actions={
          <div className="flex items-center space-x-2">
            <GradientButton variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Gerar Relatório
            </GradientButton>
            <GradientButton variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Modelos
            </GradientButton>
          </div>
        }
      />

      {/* Main Stats Grid */}
      <ModernStatsGrid stats={mainStats} className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <ModernCard variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Relatórios Recentes</h3>
            <GradientButton variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver Todos
            </GradientButton>
          </div>
          
          <div className="space-y-3">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getFormatIcon(report.report_format)}
                      <div>
                        <p className="font-medium text-gray-900">{report.report_number}</p>
                        <p className="text-sm text-gray-500">{getTypeLabel(report.report_type)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {report.status === 'completed' && (
                      <GradientButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <Download className="h-4 w-4" />
                      </GradientButton>
                    )}
                    <GradientButton
                      variant="outline"
                      size="sm"
                      onClick={() => {/* View report details */}}
                    >
                      <Eye className="h-4 w-4" />
                    </GradientButton>
                    <GradientButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </GradientButton>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum relatório recente</p>
              </div>
            )}
          </div>
        </ModernCard>

        {/* Report Templates */}
        <ModernCard variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Modelos Disponíveis</h3>
            <GradientButton variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar
            </GradientButton>
          </div>
          
          <div className="space-y-3">
            {templates.length > 0 ? (
              templates.slice(0, 5).map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{template.name}</p>
                      <p className="text-sm text-gray-500">{getTypeLabel(template.report_type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GradientButton
                      variant="outline"
                      size="sm"
                      onClick={() => {/* Generate report with this template */}}
                    >
                      <Plus className="h-4 w-4" />
                    </GradientButton>
                    <GradientButton
                      variant="outline"
                      size="sm"
                      onClick={() => {/* View template details */}}
                    >
                      <Eye className="h-4 w-4" />
                    </GradientButton>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum modelo disponível</p>
              </div>
            )}
          </div>
        </ModernCard>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <ModernCard variant="elevated">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GradientButton
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => {/* Generate clinical report */}}
            >
              <Activity className="h-6 w-6" />
              <span>Relatório Clínico</span>
            </GradientButton>
            
            <GradientButton
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => {/* Generate financial report */}}
            >
              <DollarSign className="h-6 w-6" />
              <span>Relatório Financeiro</span>
            </GradientButton>
            
            <GradientButton
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => {/* Generate commercial report */}}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Relatório Comercial</span>
            </GradientButton>
            
            <GradientButton
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => {/* Generate administrative report */}}
            >
              <Users className="h-6 w-6" />
              <span>Relatório Administrativo</span>
            </GradientButton>
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
                progress={85}
                size={120}
                color="#10b981"
                className="mx-auto mb-4"
              />
              <h4 className="font-medium text-gray-900">Taxa de Sucesso</h4>
              <p className="text-sm text-gray-500">Geração de relatórios</p>
            </div>
            <div className="text-center">
              <ProgressRing
                progress={92}
                size={120}
                color="#3b82f6"
                className="mx-auto mb-4"
              />
              <h4 className="font-medium text-gray-900">Satisfação</h4>
              <p className="text-sm text-gray-500">Qualidade dos relatórios</p>
            </div>
            <div className="text-center">
              <ProgressRing
                progress={78}
                size={120}
                color="#f59e0b"
                className="mx-auto mb-4"
              />
              <h4 className="font-medium text-gray-900">Eficiência</h4>
              <p className="text-sm text-gray-500">Tempo de geração</p>
            </div>
          </div>
        </ModernCard>
      </div>
    </ModernLayout>
  );
};

export default ReportsDashboard;
