/**
 * Statistical Reports Dashboard - Frontend Component
 * Comprehensive analytics and KPIs for clinic operations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  FileText, 
  Download, 
  RefreshCw, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Stethoscope,
  Pill,
  Video,
  Brain,
  PieChart,
  LineChart,
  Settings,
  Share,
  Mail,
  Printer
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

interface DashboardMetrics {
  period_start: string;
  period_end: string;
  total_consultations: number;
  completed_consultations: number;
  consultation_success_rate: number;
  total_prescriptions: number;
  digital_prescriptions: number;
  digital_prescription_rate: number;
  total_billed: number;
  total_paid: number;
  payment_rate: number;
  total_telemedicine_sessions: number;
  completed_telemedicine_sessions: number;
  telemedicine_success_rate: number;
  total_ai_sessions: number;
  completed_ai_sessions: number;
  ai_success_rate: number;
}

interface StatisticalReport {
  id: number;
  report_name: string;
  report_type: 'clinical' | 'financial' | 'operational' | 'quality' | 'compliance' | 'custom';
  description?: string;
  status: 'draft' | 'generating' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  generated_at?: string;
  file_path?: string;
  file_size?: number;
}

const StatisticalReportsDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [reports, setReports] = useState<StatisticalReport[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<StatisticalReport | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsResponse, reportsResponse] = await Promise.all([
        fetch('/api/v1/statistical-reports/dashboard-metrics'),
        fetch('/api/v1/statistical-reports/reports')
      ]);

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const createNewReport = async () => {
    try {
      const response = await fetch('/api/v1/statistical-reports/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_name: 'Novo Relatório',
          report_type: 'clinical',
          description: 'Relatório clínico gerado automaticamente',
          report_format: 'pdf',
          frequency: 'once'
        })
      });

      if (response.ok) {
        const newReport = await response.json();
        setReports(prev => [newReport, ...prev]);
        setSuccess('Novo relatório criado com sucesso!');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      setError('Erro ao criar novo relatório');
    }
  };

  const generateReport = async (reportId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/statistical-reports/reports/${reportId}/generate`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess('Relatório gerado com sucesso!');
        loadDashboardData(); // Reload to get updated status
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Concluído</Badge>;
      case 'generating':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Gerando</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Falhou</Badge>;
      case 'draft':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Rascunho</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Pendente</Badge>;
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'clinical':
        return <Stethoscope className="w-4 h-4" />;
      case 'financial':
        return <DollarSign className="w-4 h-4" />;
      case 'operational':
        return <Activity className="w-4 h-4" />;
      case 'quality':
        return <CheckCircle className="w-4 h-4" />;
      case 'compliance':
        return <Shield className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios Estatísticos</h1>
            <p className="text-gray-600 mt-2">
              Análises e KPIs abrangentes para operações da clínica
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <BarChart3 className="w-3 h-3 mr-1" />
              Analytics
            </Badge>
            <Button onClick={createNewReport} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {metrics && (
              <>
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Consultas</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.total_consultations}</div>
                      <p className="text-xs text-muted-foreground">
                        {metrics.completed_consultations} concluídas ({metrics.consultation_success_rate.toFixed(1)}%)
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Prescrições</CardTitle>
                      <Pill className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.total_prescriptions}</div>
                      <p className="text-xs text-muted-foreground">
                        {metrics.digital_prescriptions} digitais ({metrics.digital_prescription_rate.toFixed(1)}%)
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(metrics.total_billed)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(metrics.total_paid)} recebido ({metrics.payment_rate.toFixed(1)}%)
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Telemedicina</CardTitle>
                      <Video className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.total_telemedicine_sessions}</div>
                      <p className="text-xs text-muted-foreground">
                        {metrics.completed_telemedicine_sessions} concluídas ({metrics.telemedicine_success_rate.toFixed(1)}%)
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        IA Médica
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total de Análises:</span>
                          <span className="font-medium">{metrics.total_ai_sessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Análises Concluídas:</span>
                          <span className="font-medium">{metrics.completed_ai_sessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa de Sucesso:</span>
                          <span className="font-medium">{metrics.ai_success_rate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Resumo do Período
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Período:</span>
                          <span className="font-medium">
                            {formatDate(metrics.period_start)} - {formatDate(metrics.period_end)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa Geral de Sucesso:</span>
                          <span className="font-medium">
                            {((metrics.consultation_success_rate + metrics.telemedicine_success_rate + metrics.ai_success_rate) / 3).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Reports List */}
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Gerados</CardTitle>
                <CardDescription>Histórico de relatórios estatísticos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div 
                      key={report.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedReport?.id === report.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getReportTypeIcon(report.report_type)}
                          <div>
                            <h3 className="font-medium">{report.report_name}</h3>
                            <p className="text-sm text-gray-600">{report.description}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>Criado: {formatDate(report.created_at)}</span>
                              {report.generated_at && (
                                <span>Gerado: {formatDate(report.generated_at)}</span>
                              )}
                              {report.file_size && (
                                <span>Tamanho: {(report.file_size / 1024).toFixed(1)} KB</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(report.status)}
                          <div className="flex gap-1">
                            {report.status === 'completed' && (
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            {report.status === 'draft' && (
                              <Button 
                                size="sm" 
                                onClick={() => generateReport(report.id)}
                                disabled={loading}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Distribuição por Tipo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        Clínicos
                      </span>
                      <span className="font-medium">
                        {reports.filter(r => r.report_type === 'clinical').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        Financeiros
                      </span>
                      <span className="font-medium">
                        {reports.filter(r => r.report_type === 'financial').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-yellow-600" />
                        Operacionais
                      </span>
                      <span className="font-medium">
                        {reports.filter(r => r.report_type === 'operational').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Tendências
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Relatórios Gerados:</span>
                      <span className="font-medium">{reports.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Taxa de Sucesso:</span>
                      <span className="font-medium">
                        {reports.length > 0 
                          ? ((reports.filter(r => r.status === 'completed').length / reports.length) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Último Relatório:</span>
                      <span className="font-medium">
                        {reports.length > 0 
                          ? formatDate(reports[0].created_at)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações de Relatórios
                </CardTitle>
                <CardDescription>
                  Configure as opções padrão para geração de relatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Formato Padrão</label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Período Padrão</label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="30">Últimos 30 dias</option>
                        <option value="90">Últimos 90 dias</option>
                        <option value="365">Último ano</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restaurar Padrões
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default StatisticalReportsDashboard;