import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Settings, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import tissService, { 
  TISSDashboardData, 
  TISSOperatorsStatus, 
  TISSCredentials, 
  TISSInsuranceOperator,
  TISSConfiguration 
} from '@/lib/tissService';
import { toast } from 'sonner';

const credentialsSchema = z.object({
  operator_id: z.number().min(1, 'Selecione uma operadora'),
  environment: z.enum(['homologation', 'production']),
  username: z.string().min(1, 'Usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
  token: z.string().optional(),
  homologation_url: z.string().url('URL inválida').optional().or(z.literal('')),
  production_url: z.string().url('URL inválida').optional().or(z.literal('')),
  requires_doctor_identification: z.boolean().default(true),
});

const configurationSchema = z.object({
  is_enabled: z.boolean().default(false),
  default_environment: z.enum(['homologation', 'production']),
  sadt_enabled: z.boolean().default(true),
  sadt_auto_generate: z.boolean().default(false),
  billing_enabled: z.boolean().default(true),
  auto_billing: z.boolean().default(false),
  notify_on_error: z.boolean().default(true),
  notify_email: z.string().email('Email inválido').optional().or(z.literal('')),
});

export default function TISSDashboard() {
  const [dashboardData, setDashboardData] = useState<TISSDashboardData | null>(null);
  const [operatorsStatus, setOperatorsStatus] = useState<TISSOperatorsStatus | null>(null);
  const [credentials, setCredentials] = useState<TISSCredentials[]>([]);
  const [operators, setOperators] = useState<TISSInsuranceOperator[]>([]);
  const [configuration, setConfiguration] = useState<TISSConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingCredentials, setTestingCredentials] = useState<number | null>(null);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const credentialsForm = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      environment: 'homologation',
      requires_doctor_identification: true,
    },
  });

  const configForm = useForm<z.infer<typeof configurationSchema>>({
    resolver: zodResolver(configurationSchema),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboard, status, creds, ops, config] = await Promise.all([
        tissService.getDashboardData(),
        tissService.getOperatorsStatus(),
        tissService.getCredentials(),
        tissService.getInsuranceOperators(),
        tissService.getConfiguration().catch(() => null),
      ]);

      setDashboardData(dashboard);
      setOperatorsStatus(status);
      setCredentials(creds);
      setOperators(ops);
      setConfiguration(config);
    } catch (error) {
      console.error('Error loading TISS data:', error);
      toast.error('Erro ao carregar dados do TISS');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCredentials = async (data: z.infer<typeof credentialsSchema>) => {
    try {
      await tissService.createCredentials(data);
      toast.success('Credenciais criadas com sucesso');
      setCredentialsDialogOpen(false);
      credentialsForm.reset();
      loadData();
    } catch (error) {
      console.error('Error creating credentials:', error);
      toast.error('Erro ao criar credenciais');
    }
  };

  const handleTestCredentials = async (credentialsId: number) => {
    try {
      setTestingCredentials(credentialsId);
      const result = await tissService.testCredentials(credentialsId);
      
      if (result.success) {
        toast.success('Conexão testada com sucesso');
      } else {
        toast.error(`Erro na conexão: ${result.message}`);
      }
      
      loadData();
    } catch (error) {
      console.error('Error testing credentials:', error);
      toast.error('Erro ao testar conexão');
    } finally {
      setTestingCredentials(null);
    }
  };

  const handleUpdateConfiguration = async (data: z.infer<typeof configurationSchema>) => {
    try {
      await tissService.createOrUpdateConfiguration(data);
      toast.success('Configuração atualizada com sucesso');
      setConfigDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error('Erro ao atualizar configuração');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integração TISS</h1>
          <p className="text-muted-foreground">
            Gerenciamento de credenciais e configurações para integração com operadoras de saúde
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configurações TISS</DialogTitle>
                <DialogDescription>
                  Configure as opções globais da integração TISS
                </DialogDescription>
              </DialogHeader>
              <Form {...configForm}>
                <form onSubmit={configForm.handleSubmit(handleUpdateConfiguration)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={configForm.control}
                      name="is_enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Integração Ativa</FormLabel>
                            <FormDescription>
                              Ativar integração TISS para esta clínica
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={configForm.control}
                      name="default_environment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ambiente Padrão</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o ambiente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="homologation">Homologação</SelectItem>
                              <SelectItem value="production">Produção</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={configForm.control}
                      name="sadt_enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">SADT Ativo</FormLabel>
                            <FormDescription>
                              Permitir envio de guias SADT
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={configForm.control}
                      name="billing_enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Faturamento Ativo</FormLabel>
                            <FormDescription>
                              Permitir faturamento automático
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={configForm.control}
                    name="notify_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email para Notificações</FormLabel>
                        <FormControl>
                          <Input placeholder="email@clinica.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Email para receber notificações de erros
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit">Salvar Configurações</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Credencial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Credencial TISS</DialogTitle>
                <DialogDescription>
                  Adicione credenciais para uma operadora de saúde
                </DialogDescription>
              </DialogHeader>
              <Form {...credentialsForm}>
                <form onSubmit={credentialsForm.handleSubmit(handleCreateCredentials)} className="space-y-4">
                  <FormField
                    control={credentialsForm.control}
                    name="operator_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operadora</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a operadora" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {operators.map((operator) => (
                              <SelectItem key={operator.id} value={operator.id.toString()}>
                                {operator.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={credentialsForm.control}
                    name="environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ambiente</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o ambiente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="homologation">Homologação</SelectItem>
                            <SelectItem value="production">Produção</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={credentialsForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="usuário" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={credentialsForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={credentialsForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Token de autenticação" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={credentialsForm.control}
                      name="homologation_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Homologação</FormLabel>
                          <FormControl>
                            <Input placeholder="https://api.homologacao.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={credentialsForm.control}
                      name="production_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Produção</FormLabel>
                          <FormControl>
                            <Input placeholder="https://api.producao.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Criar Credencial</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operadoras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.total_operators || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.active_operators || 0} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credenciais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.total_credentials || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.active_credentials || 0} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.success_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.recent_transactions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      {dashboardData?.last_connection_status && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Status da última conexão: <Badge variant={
              dashboardData.last_connection_status.status === 'success' ? 'default' : 'destructive'
            }>
              {tissService.getConnectionStatusLabel(dashboardData.last_connection_status.status)}
            </Badge>
            {dashboardData.last_connection_status.last_error && (
              <span className="ml-2">- {dashboardData.last_connection_status.last_error}</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="credentials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="credentials">Credenciais</TabsTrigger>
          <TabsTrigger value="status">Status das Operadoras</TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credenciais Configuradas</CardTitle>
              <CardDescription>
                Gerencie as credenciais de acesso às operadoras de saúde
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operadora</TableHead>
                    <TableHead>Ambiente</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Conexão</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credentials.map((cred) => {
                    const operator = operators.find(op => op.id === cred.operator_id);
                    return (
                      <TableRow key={cred.id}>
                        <TableCell className="font-medium">
                          {operator?.name || 'Operadora não encontrada'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {tissService.getEnvironmentLabel(cred.environment)}
                          </Badge>
                        </TableCell>
                        <TableCell>{cred.username}</TableCell>
                        <TableCell>
                          <Badge variant={
                            tissService.getConnectionStatusColor(cred.connection_status) as any
                          }>
                            {tissService.getConnectionStatusLabel(cred.connection_status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {cred.last_connection_success 
                            ? new Date(cred.last_connection_success).toLocaleString('pt-BR')
                            : 'Nunca'
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestCredentials(cred.id)}
                            disabled={testingCredentials === cred.id}
                          >
                            {testingCredentials === cred.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <TestTube className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status das Operadoras</CardTitle>
              <CardDescription>
                Monitoramento em tempo real das conexões com as operadoras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operadora</TableHead>
                    <TableHead>Ambiente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Conexão</TableHead>
                    <TableHead>Erro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operatorsStatus?.operators.map((operator) => (
                    <TableRow key={operator.operator_id}>
                      <TableCell className="font-medium">{operator.operator_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {tissService.getEnvironmentLabel(operator.environment)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {operator.connection_status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : operator.connection_status === 'error' ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <Badge variant={
                            tissService.getConnectionStatusColor(operator.connection_status) as any
                          }>
                            {tissService.getConnectionStatusLabel(operator.connection_status)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {operator.last_connection_success 
                          ? new Date(operator.last_connection_success).toLocaleString('pt-BR')
                          : 'Nunca'
                        }
                      </TableCell>
                      <TableCell className="text-red-500">
                        {operator.last_connection_error || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
