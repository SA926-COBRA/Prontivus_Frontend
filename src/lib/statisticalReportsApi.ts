import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for Statistical Reports Module
export interface StatisticalReport {
  id: number;
  report_name: string;
  report_type: 'clinical' | 'financial' | 'operational' | 'quality' | 'compliance' | 'custom';
  description?: string;
  report_format: 'pdf' | 'excel' | 'csv' | 'html' | 'json';
  template_id?: number;
  parameters?: Record<string, any>;
  data_source: string;
  query_filters?: Record<string, any>;
  date_range_start?: string;
  date_range_end?: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  scheduled_time?: string;
  auto_generate: boolean;
  status: 'draft' | 'generating' | 'completed' | 'failed' | 'cancelled';
  last_generated?: string;
  next_generation?: string;
  generation_count: number;
  file_path?: string;
  file_size?: number;
  download_count: number;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface ReportTemplate {
  id: number;
  template_name: string;
  template_type: 'clinical' | 'financial' | 'operational' | 'quality' | 'compliance' | 'custom';
  description?: string;
  template_content: string;
  css_styles?: string;
  header_template?: string;
  footer_template?: string;
  page_size: string;
  orientation: 'portrait' | 'landscape';
  margins?: Record<string, any>;
  default_parameters?: Record<string, any>;
  default_filters?: Record<string, any>;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface ReportGeneration {
  id: number;
  report_id: number;
  generation_start: string;
  generation_end?: string;
  status: 'draft' | 'generating' | 'completed' | 'failed' | 'cancelled';
  parameters_used?: Record<string, any>;
  filters_applied?: Record<string, any>;
  date_range_used?: Record<string, any>;
  records_processed: number;
  file_path?: string;
  file_size?: number;
  error_message?: string;
  generation_time_seconds?: number;
  memory_used_mb?: number;
  created_at: string;
  generated_by?: number;
}

export interface ReportMetric {
  id: number;
  metric_name: string;
  metric_type: string;
  description?: string;
  data_source: string;
  calculation_query?: string;
  calculation_formula?: string;
  unit?: string;
  display_format?: string;
  decimal_places: number;
  show_trend: boolean;
  show_comparison: boolean;
  warning_threshold?: number;
  critical_threshold?: number;
  alert_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface ReportMetricValue {
  id: number;
  metric_id: number;
  value: number;
  period_start: string;
  period_end: string;
  period_type: string;
  raw_data?: Record<string, any>;
  metadata?: Record<string, any>;
  previous_value?: number;
  change_percentage?: number;
  trend_direction?: 'up' | 'down' | 'stable';
  calculated_at: string;
}

export interface ReportDashboard {
  id: number;
  dashboard_name: string;
  description?: string;
  layout_config: Record<string, any>;
  widgets: Record<string, any>;
  filters?: Record<string, any>;
  refresh_interval: number;
  auto_refresh: boolean;
  show_filters: boolean;
  is_public: boolean;
  allowed_roles?: string[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface ReportAccessLog {
  id: number;
  report_id?: number;
  dashboard_id?: number;
  access_type: string;
  user_id?: number;
  ip_address?: string;
  user_agent?: string;
  access_time: string;
  duration_seconds?: number;
  success: boolean;
  error_message?: string;
  parameters_used?: Record<string, any>;
  filters_applied?: Record<string, any>;
}

export interface ReportSchedule {
  id: number;
  report_id: number;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  scheduled_time?: string;
  timezone: string;
  start_date: string;
  end_date?: string;
  last_run?: string;
  next_run?: string;
  is_active: boolean;
  run_count: number;
  success_count: number;
  failure_count: number;
  notify_on_success: boolean;
  notify_on_failure: boolean;
  notification_emails?: string[];
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

// Request/Response types
export interface ReportSearchRequest {
  report_name?: string;
  report_type?: string;
  status?: string;
  created_by?: number;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

export interface ReportGenerationRequest {
  report_id: number;
  parameters?: Record<string, any>;
  filters?: Record<string, any>;
  date_range_start?: string;
  date_range_end?: string;
  format?: 'pdf' | 'excel' | 'csv' | 'html' | 'json';
}

export interface MetricCalculationRequest {
  metric_id: number;
  period_start: string;
  period_end: string;
  period_type?: string;
  include_trend?: boolean;
  include_comparison?: boolean;
}

export interface DashboardDataRequest {
  dashboard_id: number;
  filters?: Record<string, any>;
  refresh_data?: boolean;
}

export interface ReportSummary {
  total_reports: number;
  active_reports: number;
  reports_by_type: Record<string, number>;
  reports_by_status: Record<string, number>;
  total_generations: number;
  successful_generations: number;
  failed_generations: number;
  total_downloads: number;
}

export interface ReportAnalytics {
  total_reports: number;
  reports_generated_today: number;
  reports_generated_this_week: number;
  reports_generated_this_month: number;
  most_accessed_reports: Array<{
    id: number;
    name: string;
    downloads: number;
    type: string;
  }>;
  generation_success_rate: number;
  average_generation_time: number;
  top_report_types: Array<{
    type: string;
    count: number;
  }>;
  user_activity: Array<{
    user_id: number;
    generations: number;
  }>;
}

// Statistical Reports API Service
class StatisticalReportsApiService {
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

  // Statistical Report methods
  async getStatisticalReports(params?: ReportSearchRequest): Promise<StatisticalReport[]> {
    const response = await this.api.get('/api/v1/statistical-reports/reports', { params });
    return response.data;
  }

  async getStatisticalReport(id: number): Promise<StatisticalReport> {
    const response = await this.api.get(`/api/v1/statistical-reports/reports/${id}`);
    return response.data;
  }

  async createStatisticalReport(report: Partial<StatisticalReport>): Promise<StatisticalReport> {
    const response = await this.api.post('/api/v1/statistical-reports/reports', report);
    return response.data;
  }

  async updateStatisticalReport(id: number, report: Partial<StatisticalReport>): Promise<StatisticalReport> {
    const response = await this.api.put(`/api/v1/statistical-reports/reports/${id}`, report);
    return response.data;
  }

  async deleteStatisticalReport(id: number): Promise<void> {
    await this.api.delete(`/api/v1/statistical-reports/reports/${id}`);
  }

  // Report Generation methods
  async generateReport(request: ReportGenerationRequest): Promise<ReportGeneration> {
    const response = await this.api.post(`/api/v1/statistical-reports/reports/${request.report_id}/generate`, request);
    return response.data;
  }

  async getReportGenerations(reportId: number): Promise<ReportGeneration[]> {
    const response = await this.api.get(`/api/v1/statistical-reports/reports/${reportId}/generations`);
    return response.data;
  }

  // Report Template methods
  async getReportTemplates(params?: {
    skip?: number;
    limit?: number;
    template_type?: string;
    is_active?: boolean;
  }): Promise<ReportTemplate[]> {
    const response = await this.api.get('/api/v1/statistical-reports/templates', { params });
    return response.data;
  }

  async getReportTemplate(id: number): Promise<ReportTemplate> {
    const response = await this.api.get(`/api/v1/statistical-reports/templates/${id}`);
    return response.data;
  }

  async createReportTemplate(template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const response = await this.api.post('/api/v1/statistical-reports/templates', template);
    return response.data;
  }

  async updateReportTemplate(id: number, template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const response = await this.api.put(`/api/v1/statistical-reports/templates/${id}`, template);
    return response.data;
  }

  // Report Metric methods
  async getReportMetrics(params?: {
    skip?: number;
    limit?: number;
    metric_type?: string;
    is_active?: boolean;
  }): Promise<ReportMetric[]> {
    const response = await this.api.get('/api/v1/statistical-reports/metrics', { params });
    return response.data;
  }

  async getReportMetric(id: number): Promise<ReportMetric> {
    const response = await this.api.get(`/api/v1/statistical-reports/metrics/${id}`);
    return response.data;
  }

  async createReportMetric(metric: Partial<ReportMetric>): Promise<ReportMetric> {
    const response = await this.api.post('/api/v1/statistical-reports/metrics', metric);
    return response.data;
  }

  async updateReportMetric(id: number, metric: Partial<ReportMetric>): Promise<ReportMetric> {
    const response = await this.api.put(`/api/v1/statistical-reports/metrics/${id}`, metric);
    return response.data;
  }

  // Metric Calculation methods
  async calculateMetric(request: MetricCalculationRequest): Promise<ReportMetricValue> {
    const response = await this.api.post(`/api/v1/statistical-reports/metrics/${request.metric_id}/calculate`, request);
    return response.data;
  }

  async getMetricValues(metricId: number, params?: {
    skip?: number;
    limit?: number;
  }): Promise<ReportMetricValue[]> {
    const response = await this.api.get(`/api/v1/statistical-reports/metrics/${metricId}/values`, { params });
    return response.data;
  }

  // Report Dashboard methods
  async getReportDashboards(params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    is_public?: boolean;
  }): Promise<ReportDashboard[]> {
    const response = await this.api.get('/api/v1/statistical-reports/dashboards', { params });
    return response.data;
  }

  async getReportDashboard(id: number): Promise<ReportDashboard> {
    const response = await this.api.get(`/api/v1/statistical-reports/dashboards/${id}`);
    return response.data;
  }

  async createReportDashboard(dashboard: Partial<ReportDashboard>): Promise<ReportDashboard> {
    const response = await this.api.post('/api/v1/statistical-reports/dashboards', dashboard);
    return response.data;
  }

  async updateReportDashboard(id: number, dashboard: Partial<ReportDashboard>): Promise<ReportDashboard> {
    const response = await this.api.put(`/api/v1/statistical-reports/dashboards/${id}`, dashboard);
    return response.data;
  }

  // Dashboard Data methods
  async getDashboardData(request: DashboardDataRequest): Promise<Record<string, any>> {
    const response = await this.api.post(`/api/v1/statistical-reports/dashboards/${request.dashboard_id}/data`, request);
    return response.data;
  }

  // Summary and Analytics methods
  async getReportSummary(): Promise<ReportSummary> {
    const response = await this.api.get('/api/v1/statistical-reports/summary');
    return response.data;
  }

  async getReportAnalytics(): Promise<ReportAnalytics> {
    const response = await this.api.get('/api/v1/statistical-reports/analytics');
    return response.data;
  }

  // Utility methods
  async searchReportsByType(reportType: string): Promise<StatisticalReport[]> {
    return this.getStatisticalReports({ report_type: reportType, limit: 100 });
  }

  async searchReportsByStatus(status: string): Promise<StatisticalReport[]> {
    return this.getStatisticalReports({ status, limit: 100 });
  }

  async getActiveReports(): Promise<StatisticalReport[]> {
    return this.getStatisticalReports({ status: 'completed', limit: 100 });
  }

  async getDraftReports(): Promise<StatisticalReport[]> {
    return this.getStatisticalReports({ status: 'draft', limit: 100 });
  }

  async getFailedReports(): Promise<StatisticalReport[]> {
    return this.getStatisticalReports({ status: 'failed', limit: 100 });
  }

  async getActiveTemplates(): Promise<ReportTemplate[]> {
    return this.getReportTemplates({ is_active: true, limit: 100 });
  }

  async getTemplatesByType(templateType: string): Promise<ReportTemplate[]> {
    return this.getReportTemplates({ template_type: templateType, limit: 100 });
  }

  async getActiveMetrics(): Promise<ReportMetric[]> {
    return this.getReportMetrics({ is_active: true, limit: 100 });
  }

  async getMetricsByType(metricType: string): Promise<ReportMetric[]> {
    return this.getReportMetrics({ metric_type: metricType, limit: 100 });
  }

  async getActiveDashboards(): Promise<ReportDashboard[]> {
    return this.getReportDashboards({ is_active: true, limit: 100 });
  }

  async getPublicDashboards(): Promise<ReportDashboard[]> {
    return this.getReportDashboards({ is_public: true, limit: 100 });
  }

  // Quick access methods for common operations
  async getReportByName(reportName: string): Promise<StatisticalReport | null> {
    try {
      const reports = await this.getStatisticalReports({ report_name: reportName, limit: 1 });
      return reports.find(r => r.report_name === reportName) || null;
    } catch (error) {
      return null;
    }
  }

  async getTemplateByName(templateName: string): Promise<ReportTemplate | null> {
    try {
      const templates = await this.getReportTemplates({ limit: 1 });
      return templates.find(t => t.template_name === templateName) || null;
    } catch (error) {
      return null;
    }
  }

  async getMetricByName(metricName: string): Promise<ReportMetric | null> {
    try {
      const metrics = await this.getReportMetrics({ limit: 1 });
      return metrics.find(m => m.metric_name === metricName) || null;
    } catch (error) {
      return null;
    }
  }

  async getDashboardByName(dashboardName: string): Promise<ReportDashboard | null> {
    try {
      const dashboards = await this.getReportDashboards({ limit: 1 });
      return dashboards.find(d => d.dashboard_name === dashboardName) || null;
    } catch (error) {
      return null;
    }
  }

  // Validation methods
  async validateReport(report: StatisticalReport): Promise<boolean> {
    try {
      // Check if report has required fields
      if (!report.report_name || !report.report_type || !report.data_source) {
        return false;
      }

      // Check report format
      if (!['pdf', 'excel', 'csv', 'html', 'json'].includes(report.report_format)) {
        return false;
      }

      // Check frequency
      if (!['once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(report.frequency)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validateTemplate(template: ReportTemplate): Promise<boolean> {
    try {
      // Check if template has required fields
      if (!template.template_name || !template.template_type || !template.template_content) {
        return false;
      }

      // Check orientation
      if (!['portrait', 'landscape'].includes(template.orientation)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validateMetric(metric: ReportMetric): Promise<boolean> {
    try {
      // Check if metric has required fields
      if (!metric.metric_name || !metric.metric_type || !metric.data_source) {
        return false;
      }

      // Check decimal places
      if (metric.decimal_places < 0 || metric.decimal_places > 10) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validateDashboard(dashboard: ReportDashboard): Promise<boolean> {
    try {
      // Check if dashboard has required fields
      if (!dashboard.dashboard_name || !dashboard.layout_config || !dashboard.widgets) {
        return false;
      }

      // Check refresh interval
      if (dashboard.refresh_interval < 60 || dashboard.refresh_interval > 3600) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const statisticalReportsApiService = new StatisticalReportsApiService();
export default statisticalReportsApiService;
