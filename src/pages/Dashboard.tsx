import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Plus,
  Eye,
  FileText,
  Stethoscope,
  Loader2,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';
import { ModernLayout, ModernSidebar, ModernPageHeader, ModernStatsGrid } from '@/components/layout/ModernLayout';
import { ModernCard, GradientButton, AnimatedCounter, ProgressRing } from '@/components/ui/ModernComponents';
import { dashboardApi, DashboardMetrics, Appointment, PendingTask, FinancialSummary } from '@/lib/dashboardApi';
import { apiService } from '@/lib/api';

const Dashboard = () => {
  // State for dashboard data
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [financialData, setFinancialData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [metricsData, appointmentsData, tasksData, financialData] = await Promise.all([
        dashboardApi.getDashboardMetrics(),
        dashboardApi.getTodayAppointments(),
        dashboardApi.getPendingTasks(),
        dashboardApi.getFinancialSummary()
      ]);

      setMetrics(metricsData);
      setTodayAppointments(appointmentsData);
      setPendingTasks(tasksData);
      setFinancialData(financialData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'checkin':
        window.location.href = '/secretaria';
        break;
      case 'consultation':
        window.location.href = '/atendimento';
        break;
      case 'billing':
        window.location.href = '/financeiro';
        break;
      case 'reports':
        window.location.href = '/relatorios';
        break;
      case 'patients':
        window.location.href = '/secretaria/pacientes';
        break;
      case 'agenda':
        window.location.href = '/agenda';
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      // Update appointment status to cancelled instead of deleting
      await apiService.updateAppointmentStatus(appointmentId, 'cancelled');
      
      // Remove from local state
      setTodayAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      
      // Refresh dashboard data
      await loadDashboardData();
      
      console.log(`Appointment ${appointmentId} cancelled successfully`);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      // Remove task from local state
      setPendingTasks(prev => prev.filter(task => task.id !== taskId));
      
      console.log(`Task ${taskId} removed successfully`);
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  // Sidebar configuration
  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Activity className="h-4 w-4" />,
      href: '/dashboard'
    },
    {
      id: 'patients',
      label: 'Pacientes',
      icon: <Users className="h-4 w-4" />,
      href: '/secretaria/pacientes',
      badge: pendingTasks.length
    },
    {
      id: 'appointments',
      label: 'Agendamentos',
      icon: <Calendar className="h-4 w-4" />,
      href: '/secretaria/agenda',
      badge: todayAppointments.length
    },
    {
      id: 'medical',
      label: 'Atendimento',
      icon: <Stethoscope className="h-4 w-4" />,
      href: '/atendimento'
    },
    {
      id: 'financial',
      label: 'Financeiro',
      icon: <DollarSign className="h-4 w-4" />,
      href: '/financeiro'
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: <FileText className="h-4 w-4" />,
      href: '/relatorios'
    }
  ];

  // Main stats for the modern grid
  const mainStats = [
    {
      title: 'Consultas Hoje',
      value: <AnimatedCounter value={metrics?.todayAppointments || 0} />,
      change: 12,
      changeType: 'positive' as const,
      icon: <Calendar className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'Pacientes Aguardando',
      value: <AnimatedCounter value={metrics?.waitingPatients || 0} />,
      change: -3,
      changeType: 'negative' as const,
      icon: <Clock className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Receita Hoje',
      value: `R$ ${(financialData?.todayRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: 8,
      changeType: 'positive' as const,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'yellow' as const
    },
    {
      title: 'Taxa de Ocupação',
      value: `${metrics?.occupancyRate || 0}%`,
      change: 0,
      changeType: 'neutral' as const,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'purple' as const
    }
  ];

  // Show loading state
  if (loading) {
    return (
      <ModernLayout title="Dashboard" subtitle="Carregando dados...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-500">Carregando dados do dashboard...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <ModernLayout title="Dashboard" subtitle="Erro ao carregar dados">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <GradientButton onClick={handleRefresh} variant="primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </GradientButton>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout
      title="Dashboard"
      subtitle="Visão geral da sua clínica"
      sidebar={
        <ModernSidebar
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={setActiveSidebarItem}
        />
      }
    >
      <ModernPageHeader
        title="Dashboard"
        subtitle={`Visão geral da sua clínica - ${new Date().toLocaleDateString('pt-BR')}`}
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Dashboard' }
        ]}
        actions={
          <div className="flex items-center space-x-2">
            <GradientButton onClick={handleRefresh} variant="secondary" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </GradientButton>
            <GradientButton asChild>
              <Link to="/agenda/novo">
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Link>
            </GradientButton>
            <GradientButton variant="outline" asChild>
              <Link to="/pacientes/novo">
                <Users className="w-4 h-4 mr-2" />
                Novo Paciente
              </Link>
            </GradientButton>
          </div>
        }
      />

      {/* Key Metrics */}
      <ModernStatsGrid stats={mainStats} className="mb-8" />

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Appointments */}
        <ModernCard variant="elevated" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Consultas de Hoje</h3>
            <GradientButton variant="outline" size="sm" asChild>
              <Link to="/agenda">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todas
              </Link>
            </GradientButton>
          </div>
          <p className="text-sm text-gray-500 mb-4">Próximas consultas agendadas para hoje</p>
          
          <div className="space-y-4">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patient_name}</p>
                      <p className="text-sm text-gray-500">{appointment.doctor_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{appointment.appointment_time}</p>
                      <Badge 
                        variant={
                          appointment.status === 'confirmed' ? 'default' : 
                          appointment.status === 'waiting' ? 'secondary' :
                          appointment.status === 'completed' ? 'default' :
                          'destructive'
                        }
                        className="text-xs"
                      >
                        {appointment.status === 'confirmed' ? 'Confirmada' : 
                         appointment.status === 'waiting' ? 'Aguardando' :
                         appointment.status === 'completed' ? 'Concluída' :
                         appointment.status === 'cancelled' ? 'Cancelada' :
                         'Agendada'}
                      </Badge>
                    </div>
                    <GradientButton
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      title="Cancelar consulta"
                    >
                      <X className="w-4 h-4" />
                    </GradientButton>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma consulta agendada para hoje</p>
              </div>
            )}
          </div>
        </ModernCard>

        {/* Pending Tasks */}
        <ModernCard variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tarefas Pendentes</h3>
            <Badge variant="destructive">{pendingTasks.length}</Badge>
          </div>
          <p className="text-sm text-gray-500 mb-4">Ações que precisam de atenção</p>
          
          <div className="space-y-3">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    task.priority === 'high' ? 'bg-red-500' : 
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {task.type === 'insurance' ? 'Verificação de Convênio' :
                       task.type === 'exams' ? 'Exames' : 
                       task.type === 'consultation' ? 'Consulta' :
                       task.type === 'billing' ? 'Faturamento' : 'Outros'}
                    </p>
                    {task.patient_name && (
                      <p className="text-xs text-blue-600">{task.patient_name}</p>
                    )}
                  </div>
                  <GradientButton
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Remover tarefa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </GradientButton>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma tarefa pendente</p>
              </div>
            )}
          </div>
          
          <GradientButton 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
            onClick={() => handleQuickAction('reports')}
          >
            Ver Todas as Tarefas
          </GradientButton>
        </ModernCard>

        {/* Revenue Snapshot */}
        <ModernCard variant="elevated" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Resumo Financeiro</h3>
              <p className="text-sm text-gray-500">Receita e despesas do mês atual</p>
            </div>
            <GradientButton 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </GradientButton>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border border-gray-200 rounded-lg bg-green-50">
              <p className="text-2xl font-bold text-green-600">
                R$ {(financialData?.monthlyRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500">Receita Mensal</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg bg-red-50">
              <p className="text-2xl font-bold text-red-600">
                R$ {(financialData?.monthlyExpenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500">Despesas</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg bg-blue-50">
              <p className="text-2xl font-bold text-blue-600">
                R$ {(financialData?.netProfit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500">Lucro Líquido</p>
            </div>
          </div>
          
          {/* Additional financial info */}
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div className="text-center p-3 border border-gray-200 rounded-lg bg-yellow-50">
              <p className="text-lg font-bold text-yellow-600">
                R$ {(financialData?.pendingPayments || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500">Pagamentos Pendentes</p>
            </div>
            <div className="text-center p-3 border border-gray-200 rounded-lg bg-red-50">
              <p className="text-lg font-bold text-red-600">
                R$ {(financialData?.overduePayments || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500">Pagamentos Vencidos</p>
            </div>
          </div>
          
          <div className="mt-4">
            <GradientButton variant="outline" size="sm" asChild>
              <Link to="/financeiro">
                <FileText className="w-4 h-4 mr-2" />
                Ver Relatório Completo
              </Link>
            </GradientButton>
          </div>
        </ModernCard>

        {/* Quick Actions */}
        <ModernCard variant="elevated">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <p className="text-sm text-gray-500 mb-4">Acesso rápido às principais funcionalidades</p>
          
          <div className="space-y-2">
            <GradientButton 
              variant="outline" 
              className="w-full justify-start hover:bg-blue-50" 
              onClick={() => handleQuickAction('checkin')}
            >
              <Users className="w-4 h-4 mr-2" />
              Check-in Paciente
            </GradientButton>
            <GradientButton 
              variant="outline" 
              className="w-full justify-start hover:bg-blue-50" 
              onClick={() => handleQuickAction('consultation')}
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              Iniciar Consulta
            </GradientButton>
            <GradientButton 
              variant="outline" 
              className="w-full justify-start hover:bg-blue-50" 
              onClick={() => handleQuickAction('billing')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Faturamento
            </GradientButton>
            <GradientButton 
              variant="outline" 
              className="w-full justify-start hover:bg-blue-50" 
              onClick={() => handleQuickAction('reports')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Relatórios
            </GradientButton>
            <GradientButton 
              variant="outline" 
              className="w-full justify-start hover:bg-blue-50" 
              onClick={() => handleQuickAction('patients')}
            >
              <Users className="w-4 h-4 mr-2" />
              Lista de Pacientes
            </GradientButton>
            <GradientButton 
              variant="outline" 
              className="w-full justify-start hover:bg-blue-50" 
              onClick={() => handleQuickAction('agenda')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agenda Completa
            </GradientButton>
          </div>
        </ModernCard>
      </div>
    </ModernLayout>
  );
};

export default Dashboard;
