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
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call - replace with actual API endpoint
      const mockStats: DashboardStats = {
        totalPatients: 1247,
        todayAppointments: 23,
        monthlyRevenue: 45680,
        activeStaff: 18,
        completedAppointments: 156,
        pendingAppointments: 8,
        averageWaitTime: 12,
        patientSatisfaction: 4.7
      };
      
      setStats(mockStats);
    } catch (err) {
      setError('Erro ao carregar estatísticas do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTime = (minutes: number) => {
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Moderno</h1>
            <p className="text-gray-600 mt-1">Visão geral moderna da clínica</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={loadDashboardStats} variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
              <AlertCircle className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Main Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPatients.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Registrados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Consultas Hoje</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
                    <p className="text-xs text-gray-500">Agendadas</p>
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
                    <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.monthlyRevenue)}
                    </p>
                    <p className="text-xs text-gray-500">Este mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Equipe Ativa</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeStaff}</p>
                    <p className="text-xs text-gray-500">Profissionais</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Secondary Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Concluídas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedAppointments}</p>
                    <p className="text-xs text-gray-500">Este mês</p>
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
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
                    <p className="text-xs text-gray-500">Aguardando</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatTime(stats.averageWaitTime)}
                    </p>
                    <p className="text-xs text-gray-500">Espera</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Satisfação</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.patientSatisfaction}</p>
                    <p className="text-xs text-gray-500">Avaliação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/pacientes/novo">
                  <Users className="w-6 h-6 mb-2" />
                  Novo Paciente
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/agenda/novo">
                  <Calendar className="w-6 h-6 mb-2" />
                  Nova Consulta
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/atendimento">
                  <Stethoscope className="w-6 h-6 mb-2" />
                  Atendimento
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/relatorios">
                  <FileText className="w-6 h-6 mb-2" />
                  Relatórios
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas atividades da clínica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Consulta concluída</p>
                  <p className="text-sm text-gray-500">Dr. Silva - Paciente João Silva</p>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">Concluída</Badge>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Nova consulta agendada</p>
                  <p className="text-sm text-gray-500">Dr. Santos - Paciente Maria Costa</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Agendada</Badge>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Users className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Novo paciente registrado</p>
                  <p className="text-sm text-gray-500">Ana Oliveira - Check-in realizado</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Registrado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ModernDashboard;