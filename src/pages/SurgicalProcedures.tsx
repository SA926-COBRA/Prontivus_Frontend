import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  DollarSign,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { commercialApiService, SurgicalProcedure } from '@/lib/commercialApi';

const SurgicalProcedures: React.FC = () => {
  const [procedures, setProcedures] = useState<SurgicalProcedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedProcedures, setSelectedProcedures] = useState<number[]>([]);

  useEffect(() => {
    loadProcedures();
  }, []);

  const loadProcedures = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await commercialApiService.getProcedures();
      setProcedures(data);
    } catch (err) {
      setError('Erro ao carregar procedimentos cirúrgicos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSpecialtyFilter = (specialty: string) => {
    setSelectedSpecialty(specialty);
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
  };

  const handleProcedureAction = async (procedureId: number, action: string) => {
    try {
      switch (action) {
        case 'view':
          window.location.href = `/comercial/procedimento/${procedureId}`;
          break;
        case 'edit':
          window.location.href = `/comercial/procedimento/${procedureId}/editar`;
          break;
        case 'delete':
          await commercialApiService.deleteProcedure(procedureId);
          setProcedures(prev => prev.filter(p => p.id !== procedureId));
          break;
        case 'toggle_status':
          const procedure = procedures.find(p => p.id === procedureId);
          if (procedure) {
            await commercialApiService.updateProcedure(procedureId, {
              ...procedure,
              is_active: !procedure.is_active
            });
            await loadProcedures();
          }
          break;
      }
    } catch (err) {
      setError(`Erro ao executar ação: ${action}`);
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      for (const procedureId of selectedProcedures) {
        await handleProcedureAction(procedureId, action);
      }
      setSelectedProcedures([]);
    } catch (err) {
      setError(`Erro ao executar ação em lote: ${action}`);
    }
  };

  const filteredProcedures = procedures.filter(procedure => {
    const matchesSearch = procedure.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         procedure.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         procedure.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || procedure.specialty === selectedSpecialty;
    const matchesType = selectedType === 'all' || procedure.type === selectedType;
    const matchesStatus = showInactive || procedure.is_active;
    return matchesSearch && matchesSpecialty && matchesType && matchesStatus;
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inativo</Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'major':
        return <Badge variant="destructive">Maior</Badge>;
      case 'minor':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Menor</Badge>;
      case 'diagnostic':
        return <Badge variant="outline">Diagnóstico</Badge>;
      default:
        return <Badge variant="outline">Geral</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const getStats = () => {
    const total = procedures.length;
    const active = procedures.filter(p => p.is_active).length;
    const inactive = procedures.filter(p => !p.is_active).length;
    const specialties = [...new Set(procedures.map(p => p.specialty))].length;
    const avgDuration = procedures.reduce((sum, p) => sum + (p.estimated_duration || 0), 0) / total;

    return { total, active, inactive, specialties, avgDuration };
  };

  const stats = getStats();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando procedimentos cirúrgicos...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Procedimentos Cirúrgicos</h1>
            <p className="text-gray-600 mt-1">Gestão de procedimentos e códigos cirúrgicos</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={loadProcedures} variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button asChild>
              <a href="/comercial/procedimento/novo">
                <Plus className="w-4 h-4 mr-2" />
                Novo Procedimento
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
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500">Procedimentos</p>
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
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  <p className="text-xs text-gray-500">Disponíveis</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inativos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                  <p className="text-xs text-gray-500">Desabilitados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Filter className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Especialidades</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.specialties}</p>
                  <p className="text-xs text-gray-500">Categorias</p>
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
                  <p className="text-sm font-medium text-gray-600">Duração Média</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(Math.round(stats.avgDuration))}
                  </p>
                  <p className="text-xs text-gray-500">Por procedimento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
            <CardDescription>Encontre procedimentos específicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome, código ou descrição..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedSpecialty === 'all' ? 'default' : 'outline'}
                  onClick={() => handleSpecialtyFilter('all')}
                  size="sm"
                >
                  Todas
                </Button>
                <Button
                  variant={selectedSpecialty === 'cardiology' ? 'default' : 'outline'}
                  onClick={() => handleSpecialtyFilter('cardiology')}
                  size="sm"
                >
                  Cardiologia
                </Button>
                <Button
                  variant={selectedSpecialty === 'orthopedics' ? 'default' : 'outline'}
                  onClick={() => handleSpecialtyFilter('orthopedics')}
                  size="sm"
                >
                  Ortopedia
                </Button>
                <Button
                  variant={selectedSpecialty === 'neurology' ? 'default' : 'outline'}
                  onClick={() => handleSpecialtyFilter('neurology')}
                  size="sm"
                >
                  Neurologia
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedType === 'all' ? 'default' : 'outline'}
                  onClick={() => handleTypeFilter('all')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={selectedType === 'major' ? 'default' : 'outline'}
                  onClick={() => handleTypeFilter('major')}
                  size="sm"
                >
                  Maior
                </Button>
                <Button
                  variant={selectedType === 'minor' ? 'default' : 'outline'}
                  onClick={() => handleTypeFilter('minor')}
                  size="sm"
                >
                  Menor
                </Button>
                <Button
                  variant={showInactive ? 'default' : 'outline'}
                  onClick={() => setShowInactive(!showInactive)}
                  size="sm"
                >
                  Inativos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Procedures List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Procedimentos Cirúrgicos</CardTitle>
                <CardDescription>
                  {filteredProcedures.length} de {procedures.length} procedimentos
                </CardDescription>
              </div>
              {selectedProcedures.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('toggle_status')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Alterar Status
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
            {filteredProcedures.length > 0 ? (
              <div className="space-y-3">
                {filteredProcedures.map((procedure) => (
                  <div key={procedure.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedProcedures.includes(procedure.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProcedures(prev => [...prev, procedure.id]);
                          } else {
                            setSelectedProcedures(prev => prev.filter(id => id !== procedure.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {procedure.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Código: {procedure.code} • {procedure.specialty}
                        </p>
                        <p className="text-xs text-gray-400">
                          Duração: {formatDuration(procedure.estimated_duration || 0)} • 
                          Valor: {formatCurrency(procedure.base_price || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(procedure.is_active)}
                          {getTypeBadge(procedure.type || 'general')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProcedureAction(procedure.id, 'view')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProcedureAction(procedure.id, 'edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProcedureAction(procedure.id, 'toggle_status')}
                          className={procedure.is_active ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {procedure.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProcedureAction(procedure.id, 'delete')}
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
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum procedimento encontrado</p>
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

export default SurgicalProcedures;