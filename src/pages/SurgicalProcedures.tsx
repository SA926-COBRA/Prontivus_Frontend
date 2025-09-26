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
import { ModernLayout, ModernSidebar, ModernPageHeader, ModernStatsGrid } from '@/components/layout/ModernLayout';
import { ModernCard, GradientButton, LoadingSpinner } from '@/components/ui/ModernComponents';
import { commercialApiService, SurgicalProcedure } from '@/lib/commercialApi';

const SurgicalProcedures: React.FC = () => {
  const [procedures, setProcedures] = useState<SurgicalProcedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('procedures');

  useEffect(() => {
    loadProcedures();
  }, []);

  const loadProcedures = async () => {
    try {
      setLoading(true);
      const data = await commercialApiService.getProcedures({
        search: searchTerm || undefined,
        specialty: selectedSpecialty || undefined,
        procedure_type: selectedType || undefined,
        is_active: showInactive ? undefined : true
      });
      setProcedures(data);
    } catch (error) {
      console.error('Error loading procedures:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProcedures();
  }, [searchTerm, selectedSpecialty, selectedType, showInactive]);

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Activity className="h-4 w-4" />,
      href: '/commercial'
    },
    {
      id: 'procedures',
      label: 'Procedimentos',
      icon: <Activity className="h-4 w-4" />,
      href: '/commercial/procedures'
    },
    {
      id: 'estimates',
      label: 'Orçamentos',
      icon: <Activity className="h-4 w-4" />,
      href: '/commercial/estimates'
    },
    {
      id: 'contracts',
      label: 'Contratos',
      icon: <Activity className="h-4 w-4" />,
      href: '/commercial/contracts'
    },
    {
      id: 'packages',
      label: 'Pacotes',
      icon: <Activity className="h-4 w-4" />,
      href: '/commercial/packages'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <Activity className="h-4 w-4" />,
      href: '/commercial/analytics'
    }
  ];

  const procedureTypes = [
    { value: '', label: 'Todos os tipos' },
    { value: 'surgical', label: 'Cirúrgico' },
    { value: 'diagnostic', label: 'Diagnóstico' },
    { value: 'therapeutic', label: 'Terapêutico' },
    { value: 'cosmetic', label: 'Cosmético' },
    { value: 'emergency', label: 'Emergência' }
  ];

  const specialties = [
    'Cardiologia',
    'Ortopedia',
    'Neurologia',
    'Oftalmologia',
    'Dermatologia',
    'Ginecologia',
    'Urologia',
    'Pediatria',
    'Cirurgia Geral',
    'Plástica'
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'surgical':
        return 'text-red-600 bg-red-50';
      case 'diagnostic':
        return 'text-blue-600 bg-blue-50';
      case 'therapeutic':
        return 'text-green-600 bg-green-50';
      case 'cosmetic':
        return 'text-purple-600 bg-purple-50';
      case 'emergency':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'surgical':
        return 'Cirúrgico';
      case 'diagnostic':
        return 'Diagnóstico';
      case 'therapeutic':
        return 'Terapêutico';
      case 'cosmetic':
        return 'Cosmético';
      case 'emergency':
        return 'Emergência';
      default:
        return type;
    }
  };

  const getComplexityStars = (level?: number) => {
    if (!level) return '';
    return '★'.repeat(level) + '☆'.repeat(5 - level);
  };

  const handleDeleteProcedure = async (id: number) => {
    if (window.confirm('Tem certeza que deseja desativar este procedimento?')) {
      try {
        await commercialApiService.deleteProcedure(id);
        await loadProcedures();
      } catch (error) {
        console.error('Error deleting procedure:', error);
      }
    }
  };

  return (
    <ModernLayout
      title="Procedimentos Cirúrgicos"
      subtitle="Gestão do catálogo de procedimentos cirúrgicos"
      sidebar={
        <ModernSidebar
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={setActiveSidebarItem}
        />
      }
    >
      <ModernPageHeader
        title="Procedimentos Cirúrgicos"
        subtitle="Catálogo completo de procedimentos disponíveis"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Comercial', href: '/commercial' },
          { label: 'Procedimentos' }
        ]}
        actions={
          <GradientButton variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Novo Procedimento
          </GradientButton>
        }
      />

      {/* Filters */}
      <ModernCard variant="elevated" className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar procedimentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {procedureTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as especialidades</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mostrar inativos</span>
          </label>
        </div>
      </ModernCard>

      {/* Procedures Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {procedures.map((procedure) => (
            <ModernCard key={procedure.id} variant="elevated" hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">{procedure.code}</span>
                    {procedure.is_active ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{procedure.name}</h3>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(procedure.procedure_type)}`}>
                    {getTypeLabel(procedure.procedure_type)}
                  </div>
                </div>
              </div>

              {procedure.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{procedure.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Especialidade:</span>
                  <span className="font-medium">{procedure.specialty || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Preço base:</span>
                  <span className="font-medium text-green-600">
                    R$ {procedure.base_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {procedure.duration_minutes && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duração:</span>
                    <span className="font-medium">{procedure.duration_minutes} min</span>
                  </div>
                )}

                {procedure.complexity_level && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Complexidade:</span>
                    <span className="font-medium text-yellow-600">
                      {getComplexityStars(procedure.complexity_level)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Anestesia:</span>
                  <span className="font-medium">
                    {procedure.requires_anesthesia ? 'Sim' : 'Não'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Internação:</span>
                  <span className="font-medium">
                    {procedure.requires_hospitalization ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <GradientButton
                    variant="outline"
                    size="sm"
                    onClick={() => {/* View procedure */}}
                  >
                    <Eye className="h-4 w-4" />
                  </GradientButton>
                  <GradientButton
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Edit procedure */}}
                  >
                    <Edit className="h-4 w-4" />
                  </GradientButton>
                  <GradientButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteProcedure(procedure.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </GradientButton>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Criado em {new Date(procedure.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>
      )}

      {!loading && procedures.length === 0 && (
        <ModernCard variant="elevated">
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum procedimento encontrado</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedSpecialty || selectedType
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Comece criando seu primeiro procedimento'}
            </p>
            <GradientButton variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Procedimento
            </GradientButton>
          </div>
        </ModernCard>
      )}
    </ModernLayout>
  );
};

export default SurgicalProcedures;
