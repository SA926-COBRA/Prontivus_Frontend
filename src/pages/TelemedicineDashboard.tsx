import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, Video, Mic, MicOff, Phone, PhoneOff, Monitor, FileText, Settings, BarChart3, Play, Pause, Square } from 'lucide-react';
import { telemedicineService, TelemedicineSession, TelemedicineAnalytics } from '@/lib/telemedicineService';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from 'sonner';

const TelemedicineDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
  const [analytics, setAnalytics] = useState<TelemedicineAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    loadSessions();
    loadAnalytics();
  }, [currentPage, statusFilter]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await telemedicineService.getSessions(params);
      setSessions(response.sessions);
      setTotalSessions(response.total);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Erro ao carregar sessões de telemedicina');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await telemedicineService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await telemedicineService.startSession(sessionId);
      toast.success('Sessão iniciada com sucesso');
      loadSessions();
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Erro ao iniciar sessão');
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await telemedicineService.endSession(sessionId);
      toast.success('Sessão finalizada com sucesso');
      loadSessions();
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Erro ao finalizar sessão');
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      const { room_url } = await telemedicineService.joinSession(sessionId, 'doctor');
      window.open(room_url, '_blank');
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Erro ao entrar na sessão');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { variant: 'secondary' as const, label: 'Agendada' },
      waiting: { variant: 'default' as const, label: 'Aguardando' },
      in_progress: { variant: 'default' as const, label: 'Em Andamento' },
      ended: { variant: 'outline' as const, label: 'Finalizada' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelada' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredSessions = sessions.filter(session =>
    session.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.doctor_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Telemedicina</h1>
            <p className="text-muted-foreground">
              Gerencie sessões de consulta por vídeo
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/telemedicine/sessions/new')}>
              <Video className="w-4 h-4 mr-2" />
              Nova Sessão
            </Button>
            <Button variant="outline" onClick={() => navigate('/telemedicine/configuration')}>
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_sessions}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.active_sessions} ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(analytics.average_duration)}min</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(analytics.total_duration / 60)}h total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gravações</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.recording_usage}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.consent_rate}% consentimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qualidade</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.quality_metrics.connection_issues === 0 ? '100%' : 
                   `${Math.round((1 - analytics.quality_metrics.connection_issues / analytics.total_sessions) * 100)}%`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sem problemas de conexão
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sessões de Telemedicina</CardTitle>
            <CardDescription>
              Gerencie e monitore suas consultas por vídeo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Buscar por paciente ou médico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="scheduled">Agendadas</SelectItem>
                  <SelectItem value="waiting">Aguardando</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="ended">Finalizadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Carregando sessões...</div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma sessão encontrada
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Sessão #{session.id.slice(-8)}</h3>
                          {getStatusBadge(session.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Paciente: {session.patient_id}</p>
                          <p>Médico: {session.doctor_id}</p>
                          {session.start_time && (
                            <p>Início: {new Date(session.start_time).toLocaleString()}</p>
                          )}
                          {session.duration && (
                            <p>Duração: {session.duration} minutos</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {session.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartSession(session.id)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        
                        {session.status === 'waiting' && (
                          <Button
                            size="sm"
                            onClick={() => handleJoinSession(session.id)}
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Entrar
                          </Button>
                        )}
                        
                        {session.status === 'in_progress' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleJoinSession(session.id)}
                            >
                              <Video className="w-4 h-4 mr-1" />
                              Reentrar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleEndSession(session.id)}
                            >
                              <Square className="w-4 h-4 mr-1" />
                              Finalizar
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/telemedicine/sessions/${session.id}`)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Detalhes
                        </Button>
                      </div>
                    </div>
                    
                    {session.recording_enabled && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Video className="w-4 h-4" />
                        <span>Gravação habilitada</span>
                        {session.recording_url && (
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            Ver Gravação
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalSessions > 10 && (
              <div className="flex justify-center mt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {currentPage} de {Math.ceil(totalSessions / 10)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= Math.ceil(totalSessions / 10)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TelemedicineDashboard;
