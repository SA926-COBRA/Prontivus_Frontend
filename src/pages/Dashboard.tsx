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
  X,
  Video,
  Brain,
  FileCheck,
  Settings,
  Zap,
  Shield,
  Pill,
  Monitor
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
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
        window.location.href = '/secretaria/agenda';
        break;
      case 'telemedicine':
        window.location.href = '/telemedicine';
        break;
      case 'ai-integration':
        window.location.href = '/ai-integration';
        break;
      case 'digital-prescription':
        window.location.href = '/digital-prescription';
        break;
      case 'tiss':
        window.location.href = '/tiss/dashboard';
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleRemoveTask = async (taskId: number) => {
    try {
      await apiService.delete(`/api/v1/dashboard/tasks/${taskId}`);
      setPendingTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-500">Carregando dados do dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Visão geral da sua clínica</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button asChild>
              <Link to="/agenda/novo">
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/pacientes/novo">
                <Users className="w-4 h-4 mr-2" />
                Novo Paciente
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Consultas Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.todayAppointments || 0}</p>
                  <p className="text-xs text-gray-500">Agendadas para hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pacientes Aguardando</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.waitingPatients || 0}</p>
                  <p className="text-xs text-gray-500">Na fila de atendimento</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tarefas Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
                  <p className="text-xs text-gray-500">Requerem atenção</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receita Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {financialData?.todayRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </p>
                  <p className="text-xs text-gray-500">Valor arrecadado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Appointments */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Consultas de Hoje</CardTitle>
                <Button variant="outline" size="sm" asChild>
              <Link to="/agenda">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todas
              </Link>
                </Button>
          </div>
              <CardDescription>Próximas consultas agendadas para hoje</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <div className="text-right">
                        <p className="font-medium text-gray-900">{appointment.time}</p>
                        <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                          {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                      </Badge>
                      </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma consulta agendada para hoje</p>
              </div>
            )}
          </div>
            </CardContent>
          </Card>

        {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Tarefas Pendentes</CardTitle>
              <CardDescription>Tarefas que requerem atenção</CardDescription>
            </CardHeader>
            <CardContent>
          <div className="space-y-3">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-500">{task.description}</p>
                        </div>
                  </div>
                      <Button
                        variant="ghost"
                    size="sm"
                        onClick={() => handleRemoveTask(task.id)}
                        className="text-red-600 hover:text-red-700"
                  >
                        <X className="w-4 h-4" />
                      </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">Todas as tarefas concluídas!</p>
              </div>
            )}
          </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>Informações financeiras do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                    R$ {financialData?.todayRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </p>
                  <p className="text-sm text-gray-600">Receita Hoje</p>
            </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                    R$ {financialData?.monthlyRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </p>
                  <p className="text-sm text-gray-600">Receita Mensal</p>
            </div>
          </div>
            </CardContent>
          </Card>

        {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent>
          <div className="space-y-2">
                <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-blue-50" 
              onClick={() => handleQuickAction('checkin')}
            >
              <Users className="w-4 h-4 mr-2" />
                  Check-in Pacientes
                </Button>
                <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-blue-50" 
              onClick={() => handleQuickAction('consultation')}
            >
              <Stethoscope className="w-4 h-4 mr-2" />
                  Nova Consulta
                </Button>
                <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-blue-50" 
              onClick={() => handleQuickAction('billing')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Faturamento
                </Button>
                <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-blue-50" 
              onClick={() => handleQuickAction('reports')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Relatórios
                </Button>
                <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-blue-50" 
              onClick={() => handleQuickAction('patients')}
            >
              <Users className="w-4 h-4 mr-2" />
              Lista de Pacientes
                </Button>
                <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-blue-50" 
              onClick={() => handleQuickAction('agenda')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agenda Completa
                </Button>
                
                {/* New Features Quick Actions */}
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Novas Funcionalidades</p>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-purple-50" 
                    onClick={() => handleQuickAction('telemedicine')}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Telemedicina
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-green-50" 
                    onClick={() => handleQuickAction('ai-integration')}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    IA Médica
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-orange-50" 
                    onClick={() => handleQuickAction('digital-prescription')}
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Receita Digital
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-blue-50" 
                    onClick={() => handleQuickAction('tiss')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    TISS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Features Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
            {/* Telemedicine Widget */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-600" />
                    Telemedicina
                  </CardTitle>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Novo
                  </Badge>
                </div>
                <CardDescription>Consultas por vídeo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sessões Ativas</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-purple-600">3</span>
                      <Badge variant="destructive" className="text-xs">2</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hoje</span>
                    <span className="font-semibold">5 consultas</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleQuickAction('telemedicine')}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Acessar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Integration Widget */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-green-600" />
                    IA Médica
                  </CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Novo
                  </Badge>
                </div>
                <CardDescription>Análise inteligente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Análises Hoje</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-600">12</span>
                      <Badge variant="destructive" className="text-xs">1</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Precisão</span>
                    <span className="font-semibold">94.2%</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleQuickAction('ai-integration')}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Acessar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Digital Prescription Widget */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-orange-600" />
                    Receita Digital
                  </CardTitle>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    Novo
                  </Badge>
                </div>
                <CardDescription>Assinatura digital</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Receitas Hoje</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-600">8</span>
                      <Badge variant="destructive" className="text-xs">3</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Assinadas</span>
                    <span className="font-semibold">6</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={() => handleQuickAction('digital-prescription')}
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Acessar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* TISS Widget */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    TISS
                  </CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Novo
                  </Badge>
                </div>
                <CardDescription>Integração operadoras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Operadoras</span>
                    <span className="font-semibold text-blue-600">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Ativo
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleQuickAction('tiss')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Acessar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;