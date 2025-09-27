import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Play, 
  Pause, 
  Stop, 
  Upload, 
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  Settings,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  Stethoscope
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { voiceApiService, VoiceSession, VoiceDashboardStats } from '@/lib/voiceApi';

const VoiceSessionsDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [dashboardStats, setDashboardStats] = useState<VoiceDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sessionsData, statsData] = await Promise.all([
        voiceApiService.getSessions(),
        voiceApiService.getDashboardStats()
      ]);

      setSessions(sessionsData);
      setDashboardStats(statsData);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleSessionAction = async (sessionId: number, action: string) => {
    try {
      switch (action) {
        case 'transcribe':
          await voiceApiService.transcribeSession(sessionId);
          break;
        case 'download':
          await voiceApiService.downloadSession(sessionId);
          break;
        case 'delete':
          await voiceApiService.deleteSession(sessionId);
          setSessions(prev => prev.filter(s => s.id !== sessionId));
          break;
      }
      await loadDashboardData();
    } catch (err) {
      setError(`Erro ao executar ação: ${action}`);
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      for (const sessionId of selectedSessions) {
        await handleSessionAction(sessionId, action);
      }
      setSelectedSessions([]);
    } catch (err) {
      setError(`Erro ao executar ação em lote: ${action}`);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.transcription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processando</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <h1 className="text-3xl font-bold text-gray-900">Sessões de Voz</h1>
            <p className="text-gray-600 mt-1">Dashboard de gravações e transcrições</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={loadDashboardData} variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mic className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Sessões</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalSessions}</p>
                    <p className="text-xs text-gray-500">Gravações realizadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Transcrições Concluídas</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.completedTranscriptions}</p>
                    <p className="text-xs text-gray-500">Processadas com sucesso</p>
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
                    <p className="text-sm font-medium text-gray-600">Em Processamento</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.processingSessions}</p>
                    <p className="text-xs text-gray-500">Aguardando transcrição</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tempo Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatDuration(dashboardStats.totalDuration)}</p>
                    <p className="text-xs text-gray-500">Minutos gravados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
            <CardDescription>Encontre sessões específicas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por ID ou transcrição..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => handleStatusFilter('all')}
                  size="sm"
                >
                  Todas
                </Button>
                <Button
                  variant={statusFilter === 'completed' ? 'default' : 'outline'}
                  onClick={() => handleStatusFilter('completed')}
                  size="sm"
                >
                  Concluídas
                </Button>
                <Button
                  variant={statusFilter === 'processing' ? 'default' : 'outline'}
                  onClick={() => handleStatusFilter('processing')}
                  size="sm"
                >
                  Processando
                </Button>
                <Button
                  variant={statusFilter === 'failed' ? 'default' : 'outline'}
                  onClick={() => handleStatusFilter('failed')}
                  size="sm"
                >
                  Falhadas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sessões de Gravação</CardTitle>
                <CardDescription>
                  {filteredSessions.length} de {sessions.length} sessões
                </CardDescription>
              </div>
              {selectedSessions.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('transcribe')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Transcrever Selecionadas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('download')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Selecionadas
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Selecionadas
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredSessions.length > 0 ? (
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedSessions.includes(session.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSessions(prev => [...prev, session.id]);
                          } else {
                            setSelectedSessions(prev => prev.filter(id => id !== session.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Sessão {session.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(session.created_at).toLocaleString('pt-BR')} • 
                          Duração: {formatDuration(session.duration)}
                        </p>
                        {session.transcription && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {session.transcription.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(session.status)}
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSessionAction(session.id, 'transcribe')}
                          disabled={session.status === 'processing'}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSessionAction(session.id, 'download')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSessionAction(session.id, 'delete')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma sessão encontrada</p>
                {searchTerm && (
                  <p className="text-sm mt-2">Tente ajustar os filtros de busca</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default VoiceSessionsDashboard;