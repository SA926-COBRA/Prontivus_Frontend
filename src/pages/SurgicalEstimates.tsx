import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  FileText,
  Filter,
  Download,
  Send
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { commercialApiService, SurgicalEstimate } from '@/lib/commercialApi';

const SurgicalEstimates: React.FC = () => {
  const [estimates, setEstimates] = useState<SurgicalEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedEstimates, setSelectedEstimates] = useState<number[]>([]);

  useEffect(() => {
    loadEstimates();
  }, []);

  const loadEstimates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await commercialApiService.getEstimates();
      setEstimates(data);
    } catch (err) {
      setError('Erro ao carregar orçamentos cirúrgicos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
  };

  const handlePriorityFilter = (priority: string) => {
    setSelectedPriority(priority);
  };

  const handleEstimateAction = async (estimateId: number, action: string) => {
    try {
      switch (action) {
        case 'view':
          // Navigate to estimate view
          window.location.href = `/comercial/orcamento/${estimateId}`;
          break;
        case 'edit':
          // Navigate to estimate edit
          window.location.href = `/comercial/orcamento/${estimateId}/editar`;
          break;
        case 'approve':
          await commercialApiService.approveEstimate(estimateId);
          await loadEstimates();
          break;
        case 'reject':
          await commercialApiService.rejectEstimate(estimateId);
          await loadEstimates();
          break;
        case 'download':
          await commercialApiService.downloadEstimate(estimateId);
          break;
        case 'send':
          await commercialApiService.sendEstimate(estimateId);
          break;
      }
    } catch (err) {
      setError(`Erro ao executar ação: ${action}`);
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      for (const estimateId of selectedEstimates) {
        await handleEstimateAction(estimateId, action);
      }
      setSelectedEstimates([]);
    } catch (err) {
      setError(`Erro ao executar ação em lote: ${action}`);
    }
  };

  const filteredEstimates = estimates.filter(estimate => {
    const matchesSearch = estimate.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimate.procedure_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimate.id.toString().includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || estimate.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || estimate.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Média</Badge>;
      case 'low':
        return <Badge variant="outline">Baixa</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
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

  const getStats = () => {
    const total = estimates.length;
    const approved = estimates.filter(e => e.status === 'approved').length;
    const pending = estimates.filter(e => e.status === 'pending').length;
    const rejected = estimates.filter(e => e.status === 'rejected').length;
    const totalValue = estimates.reduce((sum, e) => sum + (e.total_value || 0), 0);

    return { total, approved, pending, rejected, totalValue };
  };

  const stats = getStats();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando orçamentos cirúrgicos...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Orçamentos Cirúrgicos</h1>
            <p className="text-gray-600 mt-1">Gestão de orçamentos para procedimentos cirúrgicos</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={loadEstimates} variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500">Orçamentos</p>
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
                  <p className="text-sm font-medium text-gray-600">Aprovados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                  <p className="text-xs text-gray-500">Confirmados</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  <p className="text-xs text-gray-500">Aguardando</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejeitados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                  <p className="text-xs text-gray-500">Negados</p>
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
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalValue)}
                  </p>
                  <p className="text-xs text-gray-500">Soma geral</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
            <CardDescription>Encontre orçamentos específicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por paciente, procedimento ou ID..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => handleStatusFilter('all')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => handleStatusFilter('pending')}
                  size="sm"
                >
                  Pendentes
                </Button>
                <Button
                  variant={selectedStatus === 'approved' ? 'default' : 'outline'}
                  onClick={() => handleStatusFilter('approved')}
                  size="sm"
                >
                  Aprovados
                </Button>
                <Button
                  variant={selectedStatus === 'rejected' ? 'default' : 'outline'}
                  onClick={() => handleStatusFilter('rejected')}
                  size="sm"
                >
                  Rejeitados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estimates List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Orçamentos Cirúrgicos</CardTitle>
                <CardDescription>
                  {filteredEstimates.length} de {estimates.length} orçamentos
                </CardDescription>
              </div>
              {selectedEstimates.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('approve')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar Selecionados
                  </Button>
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
                    onClick={() => handleBulkAction('reject')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar Selecionados
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredEstimates.length > 0 ? (
              <div className="space-y-3">
                {filteredEstimates.map((estimate) => (
                  <div key={estimate.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedEstimates.includes(estimate.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEstimates(prev => [...prev, estimate.id]);
                          } else {
                            setSelectedEstimates(prev => prev.filter(id => id !== estimate.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {estimate.procedure_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {estimate.patient_name} • Dr. {estimate.doctor_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Criado em {formatDate(estimate.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(estimate.total_value || 0)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(estimate.status)}
                          {getPriorityBadge(estimate.priority || 'normal')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEstimateAction(estimate.id, 'view')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEstimateAction(estimate.id, 'edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEstimateAction(estimate.id, 'download')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {estimate.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEstimateAction(estimate.id, 'approve')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEstimateAction(estimate.id, 'reject')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum orçamento encontrado</p>
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

export default SurgicalEstimates;