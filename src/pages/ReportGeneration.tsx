import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Plus, 
  Eye, 
  Settings,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Save,
  Send
} from 'lucide-react';
import { ModernLayout, ModernSidebar, ModernPageHeader } from '@/components/layout/ModernLayout';
import { ModernCard, GradientButton, LoadingSpinner } from '@/components/ui/ModernComponents';
import { reportsApiService, ReportTemplate, ReportGenerationRequest, ReportValidationResponse } from '@/lib/reportsApi';

const ReportGeneration: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [validation, setValidation] = useState<ReportValidationResponse | null>(null);
  const [activeSidebarItem, setActiveSidebarItem] = useState('generate');

  // Form state
  const [formData, setFormData] = useState({
    report_format: 'pdf' as 'pdf' | 'excel' | 'csv' | 'html',
    date_range_start: '',
    date_range_end: '',
    parameters: {} as Record<string, any>
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      validateReport();
    }
  }, [selectedTemplate, formData]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await reportsApiService.getTemplates({ is_active: true });
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateReport = async () => {
    if (!selectedTemplate) return;

    try {
      const validationRequest = {
        template_id: selectedTemplate.id,
        parameters: formData.parameters
      };
      const result = await reportsApiService.validateReport(validationRequest);
      setValidation(result);
    } catch (error) {
      console.error('Error validating report:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !validation?.is_valid) return;

    try {
      setGenerating(true);
      
      const request: ReportGenerationRequest = {
        template_id: selectedTemplate.id,
        report_format: formData.report_format,
        parameters: formData.parameters,
        date_range_start: formData.date_range_start || undefined,
        date_range_end: formData.date_range_end || undefined,
        expires_in_hours: 24
      };

      const report = await reportsApiService.generateReport(request);
      
      // Show success message and redirect to reports list
      alert(`Relatório ${report.report_number} gerado com sucesso!`);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Activity className="h-4 w-4" />,
      href: '/reports'
    },
    {
      id: 'templates',
      label: 'Modelos',
      icon: <FileText className="h-4 w-4" />,
      href: '/reports/templates'
    },
    {
      id: 'generate',
      label: 'Gerar Relatório',
      icon: <Plus className="h-4 w-4" />,
      href: '/reports/generate'
    },
    {
      id: 'my-reports',
      label: 'Meus Relatórios',
      icon: <Eye className="h-4 w-4" />,
      href: '/reports/my-reports'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      href: '/reports/analytics'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings className="h-4 w-4" />,
      href: '/reports/settings'
    }
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'clinical':
        return 'Clínico';
      case 'financial':
        return 'Financeiro';
      case 'administrative':
        return 'Administrativo';
      case 'commercial':
        return 'Comercial';
      case 'audit':
        return 'Auditoria';
      case 'custom':
        return 'Personalizado';
      default:
        return type;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'pdf':
        return 'PDF';
      case 'excel':
        return 'Excel';
      case 'csv':
        return 'CSV';
      case 'html':
        return 'HTML';
      default:
        return format;
    }
  };

  const renderParameterInputs = () => {
    if (!selectedTemplate) return null;

    const parameters = selectedTemplate.template_data?.parameters || {};
    
    return Object.entries(parameters).map(([key, param]: [string, any]) => (
      <div key={key} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {param.label || key}
        </label>
        
        {param.type === 'select' ? (
          <select
            value={formData.parameters[key] || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              parameters: { ...prev.parameters, [key]: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione...</option>
            {param.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : param.type === 'checkbox' ? (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.parameters[key] || false}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                parameters: { ...prev.parameters, [key]: e.target.checked }
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{param.label || key}</span>
          </label>
        ) : param.type === 'number' ? (
          <input
            type="number"
            value={formData.parameters[key] || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              parameters: { ...prev.parameters, [key]: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={param.placeholder}
          />
        ) : (
          <input
            type="text"
            value={formData.parameters[key] || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              parameters: { ...prev.parameters, [key]: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={param.placeholder}
          />
        )}
        
        {param.description && (
          <p className="text-xs text-gray-500 mt-1">{param.description}</p>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <ModernLayout title="Gerar Relatório">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout
      title="Gerar Relatório"
      subtitle="Criar novos relatórios personalizados"
      sidebar={
        <ModernSidebar
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={setActiveSidebarItem}
        />
      }
    >
      <ModernPageHeader
        title="Gerar Relatório"
        subtitle="Configure e gere relatórios personalizados"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Relatórios', href: '/reports' },
          { label: 'Gerar Relatório' }
        ]}
        actions={
          <div className="flex items-center space-x-2">
            <GradientButton
              variant="primary"
              onClick={handleGenerateReport}
              disabled={!selectedTemplate || !validation?.is_valid || generating}
            >
              {generating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </GradientButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Template Selection */}
        <div className="lg:col-span-1">
          <ModernCard variant="elevated">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Modelo</h3>
            
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{template.name}</p>
                      <p className="text-sm text-gray-500">{getTypeLabel(template.report_type)}</p>
                      {template.description && (
                        <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                      )}
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>

        {/* Configuration */}
        <div className="lg:col-span-2">
          <ModernCard variant="elevated">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuração do Relatório</h3>
            
            {selectedTemplate ? (
              <div className="space-y-6">
                {/* Basic Settings */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Configurações Básicas</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Formato do Relatório
                      </label>
                      <select
                        value={formData.report_format}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          report_format: e.target.value as 'pdf' | 'excel' | 'csv' | 'html'
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                        <option value="html">HTML</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Modelo Selecionado
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="font-medium text-gray-900">{selectedTemplate.name}</p>
                        <p className="text-sm text-gray-500">{getTypeLabel(selectedTemplate.report_type)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Período</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Inicial
                      </label>
                      <input
                        type="date"
                        value={formData.date_range_start}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          date_range_start: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Final
                      </label>
                      <input
                        type="date"
                        value={formData.date_range_end}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          date_range_end: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Parameters */}
                {selectedTemplate.template_data?.parameters && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Parâmetros</h4>
                    {renderParameterInputs()}
                  </div>
                )}

                {/* Validation */}
                {validation && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Validação</h4>
                    
                    {validation.is_valid ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Configuração válida</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-red-600">
                          <XCircle className="h-5 w-5" />
                          <span className="font-medium">Configuração inválida</span>
                        </div>
                        {validation.errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 ml-7">• {error}</p>
                        ))}
                      </div>
                    )}
                    
                    {validation.warnings.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center space-x-2 text-yellow-600">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-medium">Avisos</span>
                        </div>
                        {validation.warnings.map((warning, index) => (
                          <p key={index} className="text-sm text-yellow-600 ml-7">• {warning}</p>
                        ))}
                      </div>
                    )}
                    
                    {validation.estimated_generation_time_seconds && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p>Tempo estimado: {validation.estimated_generation_time_seconds} segundos</p>
                        {validation.estimated_file_size_mb && (
                          <p>Tamanho estimado: {validation.estimated_file_size_mb.toFixed(1)} MB</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um modelo</h3>
                <p>Escolha um modelo de relatório para começar a configuração</p>
              </div>
            )}
          </ModernCard>
        </div>
      </div>
    </ModernLayout>
  );
};

export default ReportGeneration;
