import apiService from './api';

export interface DigitalPrescription {
  id: string;
  doctor_id: string;
  patient_id: string;
  prescription_number: string;
  prescription_type: 'common' | 'controlled' | 'antimicrobial' | 'c1';
  status: 'draft' | 'signed' | 'delivered' | 'cancelled';
  prescription_data: {
    patient_name: string;
    patient_cpf: string;
    patient_birth_date: string;
    doctor_name: string;
    doctor_crm: string;
    clinic_name: string;
    clinic_address: string;
    prescription_date: string;
    medications: PrescriptionMedication[];
    instructions: string;
    validity_days: number;
  };
  digital_signature?: {
    signature_id: string;
    certificate_info: {
      subject: string;
      issuer: string;
      valid_from: string;
      valid_to: string;
      serial_number: string;
    };
    signature_timestamp: string;
    signature_hash: string;
  };
  pdf_url?: string;
  qr_code_url?: string;
  verification_url?: string;
  delivery_method?: 'email' | 'whatsapp' | 'secure_link' | 'patient_portal';
  delivery_status?: 'pending' | 'sent' | 'delivered' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface PrescriptionMedication {
  id: string;
  prescription_id: string;
  medication_name: string;
  active_ingredient: string;
  dosage: string;
  form: string;
  quantity: number;
  unit: string;
  frequency: string;
  duration: string;
  instructions: string;
  controlled_substance?: boolean;
  antimicrobial?: boolean;
  requires_c1_copy?: boolean;
  created_at: string;
}

export interface PrescriptionVerification {
  id: string;
  prescription_id: string;
  verification_code: string;
  verification_url: string;
  verified_at?: string;
  verified_by?: string;
  verification_ip?: string;
  verification_user_agent?: string;
  is_valid: boolean;
  created_at: string;
}

export interface PrescriptionConfiguration {
  id: string;
  tenant_id: string;
  clinic_info: {
    name: string;
    address: string;
    phone: string;
    email: string;
    cnpj: string;
    logo_url?: string;
  };
  signature_settings: {
    certificate_type: 'a1' | 'a3' | 'cloud';
    certificate_path?: string;
    certificate_password?: string;
    timestamp_server_url?: string;
    signature_reason: string;
    signature_location: string;
  };
  prescription_settings: {
    default_validity_days: number;
    require_patient_signature: boolean;
    auto_generate_qr_code: boolean;
    include_clinic_header: boolean;
    include_system_footer: boolean;
    watermark_text?: string;
  };
  delivery_settings: {
    default_method: 'email' | 'whatsapp' | 'secure_link' | 'patient_portal';
    email_template?: string;
    whatsapp_template?: string;
    auto_delivery: boolean;
    delivery_notifications: boolean;
  };
  compliance_settings: {
    follow_rdc_471: boolean;
    follow_antimicrobial_rules: boolean;
    require_c1_copies: boolean;
    audit_logging: boolean;
    retention_period_days: number;
  };
  created_at: string;
  updated_at: string;
}

export interface PrescriptionTemplate {
  id: string;
  name: string;
  description: string;
  prescription_type: 'common' | 'controlled' | 'antimicrobial' | 'c1';
  template_data: {
    medications: Array<{
      medication_name: string;
      active_ingredient: string;
      dosage: string;
      form: string;
      quantity: number;
      unit: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
    instructions: string;
    validity_days: number;
  };
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionAnalytics {
  total_prescriptions: number;
  prescriptions_by_type: {
    common: number;
    controlled: number;
    antimicrobial: number;
    c1: number;
  };
  prescriptions_by_status: {
    draft: number;
    signed: number;
    delivered: number;
    cancelled: number;
  };
  delivery_stats: {
    email: number;
    whatsapp: number;
    secure_link: number;
    patient_portal: number;
  };
  signature_stats: {
    total_signed: number;
    signature_failures: number;
    average_signature_time: number;
  };
  compliance_stats: {
    rdc_471_compliant: number;
    antimicrobial_compliant: number;
    c1_copies_generated: number;
  };
  monthly_stats: Array<{
    month: string;
    prescriptions: number;
    signatures: number;
    deliveries: number;
  }>;
}

class DigitalPrescriptionService {
  // Prescriptions
  async getPrescriptions(params?: {
    doctor_id?: string;
    patient_id?: string;
    prescription_type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ prescriptions: DigitalPrescription[]; total: number }> {
    const response = await apiService.api.get('/api/v1/digital-prescription/prescriptions', { params });
    return response.data;
  }

  async getPrescription(prescriptionId: string): Promise<DigitalPrescription> {
    const response = await apiService.api.get(`/api/v1/digital-prescription/prescriptions/${prescriptionId}`);
    return response.data;
  }

  async createPrescription(data: {
    doctor_id: string;
    patient_id: string;
    prescription_type: 'common' | 'controlled' | 'antimicrobial' | 'c1';
    prescription_data: DigitalPrescription['prescription_data'];
  }): Promise<DigitalPrescription> {
    const response = await apiService.api.post('/api/v1/digital-prescription/prescriptions', data);
    return response.data;
  }

  async updatePrescription(prescriptionId: string, data: Partial<DigitalPrescription>): Promise<DigitalPrescription> {
    const response = await apiService.api.put(`/api/v1/digital-prescription/prescriptions/${prescriptionId}`, data);
    return response.data;
  }

  async deletePrescription(prescriptionId: string): Promise<void> {
    await apiService.api.delete(`/api/v1/digital-prescription/prescriptions/${prescriptionId}`);
  }

  // Prescription Actions
  async signPrescription(prescriptionId: string, certificateData?: {
    certificate_file?: File;
    certificate_password?: string;
  }): Promise<DigitalPrescription> {
    const formData = new FormData();
    
    if (certificateData?.certificate_file) {
      formData.append('certificate_file', certificateData.certificate_file);
    }
    
    if (certificateData?.certificate_password) {
      formData.append('certificate_password', certificateData.certificate_password);
    }

    const response = await apiService.api.post(`/api/v1/digital-prescription/prescriptions/${prescriptionId}/sign`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deliverPrescription(prescriptionId: string, method: 'email' | 'whatsapp' | 'secure_link' | 'patient_portal', data?: {
    email?: string;
    phone?: string;
    message?: string;
  }): Promise<{ delivery_id: string; status: string }> {
    const response = await apiService.api.post(`/api/v1/digital-prescription/prescriptions/${prescriptionId}/deliver`, {
      method,
      ...data
    });
    return response.data;
  }

  async downloadPrescriptionPDF(prescriptionId: string): Promise<Blob> {
    const response = await apiService.api.get(`/api/v1/digital-prescription/prescriptions/${prescriptionId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Medications
  async getMedications(prescriptionId: string): Promise<PrescriptionMedication[]> {
    const response = await apiService.api.get(`/api/v1/digital-prescription/prescriptions/${prescriptionId}/medications`);
    return response.data;
  }

  async addMedication(prescriptionId: string, data: Omit<PrescriptionMedication, 'id' | 'prescription_id' | 'created_at'>): Promise<PrescriptionMedication> {
    const response = await apiService.api.post(`/api/v1/digital-prescription/prescriptions/${prescriptionId}/medications`, data);
    return response.data;
  }

  async updateMedication(medicationId: string, data: Partial<PrescriptionMedication>): Promise<PrescriptionMedication> {
    const response = await apiService.api.put(`/api/v1/digital-prescription/medications/${medicationId}`, data);
    return response.data;
  }

  async deleteMedication(medicationId: string): Promise<void> {
    await apiService.api.delete(`/api/v1/digital-prescription/medications/${medicationId}`);
  }

  // Verification
  async verifyPrescription(verificationCode: string): Promise<{
    prescription: DigitalPrescription;
    verification: PrescriptionVerification;
    is_valid: boolean;
  }> {
    const response = await apiService.api.get(`/api/v1/digital-prescription/verify/${verificationCode}`);
    return response.data;
  }

  async getVerificationHistory(prescriptionId: string): Promise<PrescriptionVerification[]> {
    const response = await apiService.api.get(`/api/v1/digital-prescription/prescriptions/${prescriptionId}/verifications`);
    return response.data;
  }

  // Configuration
  async getConfiguration(): Promise<PrescriptionConfiguration> {
    const response = await apiService.api.get('/api/v1/digital-prescription/configuration');
    return response.data;
  }

  async updateConfiguration(data: Partial<PrescriptionConfiguration>): Promise<PrescriptionConfiguration> {
    const response = await apiService.api.put('/api/v1/digital-prescription/configuration', data);
    return response.data;
  }

  async testSignature(): Promise<{
    success: boolean;
    message: string;
    certificate_info?: {
      subject: string;
      issuer: string;
      valid_from: string;
      valid_to: string;
    };
  }> {
    const response = await apiService.api.post('/api/v1/digital-prescription/configuration/test-signature');
    return response.data;
  }

  // Templates
  async getTemplates(prescriptionType?: string): Promise<PrescriptionTemplate[]> {
    const params = prescriptionType ? { prescription_type: prescriptionType } : {};
    const response = await apiService.api.get('/api/v1/digital-prescription/templates', { params });
    return response.data;
  }

  async getTemplate(templateId: string): Promise<PrescriptionTemplate> {
    const response = await apiService.api.get(`/api/v1/digital-prescription/templates/${templateId}`);
    return response.data;
  }

  async createTemplate(data: Omit<PrescriptionTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<PrescriptionTemplate> {
    const response = await apiService.api.post('/api/v1/digital-prescription/templates', data);
    return response.data;
  }

  async updateTemplate(templateId: string, data: Partial<PrescriptionTemplate>): Promise<PrescriptionTemplate> {
    const response = await apiService.api.put(`/api/v1/digital-prescription/templates/${templateId}`, data);
    return response.data;
  }

  async deleteTemplate(templateId: string): Promise<void> {
    await apiService.api.delete(`/api/v1/digital-prescription/templates/${templateId}`);
  }

  // Analytics
  async getAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    doctor_id?: string;
  }): Promise<PrescriptionAnalytics> {
    const response = await apiService.api.get('/api/v1/digital-prescription/analytics', { params });
    return response.data;
  }

  // Utility Methods
  async validateMedication(data: {
    medication_name: string;
    dosage: string;
    prescription_type: string;
  }): Promise<{
    valid: boolean;
    warnings: string[];
    suggestions: string[];
  }> {
    const response = await apiService.api.post('/api/v1/digital-prescription/validate-medication', data);
    return response.data;
  }

  async getMedicationDatabase(searchTerm: string): Promise<Array<{
    name: string;
    active_ingredient: string;
    form: string;
    controlled_substance: boolean;
    antimicrobial: boolean;
  }>> {
    const response = await apiService.api.get('/api/v1/digital-prescription/medication-database', {
      params: { search: searchTerm }
    });
    return response.data;
  }

  async generatePrescriptionNumber(): Promise<{ prescription_number: string }> {
    const response = await apiService.api.post('/api/v1/digital-prescription/generate-number');
    return response.data;
  }

  // Compliance
  async checkCompliance(prescriptionId: string): Promise<{
    rdc_471_compliant: boolean;
    antimicrobial_compliant: boolean;
    c1_required: boolean;
    warnings: string[];
    errors: string[];
  }> {
    const response = await apiService.api.get(`/api/v1/digital-prescription/prescriptions/${prescriptionId}/compliance`);
    return response.data;
  }

  // Public Verification (no auth required)
  async verifyPrescriptionPublic(verificationCode: string): Promise<{
    prescription: DigitalPrescription;
    is_valid: boolean;
    verification_date: string;
  }> {
    const response = await apiService.api.get(`/api/v1/public/prescription/verify/${verificationCode}`);
    return response.data;
  }
}

export const digitalPrescriptionService = new DigitalPrescriptionService();
export default digitalPrescriptionService;
