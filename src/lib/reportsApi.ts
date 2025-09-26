import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for Reports Module
export interface ReportTemplate {
  id: number;
  name: string;
  description?: string;
  report_type: 'clinical' | 'financial' | 'administrative' | 'commercial' | 'audit' | 'custom';
  template_data?: Record<string, any>;
  is_active: boolean;
  is_system_template: boolean;
  requires_permission: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface GeneratedReport {
  id: number;
  report_number: string;
  template_id: number;
  report_type: 'clinical' | 'financial' | 'administrative' | 'commercial' | 'audit' | 'custom';
  report_format: 'pdf' | 'excel' | 'csv' | 'html';
  parameters?: Record<string, any>;
  date_range_start?: string;
  date_range_end?: string;
  file_name?: string;
  file_path?: string;
  file_size?: number;
  download_count: number;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'expired';
  error_message?: string;
  generated_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface ReportGenerationRequest {
  template_id: number;
  report_format: 'pdf' | 'excel' | 'csv' | 'html';
  parameters?: Record<string, any>;
  date_range_start?: string;
  date_range_end?: string;
  expires_in_hours?: number;
}

export interface BulkReportGenerationRequest {
  reports: ReportGenerationRequest[];
  notify_when_complete: boolean;
}

export interface ReportValidationRequest {
  template_id: number;
  parameters?: Record<string, any>;
}

export interface ReportValidationResponse {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  estimated_generation_time_seconds?: number;
  estimated_file_size_mb?: number;
}

export interface ReportAnalytics {
  total_reports_generated: number;
  reports_by_type: Record<string, number>;
  reports_by_format: Record<string, number>;
  most_used_templates: Array<{
    template_id: number;
    template_name: string;
    count: number;
  }>;
  generation_success_rate: number;
  average_generation_time_seconds: number;
  total_downloads: number;
  reports_generated_last_30_days: number;
}

export interface ReportDashboardStats {
  total_templates: number;
  active_schedules: number;
  pending_reports: number;
  completed_reports_today: number;
  failed_reports_today: number;
  total_downloads_today: number;
  storage_used_mb: number;
  most_popular_template?: string;
  recent_reports: Array<{
    id: number;
    report_number: string;
    report_type: string;
    status: string;
    created_at: string;
  }>;
}

// Reports API Service
class ReportsApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://prontivus-backend-pa1e.onrender.com',
      timeout: 60000, // Increased timeout for report generation
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

  // Report Templates
  async getTemplates(params?: {
    skip?: number;
    limit?: number;
    report_type?: string;
    is_active?: boolean;
  }): Promise<ReportTemplate[]> {
    const response = await this.api.get('/api/v1/reports/templates', { params });
    return response.data;
  }

  async getTemplate(id: number): Promise<ReportTemplate> {
    const response = await this.api.get(`/api/v1/reports/templates/${id}`);
    return response.data;
  }

  async createTemplate(template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const response = await this.api.post('/api/v1/reports/templates', template);
    return response.data;
  }

  async updateTemplate(id: number, template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const response = await this.api.put(`/api/v1/reports/templates/${id}`, template);
    return response.data;
  }

  async deleteTemplate(id: number): Promise<void> {
    await this.api.delete(`/api/v1/reports/templates/${id}`);
  }

  // Report Generation
  async generateReport(request: ReportGenerationRequest): Promise<GeneratedReport> {
    const response = await this.api.post('/api/v1/reports/generate', request);
    return response.data;
  }

  async generateBulkReports(request: BulkReportGenerationRequest): Promise<GeneratedReport[]> {
    const response = await this.api.post('/api/v1/reports/generate/bulk', request);
    return response.data;
  }

  async validateReport(request: ReportValidationRequest): Promise<ReportValidationResponse> {
    const response = await this.api.post('/api/v1/reports/validate', request);
    return response.data;
  }

  // Generated Reports
  async getReports(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    report_type?: string;
    report_format?: string;
  }): Promise<GeneratedReport[]> {
    const response = await this.api.get('/api/v1/reports/reports', { params });
    return response.data;
  }

  async getReport(id: number): Promise<GeneratedReport> {
    const response = await this.api.get(`/api/v1/reports/reports/${id}`);
    return response.data;
  }

