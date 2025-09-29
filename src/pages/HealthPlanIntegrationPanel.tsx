/**
 * Health Plan Integration Panel - Frontend Component
 * Centralized panel for managing all provider APIs (authorizations, eligibility, SADT)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  TestTube, 
  Save,
  RefreshCw,
  AlertTriangle,
  Info,
  Globe,
  Key,
  User,
  Lock,
  Plus,
  Trash2,
  Edit,
  Activity,
  BarChart3,
  Clock,
  Zap,
  Database,
  Network
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

interface HealthPlanProvider {
  id?: number;
  name: string;
  code?: string;
  cnpj?: string;
  website?: string;
  description?: string;
  base_url: string;
  auth_method: 'oauth2' | 'api_key' | 'basic_auth' | 'bearer_token';
  api_version: string;
  
  // OAuth Configuration
  client_id?: string;
  client_secret?: string;
  scope?: string;
  audience?: string;
  authorization_url?: string;
  token_url?: string;
  
  // API Key Configuration
  api_key?: string;
  api_key_header: string;
  
  // Basic Auth Configuration
  username?: string;
  password?: string;
  
  // Bearer Token Configuration
  bearer_token?: string;
  
  // Additional Configuration
  additional_config?: Record<string, any>;
  requires_doctor_id: boolean;
  supports_authorization: boolean;
  supports_eligibility: boolean;
  supports_sadt: boolean;
  
  // Status and Monitoring
  status: 'active' | 'inactive' | 'testing' | 'error';
  connection_timeout: number;
  last_connection_test?: string;
  last_connection_status?: 'success' | 'error' | 'timeout';
  last_error_message?: string;
}

interface DashboardData {
  total_providers: number;
  active_providers: number;
  inactive_providers: number;
  error_providers: number;
  total_requests_today: number;
  successful_requests_today: number;
  failed_requests_today: number;
  average_response_time_ms: number;
  recent_errors: Array<{
    provider_id: number;
    error_message: string;
    timestamp: string;
    request_type: string;
  }>;
  provider_status: Array<{
    id: number;
    name: string;
    status: string;
    last_connection_test?: string;
    last_connection_status?: string;
  }>;
}

const HealthPlanIntegrationPanel = () => {
  const [providers, setProviders] = useState<HealthPlanProvider[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [providersData, dashboardDataResponse] = await Promise.all([
        fetchHealthPlanProviders(),
        fetchDashboardData()
      ]);
      setProviders(providersData);
      setDashboardData(dashboardDataResponse);
    } catch (error) {
      console.error('Error loading health plan data:', error);
      setAlert({ type: 'error', message: 'Erro ao carregar dados de integração' });
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthPlanProviders = async (): Promise<HealthPlanProvider[]> => {
    const response = await fetch('/api/v1/health-plan-integration/providers');
    if (!response.ok) throw new Error('Failed to fetch providers');
    return response.json();
  };

  const fetchDashboardData = async (): Promise<DashboardData> => {
    const response = await fetch('/api/v1/health-plan-integration/dashboard');
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
  };

  const handleAddProvider = () => {
    const newProvider: HealthPlanProvider = {
      name: '',
      base_url: '',
      auth_method: 'oauth2',
      api_version: 'v1',
      api_key_header: 'X-API-Key',
      requires_doctor_id: false,
      supports_authorization: true,
      supports_eligibility: true,
      supports_sadt: true,
      status: 'inactive',
      connection_timeout: 30
    };
    setProviders([...providers, newProvider]);
  };

  const handleUpdateProvider = (index: number, field: keyof HealthPlanProvider, value: any) => {
    const updatedProviders = [...providers];
    updatedProviders[index] = { ...updatedProviders[index], [field]: value };
    setProviders(updatedProviders);
  };

  const handleRemoveProvider = (index: number) => {
    const updatedProviders = providers.filter((_, i) => i !== index);
    setProviders(updatedProviders);
  };

  const handleTestConnection = async (index: number) => {
    const provider = providers[index];
    if (!provider.base_url) {
      setAlert({ type: 'error', message: 'Preencha a URL base' });
      return;
    }

    try {
      setTestingConnection(index);
      const response = await fetch(`/api/v1/health-plan-integration/providers/${provider.id}/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: provider.id })
      });
      
      const result = await response.json();
      
      // Update provider with test result
      const updatedProviders = [...providers];
      updatedProviders[index] = {
        ...updatedProviders[index],
        last_connection_test: new Date().toISOString(),
        last_connection_status: result.success ? 'success' : 'error',
        last_error_message: result.error_message || undefined,
        status: result.success ? 'active' : 'error'
      };
      setProviders(updatedProviders);

      setAlert({
        type: result.success ? 'success' : 'error',
        message: result.success ? 'Conexão testada com sucesso!' : `Erro na conexão: ${result.error_message}`
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      setAlert({ type: 'error', message: 'Erro ao testar conexão' });
    } finally {
      setTestingConnection(null);
    }
  };

  const handleSaveProviders = async () => {
    try {
      setSaving(true);
      for (const provider of providers) {
        if (provider.id) {
          await fetch(`/api/v1/health-plan-integration/providers/${provider.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(provider)
          });
        } else {
          await fetch('/api/v1/health-plan-integration/providers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(provider)
          });
        }
      }
      setAlert({ type: 'success', message: 'Configurações salvas com sucesso!' });
      loadData(); // Reload data
    } catch (error) {
      console.error('Error saving providers:', error);
      setAlert({ type: 'error', message: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (index: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      case 'testing':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><RefreshCw className="w-3 h-3 mr-1" />Testando</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Inativo</Badge>;
    }
  };

  const getConnectionStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Sucesso</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      case 'timeout':
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><Clock className="w-3 h-3 mr-1" />Timeout</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Não testado</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel de Integração com Planos de Saúde</h1>
            <p className="text-gray-600 mt-2">
              Gerencie integrações com múltiplos provedores de planos de saúde
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Network className="w-3 h-3 mr-1" />
              Integrações
            </Badge>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <Alert className={alert.type === 'error' ? 'border-red-200 bg-red-50' : alert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="providers">Provedores</TabsTrigger>
            <TabsTrigger value="authorizations">Autorizações</TabsTrigger>
            <TabsTrigger value="eligibility">Elegibilidade</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {dashboardData && (
              <>
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Provedores</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.total_providers}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.active_providers} ativos
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Requisições Hoje</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.total_requests_today}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.successful_requests_today} bem-sucedidas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData.total_requests_today > 0 
                          ? Math.round((dashboardData.successful_requests_today / dashboardData.total_requests_today) * 100)
                          : 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.failed_requests_today} falhas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Math.round(dashboardData.average_response_time_ms)}ms</div>
                      <p className="text-xs text-muted-foreground">
                        Tempo de resposta
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Provider Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status dos Provedores</CardTitle>
                    <CardDescription>Status atual de todas as integrações</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.provider_status.map((provider) => (
                        <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <div>
                              <p className="font-medium">{provider.name}</p>
                              <p className="text-sm text-gray-500">
                                Último teste: {provider.last_connection_test 
                                  ? new Date(provider.last_connection_test).toLocaleString()
                                  : 'Nunca testado'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(provider.status)}
                            {provider.last_connection_status && getConnectionStatusBadge(provider.last_connection_status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Errors */}
                {dashboardData.recent_errors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Erros Recentes</CardTitle>
                      <CardDescription>Últimos erros de integração</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboardData.recent_errors.map((error, index) => (
                          <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-red-800">{error.error_message}</p>
                                <p className="text-sm text-red-600">
                                  {error.request_type} • {new Date(error.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                Erro
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Instruções
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Configure provedores de planos de saúde (Unimed, Bradesco Saúde, etc.)</p>
                  <p>• Suporte para OAuth2, API Key, Basic Auth e Bearer Token</p>
                  <p>• Teste conexões antes de ativar em produção</p>
                  <p>• Monitore status e logs de todas as integrações</p>
                </div>
              </CardContent>
            </Card>

            {/* Providers List */}
            <div className="space-y-4">
              {providers.map((provider, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {provider.name || `Provedor ${index + 1}`}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(provider.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveProvider(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Basic Information */}
                      <div className="space-y-2">
                        <Label htmlFor={`name-${index}`}>Nome do Provedor</Label>
                        <Input
                          id={`name-${index}`}
                          value={provider.name}
                          onChange={(e) => handleUpdateProvider(index, 'name', e.target.value)}
                          placeholder="Ex: Unimed, Bradesco Saúde"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`code-${index}`}>Código</Label>
                        <Input
                          id={`code-${index}`}
                          value={provider.code || ''}
                          onChange={(e) => handleUpdateProvider(index, 'code', e.target.value)}
                          placeholder="Código único"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`base-url-${index}`}>URL Base</Label>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <Input
                            id={`base-url-${index}`}
                            value={provider.base_url}
                            onChange={(e) => handleUpdateProvider(index, 'base_url', e.target.value)}
                            placeholder="https://api.provedor.com.br"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`auth-method-${index}`}>Método de Autenticação</Label>
                        <select
                          id={`auth-method-${index}`}
                          value={provider.auth_method}
                          onChange={(e) => handleUpdateProvider(index, 'auth_method', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="oauth2">OAuth2</option>
                          <option value="api_key">API Key</option>
                          <option value="basic_auth">Basic Auth</option>
                          <option value="bearer_token">Bearer Token</option>
                        </select>
                      </div>

                      {/* OAuth Configuration */}
                      {provider.auth_method === 'oauth2' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor={`client-id-${index}`}>Client ID</Label>
                            <div className="flex items-center gap-2">
                              <Key className="w-4 h-4 text-gray-400" />
                              <Input
                                id={`client-id-${index}`}
                                value={provider.client_id || ''}
                                onChange={(e) => handleUpdateProvider(index, 'client_id', e.target.value)}
                                placeholder="Client ID para OAuth2"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`client-secret-${index}`}>Client Secret</Label>
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-gray-400" />
                              <Input
                                id={`client-secret-${index}`}
                                type={showPasswords[index] ? 'text' : 'password'}
                                value={provider.client_secret || ''}
                                onChange={(e) => handleUpdateProvider(index, 'client_secret', e.target.value)}
                                placeholder="Client Secret para OAuth2"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => togglePasswordVisibility(index)}
                              >
                                {showPasswords[index] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* API Key Configuration */}
                      {provider.auth_method === 'api_key' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor={`api-key-${index}`}>API Key</Label>
                            <div className="flex items-center gap-2">
                              <Key className="w-4 h-4 text-gray-400" />
                              <Input
                                id={`api-key-${index}`}
                                type={showPasswords[index] ? 'text' : 'password'}
                                value={provider.api_key || ''}
                                onChange={(e) => handleUpdateProvider(index, 'api_key', e.target.value)}
                                placeholder="Sua API Key"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => togglePasswordVisibility(index)}
                              >
                                {showPasswords[index] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`api-key-header-${index}`}>Header da API Key</Label>
                            <Input
                              id={`api-key-header-${index}`}
                              value={provider.api_key_header}
                              onChange={(e) => handleUpdateProvider(index, 'api_key_header', e.target.value)}
                              placeholder="X-API-Key"
                            />
                          </div>
                        </>
                      )}

                      {/* Basic Auth Configuration */}
                      {provider.auth_method === 'basic_auth' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor={`username-${index}`}>Usuário</Label>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <Input
                                id={`username-${index}`}
                                value={provider.username || ''}
                                onChange={(e) => handleUpdateProvider(index, 'username', e.target.value)}
                                placeholder="Seu usuário"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`password-${index}`}>Senha</Label>
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-gray-400" />
                              <Input
                                id={`password-${index}`}
                                type={showPasswords[index] ? 'text' : 'password'}
                                value={provider.password || ''}
                                onChange={(e) => handleUpdateProvider(index, 'password', e.target.value)}
                                placeholder="Sua senha"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => togglePasswordVisibility(index)}
                              >
                                {showPasswords[index] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Bearer Token Configuration */}
                      {provider.auth_method === 'bearer_token' && (
                        <div className="space-y-2">
                          <Label htmlFor={`bearer-token-${index}`}>Bearer Token</Label>
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-gray-400" />
                            <Input
                              id={`bearer-token-${index}`}
                              type={showPasswords[index] ? 'text' : 'password'}
                              value={provider.bearer_token || ''}
                              onChange={(e) => handleUpdateProvider(index, 'bearer_token', e.target.value)}
                              placeholder="Seu Bearer Token"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => togglePasswordVisibility(index)}
                            >
                              {showPasswords[index] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Options */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={provider.requires_doctor_id}
                          onChange={(e) => handleUpdateProvider(index, 'requires_doctor_id', e.target.checked)}
                        />
                        <span className="text-sm">Requer ID do médico</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={provider.supports_authorization}
                          onChange={(e) => handleUpdateProvider(index, 'supports_authorization', e.target.checked)}
                        />
                        <span className="text-sm">Suporte a autorização</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={provider.supports_eligibility}
                          onChange={(e) => handleUpdateProvider(index, 'supports_eligibility', e.target.checked)}
                        />
                        <span className="text-sm">Suporte a elegibilidade</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={provider.supports_sadt}
                          onChange={(e) => handleUpdateProvider(index, 'supports_sadt', e.target.checked)}
                        />
                        <span className="text-sm">Suporte a SADT</span>
                      </label>
                    </div>

                    {/* Test Connection */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        {provider.last_connection_test && (
                          <p>Último teste: {new Date(provider.last_connection_test).toLocaleString()}</p>
                        )}
                        {provider.last_error_message && (
                          <p className="text-red-600">Erro: {provider.last_error_message}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleTestConnection(index)}
                        disabled={testingConnection === index}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {testingConnection === index ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <TestTube className="w-4 h-4 mr-2" />
                        )}
                        Testar Conexão
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add New Provider */}
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-6">
                  <Button
                    onClick={handleAddProvider}
                    variant="outline"
                    className="w-full h-20 border-dashed"
                  >
                    <Plus className="w-6 h-6 mr-2" />
                    Adicionar Novo Provedor
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveProviders}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>

          {/* Authorizations Tab */}
          <TabsContent value="authorizations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Autorizações</CardTitle>
                <CardDescription>
                  Gerencie solicitações de autorização para procedimentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Funcionalidade em desenvolvimento</p>
                  <p className="text-sm">Em breve você poderá gerenciar autorizações de procedimentos</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Eligibility Tab */}
          <TabsContent value="eligibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verificação de Elegibilidade</CardTitle>
                <CardDescription>
                  Verifique a elegibilidade dos pacientes nos planos de saúde
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Funcionalidade em desenvolvimento</p>
                  <p className="text-sm">Em breve você poderá verificar elegibilidade de pacientes</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default HealthPlanIntegrationPanel;
