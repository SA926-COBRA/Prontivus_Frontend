/**
 * TISS Settings Page - Frontend Component
 * Allows clinics to configure TISS endpoints, credentials, and test connections
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
  Lock
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import tissService from '@/lib/tissService';

interface TISSCredentials {
  id?: number;
  operator_name: string;
  environment: 'homologation' | 'production';
  base_url: string;
  username: string;
  password: string;
  token?: string;
  client_id?: string;
  client_secret?: string;
  scope?: string;
  audience?: string;
  requires_doctor_id: boolean;
  is_active: boolean;
  last_connection_test?: string;
  last_connection_status?: 'success' | 'error' | 'pending';
  last_error_message?: string;
}

interface TISSDoctorCode {
  id?: number;
  doctor_id: number;
  doctor_name: string;
  operator_code: string;
  is_active: boolean;
}

const TISSSettings = () => {
  const [credentials, setCredentials] = useState<TISSCredentials[]>([]);
  const [doctorCodes, setDoctorCodes] = useState<TISSDoctorCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});
  const [activeTab, setActiveTab] = useState('credentials');
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Load TISS data on component mount
  useEffect(() => {
    loadTISSData();
  }, []);

  const loadTISSData = async () => {
    try {
      setLoading(true);
      const [credentialsData, doctorCodesData] = await Promise.all([
        tissService.getCredentialsForSettings(),
        tissService.getDoctorCodesForSettings()
      ]);
      setCredentials(credentialsData);
      setDoctorCodes(doctorCodesData);
    } catch (error) {
      console.error('Error loading TISS data:', error);
      setAlert({ type: 'error', message: 'Erro ao carregar configurações TISS' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredential = () => {
    const newCredential: TISSCredentials = {
      operator_name: '',
      environment: 'homologation',
      base_url: '',
      username: '',
      password: '',
      requires_doctor_id: false,
      is_active: true
    };
    setCredentials([...credentials, newCredential]);
  };

  const handleUpdateCredential = (index: number, field: keyof TISSCredentials, value: any) => {
    const updatedCredentials = [...credentials];
    updatedCredentials[index] = { ...updatedCredentials[index], [field]: value };
    setCredentials(updatedCredentials);
  };

  const handleRemoveCredential = (index: number) => {
    const updatedCredentials = credentials.filter((_, i) => i !== index);
    setCredentials(updatedCredentials);
  };

  const handleTestConnection = async (index: number) => {
    const credential = credentials[index];
    if (!credential.base_url || !credential.username || !credential.password) {
      setAlert({ type: 'error', message: 'Preencha todos os campos obrigatórios' });
      return;
    }

    try {
      setTestingConnection(index);
      const result = await tissService.testCredentialsConnection(credential);
      
      // Update credential with test result
      const updatedCredentials = [...credentials];
      updatedCredentials[index] = {
        ...updatedCredentials[index],
        last_connection_test: new Date().toISOString(),
        last_connection_status: result.success ? 'success' : 'error',
        last_error_message: result.error || undefined
      };
      setCredentials(updatedCredentials);

      setAlert({
        type: result.success ? 'success' : 'error',
        message: result.success ? 'Conexão testada com sucesso!' : `Erro na conexão: ${result.error}`
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      setAlert({ type: 'error', message: 'Erro ao testar conexão' });
    } finally {
      setTestingConnection(null);
    }
  };

  const handleSaveCredentials = async () => {
    try {
      setSaving(true);
      await tissService.saveCredentialsForSettings(credentials);
      setAlert({ type: 'success', message: 'Configurações salvas com sucesso!' });
    } catch (error) {
      console.error('Error saving credentials:', error);
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

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Sucesso</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><RefreshCw className="w-3 h-3 mr-1" />Testando</Badge>;
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
            <h1 className="text-3xl font-bold text-gray-900">Configurações TISS</h1>
            <p className="text-gray-600 mt-2">
              Configure credenciais e endpoints para integração com operadoras de saúde
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Shield className="w-3 h-3 mr-1" />
              Financeiro
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credentials">Credenciais</TabsTrigger>
            <TabsTrigger value="doctors">Códigos de Médicos</TabsTrigger>
          </TabsList>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
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
                  <p>• Configure as credenciais para cada operadora de saúde</p>
                  <p>• Use o ambiente de homologação para testes</p>
                  <p>• Teste a conexão antes de ativar em produção</p>
                  <p>• As senhas são criptografadas e armazenadas com segurança</p>
                </div>
              </CardContent>
            </Card>

            {/* Credentials List */}
            <div className="space-y-4">
              {credentials.map((credential, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {credential.operator_name || `Operadora ${index + 1}`}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(credential.last_connection_status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveCredential(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Operator Name */}
                      <div className="space-y-2">
                        <Label htmlFor={`operator-${index}`}>Nome da Operadora</Label>
                        <Input
                          id={`operator-${index}`}
                          value={credential.operator_name}
                          onChange={(e) => handleUpdateCredential(index, 'operator_name', e.target.value)}
                          placeholder="Ex: Unimed, Bradesco Saúde"
                        />
                      </div>

                      {/* Environment */}
                      <div className="space-y-2">
                        <Label htmlFor={`environment-${index}`}>Ambiente</Label>
                        <select
                          id={`environment-${index}`}
                          value={credential.environment}
                          onChange={(e) => handleUpdateCredential(index, 'environment', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="homologation">Homologação</option>
                          <option value="production">Produção</option>
                        </select>
                      </div>

                      {/* Base URL */}
                      <div className="space-y-2">
                        <Label htmlFor={`url-${index}`}>URL Base</Label>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <Input
                            id={`url-${index}`}
                            value={credential.base_url}
                            onChange={(e) => handleUpdateCredential(index, 'base_url', e.target.value)}
                            placeholder="https://api.operadora.com.br"
                          />
                        </div>
                      </div>

                      {/* Username */}
                      <div className="space-y-2">
                        <Label htmlFor={`username-${index}`}>Usuário</Label>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <Input
                            id={`username-${index}`}
                            value={credential.username}
                            onChange={(e) => handleUpdateCredential(index, 'username', e.target.value)}
                            placeholder="Seu usuário"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <Label htmlFor={`password-${index}`}>Senha</Label>
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                          <Input
                            id={`password-${index}`}
                            type={showPasswords[index] ? 'text' : 'password'}
                            value={credential.password}
                            onChange={(e) => handleUpdateCredential(index, 'password', e.target.value)}
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

                      {/* OAuth Fields */}
                      <div className="space-y-2">
                        <Label htmlFor={`client-id-${index}`}>Client ID (OAuth)</Label>
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-gray-400" />
                          <Input
                            id={`client-id-${index}`}
                            value={credential.client_id || ''}
                            onChange={(e) => handleUpdateCredential(index, 'client_id', e.target.value)}
                            placeholder="Client ID para OAuth"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`client-secret-${index}`}>Client Secret (OAuth)</Label>
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                          <Input
                            id={`client-secret-${index}`}
                            type={showPasswords[index] ? 'text' : 'password'}
                            value={credential.client_secret || ''}
                            onChange={(e) => handleUpdateCredential(index, 'client_secret', e.target.value)}
                            placeholder="Client Secret para OAuth"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={credential.requires_doctor_id}
                          onChange={(e) => handleUpdateCredential(index, 'requires_doctor_id', e.target.checked)}
                        />
                        <span className="text-sm">Requer identificação por médico</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={credential.is_active}
                          onChange={(e) => handleUpdateCredential(index, 'is_active', e.target.checked)}
                        />
                        <span className="text-sm">Ativo</span>
                      </label>
                    </div>

                    {/* Test Connection */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        {credential.last_connection_test && (
                          <p>Último teste: {new Date(credential.last_connection_test).toLocaleString()}</p>
                        )}
                        {credential.last_error_message && (
                          <p className="text-red-600">Erro: {credential.last_error_message}</p>
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

              {/* Add New Credential */}
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-6">
                  <Button
                    onClick={handleAddCredential}
                    variant="outline"
                    className="w-full h-20 border-dashed"
                  >
                    <Settings className="w-6 h-6 mr-2" />
                    Adicionar Nova Operadora
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveCredentials}
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

          {/* Doctor Codes Tab */}
          <TabsContent value="doctors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Códigos de Médicos por Operadora</CardTitle>
                <CardDescription>
                  Configure os códigos específicos de cada médico para cada operadora
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Funcionalidade em desenvolvimento</p>
                  <p className="text-sm">Em breve você poderá configurar códigos específicos para cada médico</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default TISSSettings;
