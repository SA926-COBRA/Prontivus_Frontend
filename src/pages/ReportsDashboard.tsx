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
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { reportsApiService, GeneratedReport, ReportTemplate, ReportDashboardStats } from '@/lib/reportsApi';

const ReportsDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<ReportDashboardStats | null>(null);
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReports, setSelectedReports] = useState<number[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, reportsData, templatesData] = await Promise.all([
        reportsApiService.getDashboardStats(),
        reportsApiService.getRecentReports(),
        reportsApiService.getTemplates()
      ]);

      setDashboardStats(statsData);
      setRecentReports(reportsData);
      setTemplates(templatesData);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard de relatórios');
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

  const handleReportAction = async (reportId: number, action: string) => {
    try {
      switch (action) {
        case 'download':
          await reportsApiService.downloadReport(reportId);
          break;
        case 'view':
          await reportsApiService.viewReport(reportId);
          break;
        case 'delete':
          await reportsApiService.deleteReport(reportId);
          setRecentReports(prev => prev.filter(r => r.id !== reportId));
          break;
      }
    } catch (err) {
      setError(`Erro ao executar ação: ${action}`);
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      for (const reportId of selectedReports) {
        await handleReportAction(reportId, action);
      }
      setSelectedReports([]);
    } catch (err) {
      setError(`Erro ao executar ação em lote: ${action}`);
    }
  };

  const filteredReports = recentReports.filter(report => {
    const matchesSearch = report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.template_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'generating':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Gerando</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard de relatórios...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Relatórios</h1>
            <p className="text-gray-600 mt-1">Geração e gestão de relatórios médicos</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={loadDashboardData} variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button asChild>
              <a href="/relatorios/gerar">
                <Plus className="w-4 h-4 mr-2" />
                Gerar Relatório
              </a>
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
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Relatórios</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalReports}</p>
                    <p className="text-xs text-gray-500">Este mês</p>
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
                    <p className="text-sm font-medium text-gray-600">Concluídos</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.completedReports}</p>
                    <p className="text-xs text-gray-500">Gerados com sucesso</p>
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
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.processingReports}</p>
                    <p className="text-xs text-gray-500">Aguardando geração</p>
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
                    <p className="text-sm font-medium text-gray-600">Templates</p>
                    <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                    <p className="text-xs text-gray-500">Modelos disponíveis</p>
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
            <CardDescription>Encontre relatórios específicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome ou template..."
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
                  Todos
                </Button>
                <Button
                  variant={statusFilter === 'completed' ? 'default' : 'outline'}
                  onClick={() => handleStatusFilter('completed')}
                  size="sm"
                >
                  Concluídos
                </Button>
                <Button
                  variant={statusFilter === 'generating' ? 'default' : 'outline'}
                  onClick={() => handleStatusFilter('generating')}
                  size="sm"
                >
                  Processando
                </Button>
                <Button
                  variant={statusFilter === 'failed' ? 'default' : 'outline'}
                  onClick={() => handleStatusFilter('failed')}
                  size="sm"
                >
                  Falhados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Relatórios Recentes</CardTitle>
                <CardDescription>
                  {filteredReports.length} de {recentReports.length} relatórios
                </CardDescription>
              </div>
              {selectedReports.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('download')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Selecionados
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Selecionados
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredReports.length > 0 ? (
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReports(prev => [...prev, report.id]);
                          } else {
                            setSelectedReports(prev => prev.filter(id => id !== report.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {report.name || `Relatório ${report.id}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {report.template_name} • {formatDate(report.created_at)}
                        </p>
                        {report.file_size && (
                          <p className="text-xs text-gray-400">
                            Tamanho: {formatFileSize(report.file_size)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(report.status)}
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReportAction(report.id, 'view')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReportAction(report.id, 'download')}
                          disabled={report.status !== 'completed'}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReportAction(report.id, 'delete')}
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
                <p>Nenhum relatório encontrado</p>
                {searchTerm && (
                  <p className="text-sm mt-2">Tente ajustar os filtros de busca</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às principais funcionalidades de relatórios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/relatorios/gerar">
                  <Plus className="w-6 h-6 mb-2" />
                  Gerar Relatório
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/relatorios/templates">
                  <Settings className="w-6 h-6 mb-2" />
                  Gerenciar Templates
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/relatorios/agendados">
                  <Calendar className="w-6 h-6 mb-2" />
                  Relatórios Agendados
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/relatorios/estatisticas">
                  <PieChart className="w-6 h-6 mb-2" />
                  Estatísticas
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ReportsDashboard;