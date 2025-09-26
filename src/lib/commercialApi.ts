import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for Commercial Module
export interface SurgicalProcedure {
  id: number;
  code: string;
  name: string;
  description?: string;
  procedure_type: 'surgical' | 'diagnostic' | 'therapeutic' | 'cosmetic' | 'emergency';
  category?: string;
  specialty?: string;
  base_price: number;
  min_price?: number;
  max_price?: number;
  currency: string;
  duration_minutes?: number;
  complexity_level?: number;
  requires_anesthesia: boolean;
  requires_hospitalization: boolean;
  recovery_days?: number;
  required_equipment?: string[];
  required_supplies?: string[];
  prerequisites?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface SurgicalEstimate {
  id: number;
  estimate_number: string;
  patient_id: number;
  procedure_id: number;
  doctor_id: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'converted';
  estimated_date?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  base_price: number;
  additional_fees: number;
  discount_percentage: number;
  discount_amount: number;
  total_price: number;
  payment_terms?: string;
  installment_count: number;
  installment_value?: number;
  insurance_covered: boolean;
  insurance_company?: string;
  insurance_authorization?: string;
  copay_amount: number;
  notes?: string;
  special_requirements?: string;
  contraindications?: string;
  valid_until?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface SurgicalContract {
  id: number;
  contract_number: string;
  estimate_id?: number;
  patient_id: number;
  procedure_id: number;
  doctor_id: number;
  status: 'draft' | 'pending_signature' | 'active' | 'completed' | 'cancelled' | 'terminated';
  contract_type: 'standard' | 'emergency' | 'package';
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  payment_schedule?: ContractPaymentSchedule[];
  start_date?: string;
  end_date?: string;
  procedure_date?: string;
  terms_and_conditions?: string;
  cancellation_policy?: string;
  warranty_period_days: number;
  patient_signed: boolean;
  patient_signature_date?: string;
  doctor_approved: boolean;
  doctor_approval_date?: string;
  admin_approved: boolean;
  admin_approval_date?: string;
  special_conditions?: string;
  risk_assessment?: string;
  post_procedure_care?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface ContractPaymentSchedule {
  installment_number: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
}

export interface ContractPayment {
  id: number;
  contract_id: number;
  payment_number: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  reference_number?: string;
  notes?: string;
  processed_by?: number;
  created_at: string;
  updated_at?: string;
}

export interface CommercialPackage {
  id: number;
  package_code: string;
  name: string;
  description?: string;
  procedures: PackageProcedure[];
  total_price: number;
  discount_percentage: number;
  final_price: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  max_uses?: number;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface PackageProcedure {
  procedure_id: number;
  quantity: number;
  custom_price?: number;
}

export interface CommercialDashboardStats {
  total_procedures: number;
  active_estimates: number;
  pending_contracts: number;
  monthly_revenue: number;
  conversion_rate: number;
  average_contract_value: number;
  top_procedures: Array<{
    procedure_id: number;
    procedure_name: string;
    count: number;
    revenue: number;
  }>;
  revenue_trend: Array<{
    date: string;
    revenue: number;
  }>;
}

export interface EstimateAnalytics {
  total_estimates: number;
  converted_estimates: number;
  pending_estimates: number;
  expired_estimates: number;
  average_conversion_time_days: number;
  conversion_rate_by_procedure: Array<{
    procedure_id: number;
    procedure_name: string;
    conversion_rate: number;
  }>;
}

export interface ContractAnalytics {
  total_contracts: number;
  active_contracts: number;
  completed_contracts: number;
  cancelled_contracts: number;
  average_contract_value: number;
  payment_completion_rate: number;
  contracts_by_status: Array<{
    status: string;
    count: number;
  }>;
}

// Commercial API Service
class CommercialApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://prontivus-backend-pa1e.onrender.com',
      timeout: 30000,
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

  // Surgical Procedures
  async getProcedures(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    procedure_type?: string;
    specialty?: string;
    is_active?: boolean;
  }): Promise<SurgicalProcedure[]> {
    const response = await this.api.get('/api/v1/commercial/procedures', { params });
    return response.data;
  }

  async getProcedure(id: number): Promise<SurgicalProcedure> {
    const response = await this.api.get(`/api/v1/commercial/procedures/${id}`);
    return response.data;
  }

  async createProcedure(procedure: Partial<SurgicalProcedure>): Promise<SurgicalProcedure> {
    const response = await this.api.post('/api/v1/commercial/procedures', procedure);
    return response.data;
  }

  async updateProcedure(id: number, procedure: Partial<SurgicalProcedure>): Promise<SurgicalProcedure> {
    const response = await this.api.put(`/api/v1/commercial/procedures/${id}`, procedure);
    return response.data;
  }

  async deleteProcedure(id: number): Promise<void> {
    await this.api.delete(`/api/v1/commercial/procedures/${id}`);
  }

  // Surgical Estimates
  async getEstimates(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    patient_id?: number;
    doctor_id?: number;
    procedure_id?: number;
  }): Promise<SurgicalEstimate[]> {
    const response = await this.api.get('/api/v1/commercial/estimates', { params });
    return response.data;
  }

  async getEstimate(id: number): Promise<SurgicalEstimate> {
    const response = await this.api.get(`/api/v1/commercial/estimates/${id}`);
    return response.data;
  }

  async createEstimate(estimate: Partial<SurgicalEstimate>): Promise<SurgicalEstimate> {
    const response = await this.api.post('/api/v1/commercial/estimates', estimate);
    return response.data;
  }

  async updateEstimate(id: number, estimate: Partial<SurgicalEstimate>): Promise<SurgicalEstimate> {
    const response = await this.api.put(`/api/v1/commercial/estimates/${id}`, estimate);
    return response.data;
  }

  async approveEstimate(id: number): Promise<SurgicalEstimate> {
    const response = await this.api.post(`/api/v1/commercial/estimates/${id}/approve`);
    return response.data;
  }

  async rejectEstimate(id: number, reason?: string): Promise<SurgicalEstimate> {
    const response = await this.api.post(`/api/v1/commercial/estimates/${id}/reject`, { reason });
    return response.data;
  }

  // Surgical Contracts
  async getContracts(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    patient_id?: number;
    doctor_id?: number;
    procedure_id?: number;
  }): Promise<SurgicalContract[]> {
    const response = await this.api.get('/api/v1/commercial/contracts', { params });
    return response.data;
  }

  async getContract(id: number): Promise<SurgicalContract> {
    const response = await this.api.get(`/api/v1/commercial/contracts/${id}`);
    return response.data;
  }

  async createContract(contract: Partial<SurgicalContract>): Promise<SurgicalContract> {
    const response = await this.api.post('/api/v1/commercial/contracts', contract);
    return response.data;
  }

  async updateContract(id: number, contract: Partial<SurgicalContract>): Promise<SurgicalContract> {
    const response = await this.api.put(`/api/v1/commercial/contracts/${id}`, contract);
    return response.data;
  }

  async signContract(id: number): Promise<SurgicalContract> {
    const response = await this.api.post(`/api/v1/commercial/contracts/${id}/sign`);
    return response.data;
  }

  async approveContract(id: number): Promise<SurgicalContract> {
    const response = await this.api.post(`/api/v1/commercial/contracts/${id}/approve`);
    return response.data;
  }

  // Contract Payments
  async getContractPayments(contractId: number): Promise<ContractPayment[]> {
    const response = await this.api.get(`/api/v1/commercial/contracts/${contractId}/payments`);
    return response.data;
  }

  async createContractPayment(contractId: number, payment: Partial<ContractPayment>): Promise<ContractPayment> {
    const response = await this.api.post(`/api/v1/commercial/contracts/${contractId}/payments`, payment);
    return response.data;
  }

  async updateContractPayment(contractId: number, paymentId: number, payment: Partial<ContractPayment>): Promise<ContractPayment> {
    const response = await this.api.put(`/api/v1/commercial/contracts/${contractId}/payments/${paymentId}`, payment);
    return response.data;
  }

  // Commercial Packages
  async getPackages(): Promise<CommercialPackage[]> {
    const response = await this.api.get('/api/v1/commercial/packages');
    return response.data;
  }

  async getPackage(id: number): Promise<CommercialPackage> {
    const response = await this.api.get(`/api/v1/commercial/packages/${id}`);
    return response.data;
  }

  async createPackage(packageData: Partial<CommercialPackage>): Promise<CommercialPackage> {
    const response = await this.api.post('/api/v1/commercial/packages', packageData);
    return response.data;
  }

  async updatePackage(id: number, packageData: Partial<CommercialPackage>): Promise<CommercialPackage> {
    const response = await this.api.put(`/api/v1/commercial/packages/${id}`, packageData);
    return response.data;
  }

  async deletePackage(id: number): Promise<void> {
    await this.api.delete(`/api/v1/commercial/packages/${id}`);
  }

  // Dashboard and Analytics
  async getCommercialDashboard(): Promise<CommercialDashboardStats> {
    const response = await this.api.get('/api/v1/commercial/dashboard');
    return response.data;
  }

  async getEstimateAnalytics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<EstimateAnalytics> {
    const response = await this.api.get('/api/v1/commercial/analytics/estimates', { params });
    return response.data;
  }

  async getContractAnalytics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ContractAnalytics> {
    const response = await this.api.get('/api/v1/commercial/analytics/contracts', { params });
    return response.data;
  }

  // Utility methods
  async searchProcedures(query: string): Promise<SurgicalProcedure[]> {
    const response = await this.api.get('/api/v1/commercial/procedures', {
      params: { search: query, limit: 20 }
    });
    return response.data;
  }

  async getProceduresBySpecialty(specialty: string): Promise<SurgicalProcedure[]> {
    const response = await this.api.get('/api/v1/commercial/procedures', {
      params: { specialty, limit: 100 }
    });
    return response.data;
  }

  async getActiveEstimates(): Promise<SurgicalEstimate[]> {
    const response = await this.api.get('/api/v1/commercial/estimates', {
      params: { status: 'pending', limit: 50 }
    });
    return response.data;
  }

  async getPendingContracts(): Promise<SurgicalContract[]> {
    const response = await this.api.get('/api/v1/commercial/contracts', {
      params: { status: 'pending_signature', limit: 50 }
    });
    return response.data;
  }
}

// Export singleton instance
export const commercialApiService = new CommercialApiService();
export default commercialApiService;