  async downloadReport(id: number): Promise<Blob> {
    const response = await this.api.get(`/api/v1/reports/reports/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async deleteReport(id: number): Promise<void> {
    await this.api.delete(`/api/v1/reports/reports/${id}`);
  }

  // Analytics and Dashboard
  async getReportAnalytics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ReportAnalytics> {
    const response = await this.api.get('/api/v1/reports/analytics', { params });
    return response.data;
  }

  async getReportDashboard(): Promise<ReportDashboardStats> {
    const response = await this.api.get('/api/v1/reports/dashboard');
    return response.data;
  }

  // Utility methods
  async downloadReportFile(report: GeneratedReport): Promise<void> {
    try {
      const blob = await this.downloadReport(report.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = report.file_name || `${report.report_number}.${report.report_format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }

  async getReportStatus(id: number): Promise<GeneratedReport> {
    return this.getReport(id);
  }

  async waitForReportCompletion(id: number, maxWaitTime: number = 300000): Promise<GeneratedReport> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const report = await this.getReportStatus(id);
      
      if (report.status === 'completed') {
        return report;
      } else if (report.status === 'failed') {
        throw new Error(`Report generation failed: ${report.error_message}`);
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Report generation timeout');
  }

  // Report type specific methods
  async generateClinicalReport(parameters: {
    patient_ids?: number[];
    doctor_ids?: number[];
    procedure_types?: string[];
    date_range_start?: string;
    date_range_end?: string;
    include_medical_records?: boolean;
    include_prescriptions?: boolean;
  }, format: 'pdf' | 'excel' | 'csv' | 'html' = 'pdf'): Promise<GeneratedReport> {
    // Find clinical template
    const templates = await this.getTemplates({ report_type: 'clinical', is_active: true });
    if (templates.length === 0) {
      throw new Error('No clinical report templates available');
    }
    
    const request: ReportGenerationRequest = {
      template_id: templates[0].id,
      report_format: format,
      parameters: parameters,
      date_range_start: parameters.date_range_start,
      date_range_end: parameters.date_range_end
    };
    
    return this.generateReport(request);
  }

  async generateFinancialReport(parameters: {
    payment_status?: string[];
    payment_methods?: string[];
    date_range_start?: string;
    date_range_end?: string;
    include_taxes?: boolean;
    currency?: string;
  }, format: 'pdf' | 'excel' | 'csv' | 'html' = 'pdf'): Promise<GeneratedReport> {
    // Find financial template
    const templates = await this.getTemplates({ report_type: 'financial', is_active: true });
    if (templates.length === 0) {
      throw new Error('No financial report templates available');
    }
    
    const request: ReportGenerationRequest = {
      template_id: templates[0].id,
      report_format: format,
      parameters: parameters,
      date_range_start: parameters.date_range_start,
      date_range_end: parameters.date_range_end
    };
    
    return this.generateReport(request);
  }

  async generateCommercialReport(parameters: {
    procedure_ids?: number[];
    estimate_status?: string[];
    contract_status?: string[];
    date_range_start?: string;
    date_range_end?: string;
    include_packages?: boolean;
    include_analytics?: boolean;
  }, format: 'pdf' | 'excel' | 'csv' | 'html' = 'pdf'): Promise<GeneratedReport> {
    // Find commercial template
    const templates = await this.getTemplates({ report_type: 'commercial', is_active: true });
    if (templates.length === 0) {
      throw new Error('No commercial report templates available');
    }
    
    const request: ReportGenerationRequest = {
      template_id: templates[0].id,
      report_format: format,
      parameters: parameters,
      date_range_start: parameters.date_range_start,
      date_range_end: parameters.date_range_end
    };
    
    return this.generateReport(request);
  }

  async generateAdministrativeReport(parameters: {
    department_ids?: number[];
    user_roles?: string[];
    date_range_start?: string;
    date_range_end?: string;
    include_audit_logs?: boolean;
    include_performance_metrics?: boolean;
  }, format: 'pdf' | 'excel' | 'csv' | 'html' = 'pdf'): Promise<GeneratedReport> {
    // Find administrative template
    const templates = await this.getTemplates({ report_type: 'administrative', is_active: true });
    if (templates.length === 0) {
      throw new Error('No administrative report templates available');
    }
    
    const request: ReportGenerationRequest = {
      template_id: templates[0].id,
      report_format: format,
      parameters: parameters,
      date_range_start: parameters.date_range_start,
      date_range_end: parameters.date_range_end
    };
    
    return this.generateReport(request);
  }
}

// Export singleton instance
export const reportsApiService = new ReportsApiService();
export default reportsApiService;
