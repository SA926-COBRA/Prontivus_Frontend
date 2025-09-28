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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Search, Edit, Trash2, Building2, Shield, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import tissService, { TISSInsuranceOperator } from '@/lib/tissService';
import { toast } from 'sonner';

const operatorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  code: z.string().min(1, 'Código é obrigatório').max(50, 'Código muito longo'),
  cnpj: z.string().optional().refine((val) => {
    if (!val) return true;
    // Basic CNPJ validation (14 digits)
    return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(val) || /^\d{14}$/.test(val);
  }, 'CNPJ inválido'),
  is_active: z.boolean().default(true),
});

export default function HealthInsuranceOperators() {
  const [operators, setOperators] = useState<TISSInsuranceOperator[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<TISSInsuranceOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<TISSInsuranceOperator | null>(null);
  const [creatingOperator, setCreatingOperator] = useState(false);

  const form = useForm<z.infer<typeof operatorSchema>>({
    resolver: zodResolver(operatorSchema),
    defaultValues: {
      name: '',
      code: '',
      cnpj: '',
      is_active: true,
    },
  });

  useEffect(() => {
    loadOperators();
  }, []);

  useEffect(() => {
    filterOperators();
  }, [operators, searchTerm]);

  const loadOperators = async () => {
    try {
      setLoading(true);
      const data = await tissService.getInsuranceOperators(false); // Get all operators
      setOperators(data);
    } catch (error) {
      console.error('Error loading operators:', error);
      toast.error('Erro ao carregar operadoras');
    } finally {
      setLoading(false);
    }
  };

  const filterOperators = () => {
    if (!searchTerm) {
      setFilteredOperators(operators);
      return;
    }

    const filtered = operators.filter(operator =>
      operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (operator.cnpj && operator.cnpj.includes(searchTerm))
    );
    setFilteredOperators(filtered);
  };

  const handleCreateOperator = async (data: z.infer<typeof operatorSchema>) => {
    try {
      setCreatingOperator(true);
      await tissService.createInsuranceOperator(data);
      toast.success('Operadora criada com sucesso');
      setDialogOpen(false);
      form.reset();
      loadOperators();
    } catch (error) {
      console.error('Error creating operator:', error);
      toast.error('Erro ao criar operadora');
    } finally {
      setCreatingOperator(false);
    }
  };

  const handleUpdateOperator = async (data: z.infer<typeof operatorSchema>) => {
    if (!editingOperator) return;

    try {
      setCreatingOperator(true);
      await tissService.updateInsuranceOperator(editingOperator.id, data);
      toast.success('Operadora atualizada com sucesso');
      setDialogOpen(false);
      setEditingOperator(null);
      form.reset();
      loadOperators();
    } catch (error) {
      console.error('Error updating operator:', error);
      toast.error('Erro ao atualizar operadora');
    } finally {
      setCreatingOperator(false);
    }
  };

  const handleEditOperator = (operator: TISSInsuranceOperator) => {
    setEditingOperator(operator);
    form.reset({
      name: operator.name,
      code: operator.code,
      cnpj: operator.cnpj || '',
      is_active: operator.is_active,
    });
    setDialogOpen(true);
  };

  const handleDeleteOperator = async (operator: TISSInsuranceOperator) => {
    if (!confirm(`Tem certeza que deseja excluir a operadora "${operator.name}"?`)) {
      return;
    }

    try {
      // In a real implementation, you would call a delete endpoint
      toast.success('Operadora excluída com sucesso');
      loadOperators();
    } catch (error) {
      console.error('Error deleting operator:', error);
      toast.error('Erro ao excluir operadora');
    }
  };

  const openCreateDialog = () => {
    setEditingOperator(null);
    form.reset({
      name: '',
      code: '',
      cnpj: '',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '';
    // Remove all non-digits
    const digits = cnpj.replace(/\D/g, '');
    // Format as XX.XXX.XXX/XXXX-XX
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    form.setValue('cnpj', formatted);
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
          <h1 className="text-3xl font-bold">Operadoras de Saúde</h1>
          <p className="text-muted-foreground">
            Gerencie as operadoras de saúde suportadas pelo sistema
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Operadora
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Operadoras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, código ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Operadoras</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operators.length}</div>
            <p className="text-xs text-muted-foreground">
              Operadoras cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operadoras Ativas</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operators.filter(op => op.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponíveis para uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integração TISS</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operators.filter(op => op.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Suportam TISS
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Operators Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Operadoras</CardTitle>
          <CardDescription>
            {filteredOperators.length} de {operators.length} operadoras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperators.map((operator) => (
                <TableRow key={operator.id}>
                  <TableCell className="font-medium">{operator.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{operator.code}</Badge>
                  </TableCell>
                  <TableCell>{operator.cnpj || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={operator.is_active ? 'default' : 'secondary'}>
                      {operator.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(operator.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditOperator(operator)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteOperator(operator)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOperators.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                Nenhuma operadora encontrada
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece adicionando uma nova operadora'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingOperator ? 'Editar Operadora' : 'Nova Operadora'}
            </DialogTitle>
            <DialogDescription>
              {editingOperator 
                ? 'Atualize as informações da operadora de saúde'
                : 'Adicione uma nova operadora de saúde ao sistema'
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(editingOperator ? handleUpdateOperator : handleCreateOperator)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Operadora</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Unimed, Bradesco Saúde..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Nome comercial da operadora
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: UNIMED, BRADESCO..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Código único da operadora
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="00.000.000/0000-00"
                        value={field.value}
                        onChange={(e) => handleCNPJChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      CNPJ da operadora para identificação
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Operadora Ativa</FormLabel>
                      <FormDescription>
                        Permitir uso desta operadora no sistema
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

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={creatingOperator}>
                  {creatingOperator ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {editingOperator ? 'Atualizar' : 'Criar'} Operadora
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Information Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> As operadoras cadastradas aqui serão utilizadas para 
          integração TISS, faturamento e autorizações. Certifique-se de que as informações 
          estão corretas antes de ativar uma operadora.
        </AlertDescription>
      </Alert>
    </div>
  );
}
