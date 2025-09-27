import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  FileText, 
  Users, 
  DollarSign, 
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { commercialApiService, CommercialDashboardStats, SurgicalEstimate, SurgicalContract } from '@/lib/commercialApi';

const CommercialDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<CommercialDashboardStats | null>(null);
  const [recentEstimates, setRecentEstimates] = useState<SurgicalEstimate[]>([]);
  const [recentContracts, setRecentContracts] = useState<SurgicalContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, estimatesData, contractsData] = await Promise.all([
        commercialApiService.getDashboardStats(),
        commercialApiService.getRecentEstimates(),
        commercialApiService.getRecentContracts()
      ]);

      setDashboardStats(statsData);
      setRecentEstimates(estimatesData);
      setRecentContracts(contractsData);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard comercial');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      case 'signed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Assinado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard comercial...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Módulo Comercial</h1>
            <p className="text-gray-600 mt-1">Gestão de orçamentos e contratos cirúrgicos</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={loadDashboardData} variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button asChild>
              <a href="/comercial/orcamento/novo">
                <Plus className="w-4 h-4 mr-2" />
                Novo Orçamento
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
                    <p className="text-sm font-medium text-gray-600">Total de Orçamentos</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalEstimates}</p>
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
                    <p className="text-sm font-medium text-gray-600">Contratos Assinados</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.signedContracts}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingEstimates}</p>
                    <p className="text-xs text-gray-500">Aguardando aprovação</p>
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
                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dashboardStats.totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-500">Este mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Estimates */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Orçamentos Recentes</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <a href="/comercial/orcamentos">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Todos
                  </a>
                </Button>
              </div>
              <CardDescription>Últimos orçamentos criados</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEstimates.length > 0 ? (
                <div className="space-y-3">
                  {recentEstimates.map((estimate) => (
                    <div key={estimate.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {estimate.procedure_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {estimate.patient_name} • {formatDate(estimate.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(estimate.total_value)}
                        </p>
                        {getStatusBadge(estimate.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum orçamento encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Contracts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contratos Recentes</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <a href="/comercial/contratos">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Todos
                  </a>
                </Button>
              </div>
              <CardDescription>Últimos contratos assinados</CardDescription>
            </CardHeader>
            <CardContent>
              {recentContracts.length > 0 ? (
                <div className="space-y-3">
                  {recentContracts.map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {contract.procedure_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {contract.patient_name} • {formatDate(contract.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(contract.total_value)}
                        </p>
                        {getStatusBadge(contract.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum contrato encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às principais funcionalidades comerciais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/comercial/orcamento/novo">
                  <Plus className="w-6 h-6 mb-2" />
                  Novo Orçamento
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/comercial/contrato/novo">
                  <FileText className="w-6 h-6 mb-2" />
                  Novo Contrato
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/comercial/procedimentos">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  Procedimentos
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/comercial/relatorios">
                  <PieChart className="w-6 h-6 mb-2" />
                  Relatórios
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CommercialDashboard;