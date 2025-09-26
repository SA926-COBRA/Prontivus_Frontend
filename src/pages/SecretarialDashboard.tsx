import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  UserCheck, 
  Calendar,
  Activity,
  TrendingUp,
  Bell,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';

interface PatientQueueItem {
  id: number;
  patient_name: string;
  patient_id: number;
  appointment_id: number;
  check_in_time: string;
  estimated_wait_time: number;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  doctor_name?: string;
  appointment_type: string;
  insurance_status: string;
  notes?: string;
}

interface QueueStats {
  total_patients: number;
  waiting_patients: number;
  in_progress_patients: number;
  completed_today: number;
  average_wait_time: number;
  longest_wait_time: number;
  doctors_available: number;
  estimated_completion_time?: string;
}

interface DoctorSchedule {
  doctor_id: number;
  doctor_name: string;
  specialty: string;
  current_patient?: string;
  next_patient?: string;
  patients_remaining: number;
  estimated_end_time?: string;
  status: 'available' | 'busy' | 'break' | 'offline';
}

interface DashboardSummary {
  queue_stats: QueueStats;
  patient_queue: PatientQueueItem[];
  doctor_schedules: DoctorSchedule[];
  urgent_alerts: Array<{
    type: string;
    severity: string;
    message: string;
    patient_id: number;
    timestamp: string;
  }>;
  daily_metrics: {
    total_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    completion_rate: number;
    average_duration_minutes: number;
  };
}

const SecretarialDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const data = await apiService.getSecretarialDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(extractErrorMessage(err, 'Erro ao carregar dados do dashboard'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchDashboardData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const updatePatientStatus = async (checkinId: number, newStatus: string) => {
    try {
      await apiService.updatePatientStatus(checkinId, newStatus);
      await fetchDashboardData(); // Refresh data
    } catch (err: any) {
      console.error('Error updating patient status:', err);
      setError(extractErrorMessage(err, 'Erro ao atualizar status do paciente'));
    }
  };

  const updatePatientPriority = async (checkinId: number, priority: string) => {
    try {
      await apiService.updatePatientPriority(checkinId, priority);
      await fetchDashboardData(); // Refresh data
    } catch (err: any) {
      console.error('Error updating patient priority:', err);
      setError(extractErrorMessage(err, 'Erro ao atualizar prioridade do paciente'));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredQueue = dashboardData?.patient_queue.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Secretarial</h1>
          <p className="text-gray-600">Gerenciamento de fila de pacientes e agenda médica</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Urgent Alerts */}
      {dashboardData?.urgent_alerts && dashboardData.urgent_alerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <Bell className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Alertas Urgentes:</strong>
            <ul className="mt-2 space-y-1">
              {dashboardData.urgent_alerts.map((alert, index) => (
                <li key={index} className="text-sm">
                  {alert.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.queue_stats.total_patients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.queue_stats.waiting_patients || 0} aguardando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Atendimento</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.queue_stats.in_progress_patients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.queue_stats.doctors_available || 0} médicos disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Espera</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.queue_stats.average_wait_time || 0}min</div>
            <p className="text-xs text-muted-foreground">
              Máximo: {dashboardData?.queue_stats.longest_wait_time || 0}min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos Hoje</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.queue_stats.completed_today || 0}</div>
            <p className="text-xs text-muted-foreground">
              Taxa: {dashboardData?.daily_metrics.completion_rate || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Fila de Pacientes</TabsTrigger>
          <TabsTrigger value="doctors">Agenda Médica</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        {/* Patient Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="waiting">Aguardando</SelectItem>
                <SelectItem value="in_progress">Em Atendimento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="emergency">Emergência</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Patient Queue */}
          <div className="grid gap-4">
            {filteredQueue.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-lg">{patient.patient_name}</h3>
                        <p className="text-sm text-gray-600">
                          {patient.doctor_name && `Dr(a). ${patient.doctor_name}`}
                          {patient.appointment_type && ` • ${patient.appointment_type}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          Check-in: {formatTime(patient.check_in_time)}
                          {patient.estimated_wait_time > 0 && ` • Espera: ${patient.estimated_wait_time}min`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(patient.priority)}>
                        {patient.priority.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status === 'waiting' && 'Aguardando'}
                        {patient.status === 'in_progress' && 'Em Atendimento'}
                        {patient.status === 'completed' && 'Concluído'}
                        {patient.status === 'cancelled' && 'Cancelado'}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Select
                        value={patient.status}
                        onValueChange={(value) => updatePatientStatus(patient.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="waiting">Aguardando</SelectItem>
                          <SelectItem value="in_progress">Em Atendimento</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={patient.priority}
                        onValueChange={(value) => updatePatientPriority(patient.id, value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="emergency">Emergência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Doctors Schedule Tab */}
        <TabsContent value="doctors" className="space-y-4">
          <div className="grid gap-4">
            {dashboardData?.doctor_schedules.map((doctor) => (
              <Card key={doctor.doctor_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{doctor.doctor_name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      <p className="text-xs text-gray-500">
                        {doctor.patients_remaining} pacientes restantes
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        doctor.status === 'available' ? 'bg-green-100 text-green-800' :
                        doctor.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                        doctor.status === 'break' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {doctor.status === 'available' && 'Disponível'}
                        {doctor.status === 'busy' && 'Ocupado'}
                        {doctor.status === 'break' && 'Intervalo'}
                        {doctor.status === 'offline' && 'Offline'}
                      </Badge>
                      {doctor.estimated_end_time && (
                        <p className="text-xs text-gray-500 mt-1">
                          Fim estimado: {formatTime(doctor.estimated_end_time)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Métricas do Dia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total de Consultas:</span>
                  <span className="font-semibold">{dashboardData?.daily_metrics.total_appointments || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Consultas Concluídas:</span>
                  <span className="font-semibold">{dashboardData?.daily_metrics.completed_appointments || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Consultas Canceladas:</span>
                  <span className="font-semibold">{dashboardData?.daily_metrics.cancelled_appointments || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Conclusão:</span>
                  <span className="font-semibold">{dashboardData?.daily_metrics.completion_rate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Duração Média:</span>
                  <span className="font-semibold">{dashboardData?.daily_metrics.average_duration_minutes || 0}min</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Previsões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dashboardData?.queue_stats.estimated_completion_time ? (
                  <div className="flex justify-between">
                    <span>Conclusão Estimada:</span>
                    <span className="font-semibold">
                      {formatTime(dashboardData.queue_stats.estimated_completion_time)}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhuma previsão disponível</p>
                )}
                <div className="flex justify-between">
                  <span>Médicos Disponíveis:</span>
                  <span className="font-semibold">{dashboardData?.queue_stats.doctors_available || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo Médio de Espera:</span>
                  <span className="font-semibold">{dashboardData?.queue_stats.average_wait_time || 0}min</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecretarialDashboard;
