import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  Shield, 
  Send, 
  Download,
  CheckCircle,
  AlertCircle,
  Pill,
  User,
  Calendar,
  Clock,
  FileCheck,
  QrCode,
  Mail,
  MessageSquare,
  Link,
  Eye
} from 'lucide-react';
import { digitalPrescriptionService, DigitalPrescription, PrescriptionMedication } from '@/lib/digitalPrescriptionService';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'sonner';

const DigitalPrescriptionEditor: React.FC = () => {
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  const navigate = useNavigate();
  const isEditing = !!prescriptionId;
  
  // Prescription state
  const [prescription, setPrescription] = useState<DigitalPrescription | null>(null);
  const [medications, setMedications] = useState<PrescriptionMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    prescription_type: 'common' as 'common' | 'controlled' | 'antimicrobial' | 'c1',
    patient_name: '',
    patient_cpf: '',
    patient_birth_date: '',
    doctor_name: '',
    doctor_crm: '',
    clinic_name: '',
    clinic_address: '',
    prescription_date: new Date().toISOString().split('T')[0],
    instructions: '',
    validity_days: 30
  });
  
  // New medication form
  const [newMedication, setNewMedication] = useState({
    medication_name: '',
    active_ingredient: '',
    dosage: '',
    form: '',
    quantity: 1,
    unit: 'unidade',
    frequency: '',
    duration: '',
    instructions: '',
    controlled_substance: false,
    antimicrobial: false,
    requires_c1_copy: false
  });

  useEffect(() => {
    if (isEditing && prescriptionId) {
      loadPrescription();
    } else {
      setLoading(false);
    }
  }, [prescriptionId, isEditing]);

  const loadPrescription = async () => {
    try {
      setLoading(true);
      const prescriptionData = await digitalPrescriptionService.getPrescription(prescriptionId!);
      setPrescription(prescriptionData);
      
      // Load form data
      setFormData({
        prescription_type: prescriptionData.prescription_type,
        patient_name: prescriptionData.prescription_data.patient_name,
        patient_cpf: prescriptionData.prescription_data.patient_cpf,
        patient_birth_date: prescriptionData.prescription_data.patient_birth_date,
        doctor_name: prescriptionData.prescription_data.doctor_name,
        doctor_crm: prescriptionData.prescription_data.doctor_crm,
        clinic_name: prescriptionData.prescription_data.clinic_name,
        clinic_address: prescriptionData.prescription_data.clinic_address,
        prescription_date: prescriptionData.prescription_data.prescription_date,
        instructions: prescriptionData.prescription_data.instructions,
        validity_days: prescriptionData.prescription_data.validity_days
      });
      
      // Load medications
      const medicationsData = await digitalPrescriptionService.getMedications(prescriptionId!);
      setMedications(medicationsData);
    } catch (error) {
      console.error('Error loading prescription:', error);
      setError('Erro ao carregar receita');
      toast.error('Erro ao carregar receita');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const prescriptionData = {
        doctor_id: '1', // TODO: Get from auth context
        patient_id: '1', // TODO: Get from patient selection
        prescription_type: formData.prescription_type,
        prescription_data: {
          ...formData,
          medications: medications.map(med => ({
            medication_name: med.medication_name,
            active_ingredient: med.active_ingredient,
            dosage: med.dosage,
            form: med.form,
            quantity: med.quantity,
            unit: med.unit,
            frequency: med.frequency,
            duration: med.duration,
            instructions: med.instructions,
            controlled_substance: med.controlled_substance,
            antimicrobial: med.antimicrobial,
            requires_c1_copy: med.requires_c1_copy
          }))
        }
      };

      if (isEditing) {
        await digitalPrescriptionService.updatePrescription(prescriptionId!, prescriptionData);
        toast.success('Receita atualizada com sucesso');
      } else {
        const newPrescription = await digitalPrescriptionService.createPrescription(prescriptionData);
        toast.success('Receita criada com sucesso');
        navigate(`/digital-prescription/${newPrescription.id}`);
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error('Erro ao salvar receita');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMedication = async () => {
    if (!newMedication.medication_name || !newMedication.dosage) {
      toast.error('Preencha pelo menos o nome do medicamento e a dosagem');
      return;
    }

    try {
      if (isEditing && prescriptionId) {
        const medication = await digitalPrescriptionService.addMedication(prescriptionId, newMedication);
        setMedications([...medications, medication]);
      } else {
        // For new prescriptions, add to local state
        const medication: PrescriptionMedication = {
          id: `temp-${Date.now()}`,
          prescription_id: '',
          ...newMedication,
          created_at: new Date().toISOString()
        };
        setMedications([...medications, medication]);
      }
      
      setNewMedication({
        medication_name: '',
        active_ingredient: '',
        dosage: '',
        form: '',
        quantity: 1,
        unit: 'unidade',
        frequency: '',
        duration: '',
        instructions: '',
        controlled_substance: false,
        antimicrobial: false,
        requires_c1_copy: false
      });
      
      toast.success('Medicamento adicionado');
    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error('Erro ao adicionar medicamento');
    }
  };

  const handleRemoveMedication = async (medicationId: string) => {
    try {
      if (isEditing && prescriptionId && !medicationId.startsWith('temp-')) {
        await digitalPrescriptionService.deleteMedication(medicationId);
      }
      
      setMedications(medications.filter(med => med.id !== medicationId));
      toast.success('Medicamento removido');
    } catch (error) {
      console.error('Error removing medication:', error);
      toast.error('Erro ao remover medicamento');
    }
  };

  const handleSignPrescription = async () => {
    try {
      await digitalPrescriptionService.signPrescription(prescriptionId!);
      toast.success('Receita assinada com sucesso');
      loadPrescription();
    } catch (error) {
      console.error('Error signing prescription:', error);
      toast.error('Erro ao assinar receita');
    }
  };

  const handleDeliverPrescription = async (method: string) => {
    try {
      await digitalPrescriptionService.deliverPrescription(prescriptionId!, method as any);
      toast.success('Receita enviada com sucesso');
      loadPrescription();
    } catch (error) {
      console.error('Error delivering prescription:', error);
      toast.error('Erro ao enviar receita');
    }
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando receita...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">{error}</p>
            <Button onClick={() => navigate('/digital-prescription')} className="mt-4">
              Voltar para Receitas
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Receita' : 'Nova Receita'}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              {isEditing && prescription && (
                <>
                  <span className="text-muted-foreground">
                    #{prescription.prescription_number}
                  </span>
                  {getTypeBadge(prescription.prescription_type)}
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/digital-prescription')}>
              Voltar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prescription Type */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.prescription_type}
                  onValueChange={(value: any) => setFormData({ ...formData, prescription_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Receita Comum</SelectItem>
                    <SelectItem value="controlled">Receita Controlada</SelectItem>
                    <SelectItem value="antimicrobial">Receita Antimicrobiana</SelectItem>
                    <SelectItem value="c1">Receita C1 (Duas vias)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dados do Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient_name">Nome Completo</Label>
                    <Input
                      id="patient_name"
                      value={formData.patient_name}
                      onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient_cpf">CPF</Label>
                    <Input
                      id="patient_cpf"
                      value={formData.patient_cpf}
                      onChange={(e) => setFormData({ ...formData, patient_cpf: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient_birth_date">Data de Nascimento</Label>
                    <Input
                      id="patient_birth_date"
                      type="date"
                      value={formData.patient_birth_date}
                      onChange={(e) => setFormData({ ...formData, patient_birth_date: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Doctor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Dados do Médico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor_name">Nome do Médico</Label>
                    <Input
                      id="doctor_name"
                      value={formData.doctor_name}
                      onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor_crm">CRM</Label>
                    <Input
                      id="doctor_crm"
                      value={formData.doctor_crm}
                      onChange={(e) => setFormData({ ...formData, doctor_crm: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic_name">Nome da Clínica</Label>
                  <Input
                    id="clinic_name"
                    value={formData.clinic_name}
                    onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic_address">Endereço da Clínica</Label>
                  <Textarea
                    id="clinic_address"
                    value={formData.clinic_address}
                    onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Medicamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Medication Form */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Adicionar Medicamento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medication_name">Nome do Medicamento</Label>
                      <Input
                        id="medication_name"
                        value={newMedication.medication_name}
                        onChange={(e) => setNewMedication({ ...newMedication, medication_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="active_ingredient">Princípio Ativo</Label>
                      <Input
                        id="active_ingredient"
                        value={newMedication.active_ingredient}
                        onChange={(e) => setNewMedication({ ...newMedication, active_ingredient: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosagem</Label>
                      <Input
                        id="dosage"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="form">Forma Farmacêutica</Label>
                      <Input
                        id="form"
                        value={newMedication.form}
                        onChange={(e) => setNewMedication({ ...newMedication, form: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantidade</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newMedication.quantity}
                        onChange={(e) => setNewMedication({ ...newMedication, quantity: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unidade</Label>
                      <Select
                        value={newMedication.unit}
                        onValueChange={(value) => setNewMedication({ ...newMedication, unit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unidade">Unidade</SelectItem>
                          <SelectItem value="comprimido">Comprimido</SelectItem>
                          <SelectItem value="cápsula">Cápsula</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="mg">mg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequência</Label>
                      <Input
                        id="frequency"
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração</Label>
                      <Input
                        id="duration"
                        value={newMedication.duration}
                        onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medication_instructions">Instruções</Label>
                    <Textarea
                      id="medication_instructions"
                      value={newMedication.instructions}
                      onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddMedication}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Medicamento
                  </Button>
                </div>

                {/* Medications List */}
                <div className="space-y-3">
                  {medications.map((medication) => (
                    <div key={medication.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-medium">{medication.medication_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {medication.dosage} - {medication.form} - {medication.quantity} {medication.unit}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {medication.frequency} por {medication.duration}
                          </p>
                          {medication.instructions && (
                            <p className="text-sm">{medication.instructions}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveMedication(medication.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instruções Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instruções para o Paciente</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      placeholder="Instruções gerais sobre o tratamento..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validity_days">Validade (dias)</Label>
                    <Input
                      id="validity_days"
                      type="number"
                      value={formData.validity_days}
                      onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Prescription Status */}
            {isEditing && prescription && (
              <Card>
                <CardHeader>
                  <CardTitle>Status da Receita</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={
                      prescription.status === 'signed' ? 'default' :
                      prescription.status === 'delivered' ? 'default' :
                      prescription.status === 'cancelled' ? 'destructive' : 'secondary'
                    }>
                      {prescription.status === 'draft' ? 'Rascunho' :
                       prescription.status === 'signed' ? 'Assinada' :
                       prescription.status === 'delivered' ? 'Entregue' : 'Cancelada'}
                    </Badge>
                  </div>
                  
                  {prescription.digital_signature && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">Assinatura Digital</span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Assinado em: {new Date(prescription.digital_signature.signature_timestamp).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {isEditing && prescription && (
              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {prescription.status === 'draft' && (
                    <Button onClick={handleSignPrescription} className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Assinar Receita
                    </Button>
                  )}
                  
                  {prescription.status === 'signed' && (
                    <>
                      <Button onClick={() => handleDeliverPrescription('email')} variant="outline" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar por Email
                      </Button>
                      <Button onClick={() => handleDeliverPrescription('whatsapp')} variant="outline" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Enviar por WhatsApp
                      </Button>
                      <Button onClick={() => handleDeliverPrescription('secure_link')} variant="outline" className="w-full">
                        <Link className="w-4 h-4 mr-2" />
                        Link Seguro
                      </Button>
                    </>
                  )}
                  
                  {prescription.pdf_url && (
                    <Button onClick={() => window.open(prescription.pdf_url, '_blank')} variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar PDF
                    </Button>
                  )}
                  
                  {prescription.qr_code_url && (
                    <Button onClick={() => window.open(prescription.qr_code_url, '_blank')} variant="outline" className="w-full">
                      <QrCode className="w-4 h-4 mr-2" />
                      Ver QR Code
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DigitalPrescriptionEditor;
