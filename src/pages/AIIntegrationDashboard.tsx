import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Mic, 
  FileText, 
  Settings, 
  BarChart3, 
  Play, 
  Pause, 
  Square, 
  Upload, 
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  DollarSign,
  Activity
} from 'lucide-react';
import { aiIntegrationService, AIAnalysisSession, AIUsageAnalytics } from '@/lib/aiIntegrationService';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from 'sonner';

const AIIntegrationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<AIAnalysisSession[]>([]);
  const [analytics, setAnalytics] = useState<AIUsageAnalytics | null>(null);
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

      const response = await aiIntegrationService.getAnalysisSessions(params);
      setSessions(response.sessions);
      setTotalSessions(response.total);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Erro ao carregar sessões de IA');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await aiIntegrationService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pendente', icon: Clock },
      processing: { variant: 'default' as const, label: 'Processando', icon: Activity },
      completed: { variant: 'default' as const, label: 'Concluída', icon: CheckCircle },
      failed: { variant: 'destructive' as const, label: 'Falhou', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
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
            <h1 className="text-3xl font-bold">Integração com IA</h1>
            <p className="text-muted-foreground">
              Análise automática de consultas com inteligência artificial
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/ai-integration/sessions/new')}>
              <Brain className="w-4 h-4 mr-2" />
              Nova Análise
            </Button>
            <Button variant="outline" onClick={() => navigate('/ai-integration/configuration')}>
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
                <CardTitle className="text-sm font-medium">Total de Análises</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_sessions}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.successful_analyses} bem-sucedidas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(analytics.average_processing_time)}s</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(analytics.total_processing_time / 60)}min total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.total_sessions > 0 
                    ? Math.round((analytics.successful_analyses / analytics.total_sessions) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.failed_analyses} falhas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {analytics.cost_breakdown.total_cost.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Transcrição: R$ {analytics.cost_breakdown.transcription_cost.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Usage by Feature */}
        {analytics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Uso por Funcionalidade
              </CardTitle>
              <CardDescription>
                Distribuição do uso das funcionalidades de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.usage_by_feature.transcription}</div>
                  <p className="text-sm text-muted-foreground">Transcrições</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.usage_by_feature.clinical_summary}</div>
                  <p className="text-sm text-muted-foreground">Resumos Clínicos</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.usage_by_feature.diagnosis_suggestions}</div>
                  <p className="text-sm text-muted-foreground">Diagnósticos</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.usage_by_feature.exam_suggestions}</div>
                  <p className="text-sm text-muted-foreground">Exames</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.usage_by_feature.treatment_suggestions}</div>
                  <p className="text-sm text-muted-foreground">Tratamentos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sessões de Análise</CardTitle>
            <CardDescription>
              Gerencie e monitore suas análises de IA
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
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="failed">Falharam</SelectItem>
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
                          <h3 className="font-semibold">Análise #{session.id.slice(-8)}</h3>
                          {getStatusBadge(session.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Paciente: {session.patient_id}</p>
                          <p>Médico: {session.doctor_id}</p>
                          <p>Criada: {new Date(session.created_at).toLocaleString()}</p>
                          {session.analysis_results && (
                            <div className="mt-2">
                              <p className="font-medium">Resultados:</p>
                              <ul className="text-xs space-y-1">
                                <li>• {session.analysis_results.diagnostic_hypotheses.length} hipóteses diagnósticas</li>
                                <li>• {session.analysis_results.exam_suggestions.length} sugestões de exames</li>
                                <li>• {session.analysis_results.treatment_suggestions.length} sugestões de tratamento</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/ai-integration/sessions/${session.id}`)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Ver Detalhes
                        </Button>
                        
                        {session.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Export analysis data
                              aiIntegrationService.exportAnalysisData(session.id)
                                .then(blob => {
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `analise-${session.id.slice(-8)}.json`;
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                })
                                .catch(error => {
                                  console.error('Error exporting data:', error);
                                  toast.error('Erro ao exportar dados');
                                });
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Exportar
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {session.transcription && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Transcrição:</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {session.transcription}
                        </p>
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

export default AIIntegrationDashboard;