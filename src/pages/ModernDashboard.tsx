import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  FileText,
  Stethoscope,
  Heart
} from 'lucide-react';
import { ModernLayout, ModernSidebar, ModernPageHeader, ModernStatsGrid } from '@/components/layout/ModernLayout';
import { ModernCard, GradientButton, AnimatedCounter, ProgressRing } from '@/components/ui/ModernComponents';
import { apiService } from '@/lib/api';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  monthlyRevenue: number;
  activeStaff: number;
  completedAppointments: number;
  pendingAppointments: number;
  averageWaitTime: number;
  patientSatisfaction: number;
}

const ModernDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    activeStaff: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    averageWaitTime: 0,
    patientSatisfaction: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');

  // Mock data for demonstration
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalPatients: 1247,
          todayAppointments: 23,
          monthlyRevenue: 45680,
          activeStaff: 12,
          completedAppointments: 18,
          pendingAppointments: 5,
          averageWaitTime: 15,
          patientSatisfaction: 87
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

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
      badge: 3
    },
    {
      id: 'appointments',
      label: 'Agendamentos',
      icon: <Calendar className="h-4 w-4" />,
      href: '/secretaria/agenda',
      badge: 5
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

  const mainStats = [
    {
      title: 'Total de Pacientes',
      value: <AnimatedCounter value={stats.totalPatients} />,
      change: 12,
      changeType: 'positive' as const,
      icon: <Users className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'Consultas Hoje',
      value: <AnimatedCounter value={stats.todayAppointments} />,
      change: -3,
      changeType: 'negative' as const,
      icon: <Calendar className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${stats.monthlyRevenue.toLocaleString()}`,
      change: 8,
      changeType: 'positive' as const,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'yellow' as const
    },
    {
      title: 'Equipe Ativa',
      value: <AnimatedCounter value={stats.activeStaff} />,
      change: 0,
      changeType: 'neutral' as const,
      icon: <UserCheck className="h-6 w-6" />,
      color: 'purple' as const
    }
  ];

  const quickActions = [
    {
      title: 'Novo Agendamento',
      description: 'Agendar consulta para paciente',
      icon: <Calendar className="h-8 w-8" />,
      color: 'from-blue-500 to-blue-600',
      href: '/secretaria/agenda'
    },
    {
      title: 'Cadastrar Paciente',
      description: 'Registrar novo paciente',
      icon: <Users className="h-8 w-8" />,
      color: 'from-green-500 to-green-600',
      href: '/secretaria/cadastro-paciente'
    },
    {
      title: 'Check-in',
      description: 'Registrar chegada do paciente',
      icon: <CheckCircle className="h-8 w-8" />,
      color: 'from-yellow-500 to-yellow-600',
      href: '/secretaria/checkin'
    },
    {
      title: 'Relatórios',
      description: 'Gerar relatórios do sistema',
      icon: <FileText className="h-8 w-8" />,
      color: 'from-purple-500 to-purple-600',
      href: '/relatorios'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'appointment',
      title: 'Consulta agendada',
      description: 'Dr. Silva - Paciente João Santos',
      time: '10:30',
      status: 'completed'
    },
    {
      id: 2,
      type: 'patient',
      title: 'Novo paciente cadastrado',
      description: 'Maria Oliveira',
      time: '09:15',
      status: 'completed'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Pagamento recebido',
      description: 'R$ 150,00 - Consulta',
      time: '08:45',
      status: 'completed'
    },
    {
      id: 4,
      type: 'appointment',
      title: 'Consulta cancelada',
      description: 'Dr. Costa - Paciente Ana Lima',
      time: '08:20',
      status: 'cancelled'
    }
  ];

  if (loading) {
    return (
      <ModernLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout
      title="Dashboard"
      subtitle="Visão geral do sistema médico"
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
        subtitle="Bem-vindo ao Prontivus - Sistema de Gestão Médica"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Dashboard' }
        ]}
        actions={
          <GradientButton variant="primary">
            <Calendar className="h-4 w-4 mr-2" />
            Novo Agendamento
          </GradientButton>
        }
      />

      {/* Main Stats Grid */}
      <ModernStatsGrid stats={mainStats} className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <ModernCard variant="elevated">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="w-full p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} text-white`}>
                      {action.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ModernCard>
        </div>

        {/* Performance Metrics */}
        <div className="lg:col-span-2">
          <ModernCard variant="elevated">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Métricas de Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <ProgressRing
                  progress={stats.patientSatisfaction}
                  size={120}
                  color="#10b981"
                  className="mx-auto mb-4"
                />
                <h4 className="font-medium text-gray-900">Satisfação do Paciente</h4>
                <p className="text-sm text-gray-500">Baseado em avaliações</p>
              </div>
              <div className="text-center">
                <ProgressRing
                  progress={75}
                  size={120}
                  color="#3b82f6"
                  className="mx-auto mb-4"
                />
                <h4 className="font-medium text-gray-900">Taxa de Ocupação</h4>
                <p className="text-sm text-gray-500">Consultórios hoje</p>
              </div>
            </div>
          </ModernCard>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mt-8">
        <ModernCard variant="elevated">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className={`p-2 rounded-full ${
                  activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                  activity.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {activity.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                   activity.status === 'cancelled' ? <AlertCircle className="h-4 w-4" /> :
                   <Clock className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <div className="text-sm text-gray-400">{activity.time}</div>
              </div>
            ))}
          </div>
        </ModernCard>
      </div>
    </ModernLayout>
  );
};

export default ModernDashboard;
