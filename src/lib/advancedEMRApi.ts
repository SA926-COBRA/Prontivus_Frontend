import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for Advanced EMR Module
export interface ControlledPrescription {
  id: number;
  prescription_number: string;
  patient_id: number;
  doctor_id: number;
  medication_name: string;
  generic_name?: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  unit: string;
  control_level: 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'C1' | 'C2' | 'C3' | 'M1' | 'M2';
  anvisa_code?: string;
  controlled_substance: boolean;
  requires_special_authorization: boolean;
  prescription_date: string;
  valid_until?: string;
  refills_allowed: number;
  refills_used: number;
  status: 'draft' | 'active' | 'suspended' | 'completed' | 'cancelled' | 'expired';
  dispensed: boolean;
  dispensed_at?: string;
  dispensed_by?: number;
  digital_signature?: string;
  prescription_hash?: string;
  regulatory_compliance?: Record<string, any>;
  instructions?: string;
  side_effects?: string;
  contraindications?: string;
  interactions?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface PrescriptionRefill {
  id: number;
  prescription_id: number;
  refill_number: number;
  refill_date: string;
  quantity_dispensed: number;
  dispensed_by: number;
  pharmacy_name?: string;
  pharmacy_address?: string;
  patient_identification_verified: boolean;
  prescription_verified: boolean;
  regulatory_compliance_checked: boolean;
  created_at: string;
}

export interface SADT {
  id: number;
  sadt_number: string;
  patient_id: number;
  doctor_id: number;
  sadt_type: 'consultation' | 'procedure' | 'surgery' | 'examination' | 'therapy' | 'emergency';
  procedure_name: string;
  procedure_code?: string;
  description: string;
  clinical_indication: string;
  medical_history?: string;
  current_symptoms?: string;
  physical_examination?: string;
  diagnostic_hypothesis: string;
  requested_date: string;
  scheduled_date?: string;
  authorized_date?: string;
  authorized_by?: number;
  authorization_number?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimated_duration?: number;
  health_plan_id?: number;
  health_plan_authorization?: string;
  copayment_required: boolean;
  copayment_amount?: number;
  procedure_results?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  regulatory_compliance?: Record<string, any>;
  required_documents?: Record<string, any>;
  attached_documents?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface SADTICDCode {
  id: number;
  sadt_id: number;
  icd_code: string;
  icd_category: 'disease' | 'injury' | 'external_cause' | 'procedure' | 'symptom' | 'sign';
  icd_description: string;
  is_primary: boolean;
  severity?: string;
  laterality?: 'Left' | 'Right' | 'Bilateral';
  episode_type?: 'Initial' | 'Subsequent' | 'Sequela';
  created_at: string;
}

export interface ICDCode {
  id: number;
  code: string;
  description: string;
  category: 'disease' | 'injury' | 'external_cause' | 'procedure' | 'symptom' | 'sign';
  parent_code?: string;
  is_leaf: boolean;
  level: number;
  cid10_code?: string;
  cid10_description?: string;
  created_at: string;
  updated_at?: string;
}

export interface MedicalProcedure {
  id: number;
  tuss_code: string;
  procedure_name: string;
  description: string;
  procedure_type: 'consultation' | 'procedure' | 'surgery' | 'examination' | 'therapy' | 'emergency';
  specialty?: string;
  complexity?: 'Simple' | 'Medium' | 'Complex';
  base_value?: number;
  currency: string;
  anvisa_authorization: boolean;
  cff_authorization: boolean;
  crm_authorization: boolean;
  minimum_qualification?: string;
  required_equipment?: Record<string, any>;
  contraindications?: string;
  is_active: boolean;
  effective_date: string;
  expiry_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface HealthPlan {
  id: number;
  plan_name: string;
  plan_code: string;
  plan_type: string;
  coverage_type: string;
  requires_authorization: boolean;
  authorization_timeframe?: number;
  emergency_authorization: boolean;
  copayment_required: boolean;
  copayment_percentage?: number;
  annual_limit?: number;
  procedure_limit?: number;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  is_active: boolean;
  effective_date: string;
  expiry_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface PrescriptionAudit {
  id: number;
  prescription_id: number;
  action: string;
  previous_status?: string;
  new_status?: string;
  performed_by: number;
  performed_at: string;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface SADTAudit {
  id: number;
  sadt_id: number;
  action: string;
  previous_status?: string;
  new_status?: string;
  performed_by: number;
  performed_at: string;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Request/Response types
export interface PrescriptionSearchRequest {
  patient_id?: number;
  doctor_id?: number;
  control_level?: string;
  status?: string;
  medication_name?: string;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

export interface SADTSearchRequest {
  patient_id?: number;
  doctor_id?: number;
  sadt_type?: string;
  status?: string;
  procedure_name?: string;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

export interface ICDCodeSearchRequest {
  code?: string;
  description?: string;
  category?: string;
  parent_code?: string;
  skip?: number;
  limit?: number;
}

export interface PrescriptionDispenseRequest {
  prescription_id: number;
  quantity_dispensed: number;
  pharmacy_name?: string;
  pharmacy_address?: string;
  patient_identification_verified?: boolean;
  prescription_verified?: boolean;
  regulatory_compliance_checked?: boolean;
}

export interface SADTAuthorizationRequest {
  sadt_id: number;
  authorization_number: string;
  authorized_by: number;
  authorized_date: string;
  procedure_results?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
}

export interface PrescriptionSummary {
  total_prescriptions: number;
  active_prescriptions: number;
  controlled_prescriptions: number;
  expired_prescriptions: number;
  prescriptions_by_control_level: Record<string, number>;
  prescriptions_by_status: Record<string, number>;
}

export interface SADTSummary {
  total_sadt: number;
  pending_sadt: number;
  authorized_sadt: number;
  completed_sadt: number;
  sadt_by_type: Record<string, number>;
  sadt_by_status: Record<string, number>;
}

export interface ICDCodeHierarchy {
  code: string;
  description: string;
  category: string;
  level: number;
  children: ICDCodeHierarchy[];
  parent?: ICDCodeHierarchy;
}

// Advanced EMR API Service
class AdvancedEMRApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://prontivus-backend-pa1e.onrender.com',
      timeout: 60000, // Increased timeout for EMR operations
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Controlled Prescription methods
  async getControlledPrescriptions(params?: PrescriptionSearchRequest): Promise<ControlledPrescription[]> {
    const response = await this.api.get('/api/v1/advanced-emr/prescriptions', { params });
    return response.data;
  }

  async getControlledPrescription(id: number): Promise<ControlledPrescription> {
    const response = await this.api.get(`/api/v1/advanced-emr/prescriptions/${id}`);
    return response.data;
  }

  async createControlledPrescription(prescription: Partial<ControlledPrescription>): Promise<ControlledPrescription> {
    const response = await this.api.post('/api/v1/advanced-emr/prescriptions', prescription);
    return response.data;
  }

  async updateControlledPrescription(id: number, prescription: Partial<ControlledPrescription>): Promise<ControlledPrescription> {
    const response = await this.api.put(`/api/v1/advanced-emr/prescriptions/${id}`, prescription);
    return response.data;
  }

  async dispensePrescription(id: number, request: PrescriptionDispenseRequest): Promise<PrescriptionRefill> {
    const response = await this.api.post(`/api/v1/advanced-emr/prescriptions/${id}/dispense`, request);
    return response.data;
  }

  async getPrescriptionRefills(prescriptionId: number): Promise<PrescriptionRefill[]> {
    const response = await this.api.get(`/api/v1/advanced-emr/prescriptions/${prescriptionId}/refills`);
    return response.data;
  }

  async getPrescriptionSummary(): Promise<PrescriptionSummary> {
    const response = await this.api.get('/api/v1/advanced-emr/prescriptions/summary');
    return response.data;
  }

  async getPrescriptionAudit(prescriptionId: number): Promise<PrescriptionAudit[]> {
    const response = await this.api.get(`/api/v1/advanced-emr/prescriptions/${prescriptionId}/audit`);
    return response.data;
  }

  // SADT methods
  async getSADTRequests(params?: SADTSearchRequest): Promise<SADT[]> {
    const response = await this.api.get('/api/v1/advanced-emr/sadt', { params });
    return response.data;
  }

  async getSADTRequest(id: number): Promise<SADT> {
    const response = await this.api.get(`/api/v1/advanced-emr/sadt/${id}`);
    return response.data;
  }

  async createSADTRequest(sadt: Partial<SADT>): Promise<SADT> {
    const response = await this.api.post('/api/v1/advanced-emr/sadt', sadt);
    return response.data;
  }

  async updateSADTRequest(id: number, sadt: Partial<SADT>): Promise<SADT> {
    const response = await this.api.put(`/api/v1/advanced-emr/sadt/${id}`, sadt);
    return response.data;
  }

  async authorizeSADTRequest(id: number, request: SADTAuthorizationRequest): Promise<SADT> {
    const response = await this.api.post(`/api/v1/advanced-emr/sadt/${id}/authorize`, request);
    return response.data;
  }

  async getSADTICDCodes(sadtId: number): Promise<SADTICDCode[]> {
    const response = await this.api.get(`/api/v1/advanced-emr/sadt/${sadtId}/icd-codes`);
    return response.data;
  }

  async addSADTICDCode(sadtId: number, icdCode: Partial<SADTICDCode>): Promise<SADTICDCode> {
    const response = await this.api.post(`/api/v1/advanced-emr/sadt/${sadtId}/icd-codes`, icdCode);
    return response.data;
  }

  async getSADTSummary(): Promise<SADTSummary> {
    const response = await this.api.get('/api/v1/advanced-emr/sadt/summary');
    return response.data;
  }

  async getSADTAudit(sadtId: number): Promise<SADTAudit[]> {
    const response = await this.api.get(`/api/v1/advanced-emr/sadt/${sadtId}/audit`);
    return response.data;
  }

  // ICD Code methods
  async getICDCodes(params?: ICDCodeSearchRequest): Promise<ICDCode[]> {
    const response = await this.api.get('/api/v1/advanced-emr/icd-codes', { params });
    return response.data;
  }

  async getICDCode(id: number): Promise<ICDCode> {
    const response = await this.api.get(`/api/v1/advanced-emr/icd-codes/${id}`);
    return response.data;
  }

  async getICDHierarchy(parentCode?: string): Promise<ICDCodeHierarchy[]> {
    const params = parentCode ? { parent_code: parentCode } : {};
    const response = await this.api.get('/api/v1/advanced-emr/icd-codes/hierarchy', { params });
    return response.data;
  }

  // Medical Procedure methods
  async getMedicalProcedures(params?: {
    skip?: number;
    limit?: number;
    procedure_type?: string;
    specialty?: string;
    is_active?: boolean;
  }): Promise<MedicalProcedure[]> {
    const response = await this.api.get('/api/v1/advanced-emr/procedures', { params });
    return response.data;
  }

  async getMedicalProcedure(id: number): Promise<MedicalProcedure> {
    const response = await this.api.get(`/api/v1/advanced-emr/procedures/${id}`);
    return response.data;
  }

  async createMedicalProcedure(procedure: Partial<MedicalProcedure>): Promise<MedicalProcedure> {
    const response = await this.api.post('/api/v1/advanced-emr/procedures', procedure);
    return response.data;
  }

  async updateMedicalProcedure(id: number, procedure: Partial<MedicalProcedure>): Promise<MedicalProcedure> {
    const response = await this.api.put(`/api/v1/advanced-emr/procedures/${id}`, procedure);
    return response.data;
  }

  // Health Plan methods
  async getHealthPlans(params?: {
    skip?: number;
    limit?: number;
    plan_type?: string;
    coverage_type?: string;
    is_active?: boolean;
  }): Promise<HealthPlan[]> {
    const response = await this.api.get('/api/v1/advanced-emr/health-plans', { params });
    return response.data;
  }

  async getHealthPlan(id: number): Promise<HealthPlan> {
    const response = await this.api.get(`/api/v1/advanced-emr/health-plans/${id}`);
    return response.data;
  }

  async createHealthPlan(healthPlan: Partial<HealthPlan>): Promise<HealthPlan> {
    const response = await this.api.post('/api/v1/advanced-emr/health-plans', healthPlan);
    return response.data;
  }

  async updateHealthPlan(id: number, healthPlan: Partial<HealthPlan>): Promise<HealthPlan> {
    const response = await this.api.put(`/api/v1/advanced-emr/health-plans/${id}`, healthPlan);
    return response.data;
  }

  // Utility methods
  async searchPrescriptionsByPatient(patientId: number): Promise<ControlledPrescription[]> {
    return this.getControlledPrescriptions({ patient_id: patientId, limit: 100 });
  }

  async searchPrescriptionsByDoctor(doctorId: number): Promise<ControlledPrescription[]> {
    return this.getControlledPrescriptions({ doctor_id: doctorId, limit: 100 });
  }

  async getActivePrescriptions(): Promise<ControlledPrescription[]> {
    return this.getControlledPrescriptions({ status: 'active', limit: 100 });
  }

  async getControlledSubstancePrescriptions(): Promise<ControlledPrescription[]> {
    return this.getControlledPrescriptions({ control_level: 'A1', limit: 100 });
  }

  async searchSADTByPatient(patientId: number): Promise<SADT[]> {
    return this.getSADTRequests({ patient_id: patientId, limit: 100 });
  }

  async searchSADTByDoctor(doctorId: number): Promise<SADT[]> {
    return this.getSADTRequests({ doctor_id: doctorId, limit: 100 });
  }

  async getPendingSADTRequests(): Promise<SADT[]> {
    return this.getSADTRequests({ status: 'scheduled', limit: 100 });
  }

  async getAuthorizedSADTRequests(): Promise<SADT[]> {
    return this.getSADTRequests({ status: 'authorized', limit: 100 });
  }

  async searchICDCodesByDescription(description: string): Promise<ICDCode[]> {
    return this.getICDCodes({ description, limit: 50 });
  }

  async searchICDCodesByCategory(category: string): Promise<ICDCode[]> {
    return this.getICDCodes({ category, limit: 100 });
  }

  async getICDCodesByParent(parentCode: string): Promise<ICDCode[]> {
    return this.getICDCodes({ parent_code: parentCode, limit: 100 });
  }

  async getMedicalProceduresBySpecialty(specialty: string): Promise<MedicalProcedure[]> {
    return this.getMedicalProcedures({ specialty, is_active: true, limit: 100 });
  }

  async getMedicalProceduresByType(procedureType: string): Promise<MedicalProcedure[]> {
    return this.getMedicalProcedures({ procedure_type: procedureType, is_active: true, limit: 100 });
  }

  async getActiveHealthPlans(): Promise<HealthPlan[]> {
    return this.getHealthPlans({ is_active: true, limit: 100 });
  }

  async getHealthPlansByType(planType: string): Promise<HealthPlan[]> {
    return this.getHealthPlans({ plan_type: planType, is_active: true, limit: 100 });
  }

  // Quick access methods for common operations
  async getPrescriptionByNumber(prescriptionNumber: string): Promise<ControlledPrescription | null> {
    try {
      const prescriptions = await this.getControlledPrescriptions({ limit: 1 });
      return prescriptions.find(p => p.prescription_number === prescriptionNumber) || null;
    } catch (error) {
      return null;
    }
  }

  async getSADTByNumber(sadtNumber: string): Promise<SADT | null> {
    try {
      const sadtRequests = await this.getSADTRequests({ limit: 1 });
      return sadtRequests.find(s => s.sadt_number === sadtNumber) || null;
    } catch (error) {
      return null;
    }
  }

  async getICDCodeByCode(code: string): Promise<ICDCode | null> {
    try {
      const icdCodes = await this.getICDCodes({ code, limit: 1 });
      return icdCodes.find(c => c.code === code) || null;
    } catch (error) {
      return null;
    }
  }

  async getMedicalProcedureByTUSSCode(tussCode: string): Promise<MedicalProcedure | null> {
    try {
      const procedures = await this.getMedicalProcedures({ limit: 1 });
      return procedures.find(p => p.tuss_code === tussCode) || null;
    } catch (error) {
      return null;
    }
  }

  async getHealthPlanByCode(planCode: string): Promise<HealthPlan | null> {
    try {
      const healthPlans = await this.getHealthPlans({ limit: 1 });
      return healthPlans.find(h => h.plan_code === planCode) || null;
    } catch (error) {
      return null;
    }
  }

  // Validation methods
  async validatePrescriptionCompliance(prescription: ControlledPrescription): Promise<boolean> {
    try {
      // Check if prescription has required fields
      if (!prescription.medication_name || !prescription.dosage || !prescription.frequency) {
        return false;
      }

      // Check control level compliance
      if (prescription.control_level && ['A1', 'A2', 'A3'].includes(prescription.control_level)) {
        if (!prescription.anvisa_code) {
          return false;
        }
      }

      // Check digital signature
      if (!prescription.digital_signature || !prescription.prescription_hash) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validateSADTCompliance(sadt: SADT): Promise<boolean> {
    try {
      // Check if SADT has required fields
      if (!sadt.procedure_name || !sadt.clinical_indication || !sadt.diagnostic_hypothesis) {
        return false;
      }

      // Check procedure code for certain types
      if (sadt.sadt_type === 'procedure' && !sadt.procedure_code) {
        return false;
      }

      // Check authorization for certain types
      if (sadt.sadt_type === 'surgery' && !sadt.authorization_number) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const advancedEMRApiService = new AdvancedEMRApiService();
export default advancedEMRApiService;
