import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Send, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Shield,
  QrCode,
  Mail,
  MessageSquare,
  Link,
  User,
  BarChart3,
  Settings,
  Pill,
  FileCheck,
  Eye
} from 'lucide-react';
import { digitalPrescriptionService, DigitalPrescription, PrescriptionAnalytics } from '@/lib/digitalPrescriptionService';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from 'sonner';

const DigitalPrescriptionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<DigitalPrescription[]>([]);
  const [analytics, setAnalytics] = useState<PrescriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPrescriptions, setTotalPrescriptions] = useState(0);

  useEffect(() => {
    loadPrescriptions();
    loadAnalytics();
  }, [currentPage, statusFilter, typeFilter]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (typeFilter !== 'all') {
        params.prescription_type = typeFilter;
      }

      const response = await digitalPrescriptionService.getPrescriptions(params);
      setPrescriptions(response.prescriptions);
      setTotalPrescriptions(response.total);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast.error('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await digitalPrescriptionService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Rascunho', icon: FileText },
      signed: { variant: 'default' as const, label: 'Assinada', icon: CheckCircle },
      delivered: { variant: 'default' as const, label: 'Entregue', icon: Send },
      cancelled: { variant: 'destructive' as const, label: 'Cancelada', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      common: { variant: 'outline' as const, label: 'Comum' },
      controlled: { variant: 'default' as const, label: 'Controlada' },
      antimicrobial: { variant: 'secondary' as const, label: 'Antimicrobiana' },
      c1: { variant: 'destructive' as const, label: 'C1' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.common;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSignPrescription = async (prescriptionId: string) => {
    try {
      await digitalPrescriptionService.signPrescription(prescriptionId);
      toast.success('Receita assinada com sucesso');
      loadPrescriptions();
    } catch (error) {
      console.error('Error signing prescription:', error);
      toast.error('Erro ao assinar receita');
    }
  };

  const handleDeliverPrescription = async (prescriptionId: string, method: string) => {
    try {
      await digitalPrescriptionService.deliverPrescription(prescriptionId, method as any);
      toast.success('Receita enviada com sucesso');
      loadPrescriptions();
    } catch (error) {
      console.error('Error delivering prescription:', error);
      toast.error('Erro ao enviar receita');
    }
  };

  const handleDownloadPDF = async (prescriptionId: string) => {
    try {
      const blob = await digitalPrescriptionService.downloadPrescriptionPDF(prescriptionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receita-${prescriptionId.slice(-8)}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Erro ao baixar PDF');
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.prescription_data.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.prescription_data.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.prescription_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Receitas Digitais</h1>
            <p className="text-muted-foreground">
              Gerencie receitas médicas com assinatura digital ICP-Brasil
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/digital-prescription/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Receita
            </Button>
            <Button variant="outline" onClick={() => navigate('/digital-prescription/templates')}>
              <FileText className="w-4 h-4 mr-2" />
              Modelos
            </Button>
            <Button variant="outline" onClick={() => navigate('/digital-prescription/configuration')}>
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_prescriptions}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.prescriptions_by_status.signed} assinadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receitas Controladas</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.prescriptions_by_type.controlled}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.prescriptions_by_type.antimicrobial} antimicrobianas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entregas</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.prescriptions_by_status.delivered}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.delivery_stats.email} por email
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conformidade</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.compliance_stats.rdc_471_compliant}
                </div>
                <p className="text-xs text-muted-foreground">
                  RDC 471/2021
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Prescriptions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas Digitais</CardTitle>
            <CardDescription>
              Gerencie e monitore suas receitas médicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por paciente, médico ou número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="signed">Assinada</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="common">Comum</SelectItem>
                  <SelectItem value="controlled">Controlada</SelectItem>
                  <SelectItem value="antimicrobial">Antimicrobiana</SelectItem>
                  <SelectItem value="c1">C1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Carregando receitas...</div>
              ) : filteredPrescriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma receita encontrada
                </div>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            Receita #{prescription.prescription_number}
                          </h3>
                          {getStatusBadge(prescription.status)}
                          {getTypeBadge(prescription.prescription_type)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p><strong>Paciente:</strong> {prescription.prescription_data.patient_name}</p>
                          <p><strong>Médico:</strong> {prescription.prescription_data.doctor_name} - CRM {prescription.prescription_data.doctor_crm}</p>
                          <p><strong>Data:</strong> {new Date(prescription.prescription_data.prescription_date).toLocaleDateString()}</p>
                          <p><strong>Medicamentos:</strong> {prescription.prescription_data.medications.length} item(s)</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/digital-prescription/${prescription.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        
                        {prescription.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleSignPrescription(prescription.id)}
                          >
                            <Shield className="w-4 h-4 mr-1" />
                            Assinar
                          </Button>
                        )}
                        
                        {prescription.status === 'signed' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPDF(prescription.id)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeliverPrescription(prescription.id, 'email')}
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Email
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeliverPrescription(prescription.id, 'whatsapp')}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              WhatsApp
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {prescription.digital_signature && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-800">Assinatura Digital ICP-Brasil</span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                          Assinado em: {new Date(prescription.digital_signature.signature_timestamp).toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    {prescription.qr_code_url && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <QrCode className="w-4 h-4" />
                        <span>Código QR disponível para verificação</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPrescriptions > 10 && (
              <div className="flex justify-center mt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {currentPage} de {Math.ceil(totalPrescriptions / 10)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= Math.ceil(totalPrescriptions / 10)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DigitalPrescriptionDashboard;
