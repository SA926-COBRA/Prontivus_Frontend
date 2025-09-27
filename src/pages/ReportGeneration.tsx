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
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { reportsApiService, ReportTemplate, ReportGenerationRequest, ReportValidationResponse } from '@/lib/reportsApi';

const ReportGeneration: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [validation, setValidation] = useState<ReportValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Form data
  const [formData, setFormData] = useState<ReportGenerationRequest>({
    template_id: 0,
    name: '',
    description: '',
    parameters: {},
    schedule_date: '',
    priority: 'normal',
    recipients: []
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsApiService.getTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Erro ao carregar templates de relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      template_id: template.id,
      name: template.name || '',
      description: template.description || ''
    }));
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParameterChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value
      }
    }));
  };

  const validateForm = async () => {
    try {
      const response = await reportsApiService.validateReportRequest(formData);
      setValidation(response);
      if (response.is_valid) {
        setError(null);
      } else {
        setError(response.errors.join(', '));
      }
    } catch (err) {
      setError('Erro ao validar formulário');
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      setError(null);
      setSuccess(null);
      
      const response = await reportsApiService.generateReport(formData);
      setSuccess(`Relatório "${response.name}" gerado com sucesso!`);
      
      // Reset form
      setFormData({
        template_id: 0,
        name: '',
        description: '',
        parameters: {},
        schedule_date: '',
        priority: 'normal',
        recipients: []
      });
      setSelectedTemplate(null);
      setValidation(null);
    } catch (err) {
      setError('Erro ao gerar relatório');
    } finally {
      setGenerating(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando templates de relatório...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Gerar Relatório</h1>
            <p className="text-gray-600 mt-1">Crie relatórios personalizados usando templates</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={loadTemplates} variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <p className="text-green-800">{success}</p>
            <Button variant="ghost" size="sm" onClick={() => setSuccess(null)} className="ml-auto">
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Template</CardTitle>
              <CardDescription>Escolha um template para seu relatório</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={categoryFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setCategoryFilter('all')}
                    size="sm"
                  >
                    Todos
                  </Button>
                  <Button
                    variant={categoryFilter === 'medical' ? 'default' : 'outline'}
                    onClick={() => setCategoryFilter('medical')}
                    size="sm"
                  >
                    Médicos
                  </Button>
                  <Button
                    variant={categoryFilter === 'financial' ? 'default' : 'outline'}
                    onClick={() => setCategoryFilter('financial')}
                    size="sm"
                  >
                    Financeiros
                  </Button>
                  <Button
                    variant={categoryFilter === 'administrative' ? 'default' : 'outline'}
                    onClick={() => setCategoryFilter('administrative')}
                    size="sm"
                  >
                    Administrativos
                  </Button>
                </div>
              </div>

              {/* Templates List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{template.name}</p>
                        <p className="text-sm text-gray-500">{template.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{template.category}</Badge>
                          {getPriorityBadge(template.priority || 'normal')}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {formatDate(template.created_at)}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configurar Relatório</CardTitle>
              <CardDescription>
                {selectedTemplate ? `Configurando: ${selectedTemplate.name}` : 'Selecione um template primeiro'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTemplate ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Relatório</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        placeholder="Digite o nome do relatório"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        placeholder="Descreva o propósito do relatório"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Parameters */}
                  {selectedTemplate.parameters && Object.keys(selectedTemplate.parameters).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Parâmetros</h4>
                      {Object.entries(selectedTemplate.parameters).map(([key, param]) => (
                        <div key={key}>
                          <Label htmlFor={key}>{param.label || key}</Label>
                          {param.type === 'text' && (
                            <Input
                              id={key}
                              value={formData.parameters[key] || ''}
                              onChange={(e) => handleParameterChange(key, e.target.value)}
                              placeholder={param.placeholder || ''}
                            />
                          )}
                          {param.type === 'textarea' && (
                            <Textarea
                              id={key}
                              value={formData.parameters[key] || ''}
                              onChange={(e) => handleParameterChange(key, e.target.value)}
                              placeholder={param.placeholder || ''}
                              rows={3}
                            />
                          )}
                          {param.type === 'date' && (
                            <Input
                              id={key}
                              type="date"
                              value={formData.parameters[key] || ''}
                              onChange={(e) => handleParameterChange(key, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Schedule and Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schedule_date">Data de Agendamento</Label>
                      <Input
                        id="schedule_date"
                        type="datetime-local"
                        value={formData.schedule_date}
                        onChange={(e) => handleFormChange('schedule_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Prioridade</Label>
                      <select
                        id="priority"
                        value={formData.priority}
                        onChange={(e) => handleFormChange('priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Baixa</option>
                        <option value="normal">Normal</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={validateForm}
                      variant="outline"
                      disabled={generating}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Validar
                    </Button>
                    <Button
                      onClick={generateReport}
                      disabled={generating || !validation?.is_valid}
                      className="flex-1"
                    >
                      {generating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Gerando...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Gerar Relatório
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Validation Results */}
                  {validation && (
                    <div className={`p-4 rounded-lg ${
                      validation.is_valid 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center">
                        {validation.is_valid ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mr-2" />
                        )}
                        <p className={`font-medium ${
                          validation.is_valid ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {validation.is_valid ? 'Formulário válido' : 'Formulário inválido'}
                        </p>
                      </div>
                      {validation.errors.length > 0 && (
                        <ul className="mt-2 text-sm text-red-700">
                          {validation.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Selecione um template para configurar o relatório</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportGeneration;