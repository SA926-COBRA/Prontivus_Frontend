import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for Financial and TISS Module
export interface TISSCode {
  id: number;
  code: string;
  description: string;
  category: 'medical_consultation' | 'surgical_procedure' | 'diagnostic_exam' | 'therapeutic_procedure' | 'emergency_care' | 'hospitalization' | 'outpatient_care';
  base_value?: number;
  currency: string;
  unit_of_measure?: string;
  anvisa_authorization: boolean;
  cff_authorization: boolean;
  crm_authorization: boolean;
  tiss_version: string;
  effective_date: string;
  expiry_date?: string;
  requirements?: string;
  contraindications?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TISSProcedure {
  id: number;
  procedure_number: string;
  patient_id: number;
  doctor_id: number;
  tiss_code_id: number;
  procedure_date: string;
  procedure_time?: number;
  medical_indication: string;
  procedure_description?: string;
  results?: string;
  complications?: string;
  base_value: number;
  discount_percentage: number;
  discount_amount: number;
  final_value: number;
  currency: string;
  health_plan_id?: number;
  authorization_number?: string;
  copayment_required: boolean;
  copayment_amount?: number;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled' | 'paid';
  payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  tiss_submission_id?: string;
  tiss_response?: Record<string, any>;
  tiss_errors?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  procedure_id: number;
  patient_id: number;
  health_plan_id?: number;
  invoice_date: string;
  due_date: string;
  payment_date?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  notes?: string;
  payment_method?: string;
  payment_reference?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface Payment {
  id: number;
  payment_number: string;
  invoice_id: number;
  patient_id: number;
  payment_date: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_reference?: string;
  transaction_id?: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  notes?: string;
  processed_by?: number;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface TISSIntegration {
  id: number;
  integration_name: string;
  health_plan_id: number;
  api_endpoint: string;
  api_key?: string;
  api_secret?: string;
  tiss_version: string;
  submission_frequency: 'daily' | 'weekly' | 'monthly';
  auto_submission: boolean;
  is_active: boolean;
  last_sync?: string;
  last_success?: string;
  last_error?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface TISSSubmission {
  id: number;
  submission_id: string;
  integration_id: number;
  procedure_id?: number;
  submission_date: string;
  submission_type: string;
  tiss_xml?: string;
  tiss_response?: string;
  tiss_status?: string;
  tiss_message?: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled' | 'paid';
  processed_at?: string;
  error_code?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
  updated_at?: string;
}

export interface HealthPlanFinancial {
  id: number;
  health_plan_id: number;
  contract_number?: string;
  contract_start_date: string;
  contract_end_date?: string;
  payment_terms?: string;
  discount_percentage: number;
  copayment_percentage: number;
  annual_limit?: number;
  procedure_limit?: number;
  monthly_cap?: number;
  current_balance: number;
  outstanding_amount: number;
  last_payment_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

// Request/Response types
export interface TISSCodeSearchRequest {
  code?: string;
  description?: string;
  category?: string;
  tiss_version?: string;
  is_active?: boolean;
  skip?: number;
  limit?: number;
}

export interface TISSProcedureSearchRequest {
  patient_id?: number;
  doctor_id?: number;
  tiss_code_id?: number;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

export interface InvoiceSearchRequest {
  patient_id?: number;
  health_plan_id?: number;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

export interface PaymentSearchRequest {
  patient_id?: number;
  invoice_id?: number;
  status?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

export interface TISSSubmissionRequest {
  procedure_id: number;
  integration_id: number;
  submission_type?: string;
}

export interface FinancialSummary {
  total_procedures: number;
  total_revenue: number;
  total_payments: number;
  total_outstanding: number;
  procedures_by_status: Record<string, number>;
  revenue_by_category: Record<string, number>;
  payments_by_method: Record<string, number>;
  outstanding_by_health_plan: Record<string, number>;
}

export interface TISSDashboardSummary {
  total_submissions: number;
  successful_submissions: number;
  failed_submissions: number;
  pending_submissions: number;
  submissions_by_status: Record<string, number>;
  recent_submissions: Array<{
    id: number;
    submission_id: string;
    status: string;
    submission_date: string;
    tiss_status?: string;
    tiss_message?: string;
  }>;
  integration_status: Record<string, {
    is_active: boolean;
    last_sync?: string;
    last_success?: string;
    last_error?: string;
  }>;
}

// Financial TISS API Service
class FinancialTISSApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://prontivus-backend-pa1e.onrender.com',
      timeout: 60000, // Increased timeout for financial operations
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

  // TISS Code methods
  async getTISSCodes(params?: TISSCodeSearchRequest): Promise<TISSCode[]> {
    const response = await this.api.get('/api/v1/financial-tiss/tiss-codes', { params });
    return response.data;
  }

  async getTISSCode(id: number): Promise<TISSCode> {
    const response = await this.api.get(`/api/v1/financial-tiss/tiss-codes/${id}`);
    return response.data;
  }

  async createTISSCode(tissCode: Partial<TISSCode>): Promise<TISSCode> {
    const response = await this.api.post('/api/v1/financial-tiss/tiss-codes', tissCode);
    return response.data;
  }

  async updateTISSCode(id: number, tissCode: Partial<TISSCode>): Promise<TISSCode> {
    const response = await this.api.put(`/api/v1/financial-tiss/tiss-codes/${id}`, tissCode);
    return response.data;
  }

  // TISS Procedure methods
  async getTISSProcedures(params?: TISSProcedureSearchRequest): Promise<TISSProcedure[]> {
    const response = await this.api.get('/api/v1/financial-tiss/procedures', { params });
    return response.data;
  }

  async getTISSProcedure(id: number): Promise<TISSProcedure> {
    const response = await this.api.get(`/api/v1/financial-tiss/procedures/${id}`);
    return response.data;
  }

  async createTISSProcedure(procedure: Partial<TISSProcedure>): Promise<TISSProcedure> {
    const response = await this.api.post('/api/v1/financial-tiss/procedures', procedure);
    return response.data;
  }

  async updateTISSProcedure(id: number, procedure: Partial<TISSProcedure>): Promise<TISSProcedure> {
    const response = await this.api.put(`/api/v1/financial-tiss/procedures/${id}`, procedure);
    return response.data;
  }

  // Invoice methods
  async getInvoices(params?: InvoiceSearchRequest): Promise<Invoice[]> {
    const response = await this.api.get('/api/v1/financial-tiss/invoices', { params });
    return response.data;
  }

  async getInvoice(id: number): Promise<Invoice> {
    const response = await this.api.get(`/api/v1/financial-tiss/invoices/${id}`);
    return response.data;
  }

  async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
    const response = await this.api.post('/api/v1/financial-tiss/invoices', invoice);
    return response.data;
  }

  async updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice> {
    const response = await this.api.put(`/api/v1/financial-tiss/invoices/${id}`, invoice);
    return response.data;
  }

  // Payment methods
  async getPayments(params?: PaymentSearchRequest): Promise<Payment[]> {
    const response = await this.api.get('/api/v1/financial-tiss/payments', { params });
    return response.data;
  }

  async getPayment(id: number): Promise<Payment> {
    const response = await this.api.get(`/api/v1/financial-tiss/payments/${id}`);
    return response.data;
  }

  async createPayment(payment: Partial<Payment>): Promise<Payment> {
    const response = await this.api.post('/api/v1/financial-tiss/payments', payment);
    return response.data;
  }

  async updatePayment(id: number, payment: Partial<Payment>): Promise<Payment> {
    const response = await this.api.put(`/api/v1/financial-tiss/payments/${id}`, payment);
    return response.data;
  }

  // TISS Integration methods
  async getTISSIntegrations(params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
  }): Promise<TISSIntegration[]> {
    const response = await this.api.get('/api/v1/financial-tiss/integrations', { params });
    return response.data;
  }

  async getTISSIntegration(id: number): Promise<TISSIntegration> {
    const response = await this.api.get(`/api/v1/financial-tiss/integrations/${id}`);
    return response.data;
  }

  async createTISSIntegration(integration: Partial<TISSIntegration>): Promise<TISSIntegration> {
    const response = await this.api.post('/api/v1/financial-tiss/integrations', integration);
    return response.data;
  }

  async updateTISSIntegration(id: number, integration: Partial<TISSIntegration>): Promise<TISSIntegration> {
    const response = await this.api.put(`/api/v1/financial-tiss/integrations/${id}`, integration);
    return response.data;
  }

  // TISS Submission methods
  async getTISSSubmissions(params?: {
    skip?: number;
    limit?: number;
    integration_id?: number;
    procedure_id?: number;
    status?: string;
  }): Promise<TISSSubmission[]> {
    const response = await this.api.get('/api/v1/financial-tiss/submissions', { params });
    return response.data;
  }

  async getTISSSubmission(id: number): Promise<TISSSubmission> {
    const response = await this.api.get(`/api/v1/financial-tiss/submissions/${id}`);
    return response.data;
  }

  async submitToTISS(request: TISSSubmissionRequest): Promise<TISSSubmission> {
    const response = await this.api.post('/api/v1/financial-tiss/submissions', request);
    return response.data;
  }

  // Summary methods
  async getFinancialSummary(startDate?: string, endDate?: string): Promise<FinancialSummary> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await this.api.get('/api/v1/financial-tiss/financial-summary', { params });
    return response.data;
  }

  async getTISSDashboardSummary(): Promise<TISSDashboardSummary> {
    const response = await this.api.get('/api/v1/financial-tiss/tiss-dashboard-summary');
    return response.data;
  }

  // Utility methods
  async searchTISSCodesByDescription(description: string): Promise<TISSCode[]> {
    return this.getTISSCodes({ description, limit: 50 });
  }

  async searchTISSCodesByCategory(category: string): Promise<TISSCode[]> {
    return this.getTISSCodes({ category, limit: 100 });
  }

  async getActiveTISSCodes(): Promise<TISSCode[]> {
    return this.getTISSCodes({ is_active: true, limit: 1000 });
  }

  async searchProceduresByPatient(patientId: number): Promise<TISSProcedure[]> {
    return this.getTISSProcedures({ patient_id: patientId, limit: 100 });
  }

  async searchProceduresByDoctor(doctorId: number): Promise<TISSProcedure[]> {
    return this.getTISSProcedures({ doctor_id: doctorId, limit: 100 });
  }

  async getPendingProcedures(): Promise<TISSProcedure[]> {
    return this.getTISSProcedures({ status: 'pending', limit: 100 });
  }

  async getApprovedProcedures(): Promise<TISSProcedure[]> {
    return this.getTISSProcedures({ status: 'approved', limit: 100 });
  }

  async searchInvoicesByPatient(patientId: number): Promise<Invoice[]> {
    return this.getInvoices({ patient_id: patientId, limit: 100 });
  }

  async searchInvoicesByHealthPlan(healthPlanId: number): Promise<Invoice[]> {
    return this.getInvoices({ health_plan_id: healthPlanId, limit: 100 });
  }

  async getPendingInvoices(): Promise<Invoice[]> {
    return this.getInvoices({ payment_status: 'pending', limit: 100 });
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    return this.getInvoices({ status: 'overdue', limit: 100 });
  }

  async searchPaymentsByPatient(patientId: number): Promise<Payment[]> {
    return this.getPayments({ patient_id: patientId, limit: 100 });
  }

  async searchPaymentsByInvoice(invoiceId: number): Promise<Payment[]> {
    return this.getPayments({ invoice_id: invoiceId, limit: 100 });
  }

  async getSuccessfulPayments(): Promise<Payment[]> {
    return this.getPayments({ status: 'paid', limit: 100 });
  }

  async getFailedPayments(): Promise<Payment[]> {
    return this.getPayments({ status: 'failed', limit: 100 });
  }

  async getActiveIntegrations(): Promise<TISSIntegration[]> {
    return this.getTISSIntegrations({ is_active: true, limit: 100 });
  }

  async getPendingSubmissions(): Promise<TISSSubmission[]> {
    return this.getTISSSubmissions({ status: 'pending', limit: 100 });
  }

  async getSuccessfulSubmissions(): Promise<TISSSubmission[]> {
    return this.getTISSSubmissions({ status: 'approved', limit: 100 });
  }

  async getFailedSubmissions(): Promise<TISSSubmission[]> {
    return this.getTISSSubmissions({ status: 'rejected', limit: 100 });
  }

  // Quick access methods for common operations
  async getTISSCodeByCode(code: string): Promise<TISSCode | null> {
    try {
      const tissCodes = await this.getTISSCodes({ code, limit: 1 });
      return tissCodes.find(c => c.code === code) || null;
    } catch (error) {
      return null;
    }
  }

  async getProcedureByNumber(procedureNumber: string): Promise<TISSProcedure | null> {
    try {
      const procedures = await this.getTISSProcedures({ limit: 1 });
      return procedures.find(p => p.procedure_number === procedureNumber) || null;
    } catch (error) {
      return null;
    }
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    try {
      const invoices = await this.getInvoices({ limit: 1 });
      return invoices.find(i => i.invoice_number === invoiceNumber) || null;
    } catch (error) {
      return null;
    }
  }

  async getPaymentByNumber(paymentNumber: string): Promise<Payment | null> {
    try {
      const payments = await this.getPayments({ limit: 1 });
      return payments.find(p => p.payment_number === paymentNumber) || null;
    } catch (error) {
      return null;
    }
  }

  // Validation methods
  async validateTISSCode(tissCode: TISSCode): Promise<boolean> {
    try {
      // Check if TISS code has required fields
      if (!tissCode.code || !tissCode.description || !tissCode.category) {
        return false;
      }

      // Check version
      if (!tissCode.tiss_version) {
        return false;
      }

      // Check effective date
      if (!tissCode.effective_date) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validateProcedure(procedure: TISSProcedure): Promise<boolean> {
    try {
      // Check if procedure has required fields
      if (!procedure.patient_id || !procedure.doctor_id || !procedure.tiss_code_id) {
        return false;
      }

      // Check medical indication
      if (!procedure.medical_indication) {
        return false;
      }

      // Check financial values
      if (procedure.base_value <= 0 || procedure.final_value <= 0) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validateInvoice(invoice: Invoice): Promise<boolean> {
    try {
      // Check if invoice has required fields
      if (!invoice.procedure_id || !invoice.patient_id) {
        return false;
      }

      // Check dates
      if (!invoice.invoice_date || !invoice.due_date) {
        return false;
      }

      // Check financial values
      if (invoice.subtotal <= 0 || invoice.total_amount <= 0) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validatePayment(payment: Payment): Promise<boolean> {
    try {
      // Check if payment has required fields
      if (!payment.invoice_id || !payment.patient_id) {
        return false;
      }

      // Check amount
      if (payment.amount <= 0) {
        return false;
      }

      // Check payment method
      if (!payment.payment_method) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const financialTISSApiService = new FinancialTISSApiService();
export default financialTISSApiService;
