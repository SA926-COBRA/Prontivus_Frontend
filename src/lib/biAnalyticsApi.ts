import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for BI Analytics Module
export interface ClinicalMetric {
  id: number;
  metric_name: string;
  metric_type: 'clinical' | 'financial' | 'operational' | 'quality' | 'patient_satisfaction' | 'staff_performance';
  description?: string;
  target_value?: number;
  threshold_warning?: number;
  threshold_critical?: number;
  unit?: string;
  calculation_method: string;
  data_source: string;
  filters?: Record<string, any>;
  status: 'active' | 'inactive' | 'archived';
  is_system_metric: boolean;
  requires_permission: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface MetricValue {
  id: number;
  metric_id: number;
  value: number;
  period_start: string;
  period_end: string;
  period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  department_id?: number;
  doctor_id?: number;
  patient_id?: number;
  calculated_at: string;
  data_points_count?: number;
  confidence_score?: number;
}

export interface MetricAlert {
  id: number;
  metric_id: number;
  alert_type: 'warning' | 'critical' | 'info';
  threshold_breached: number;
  current_value: number;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged_by?: number;
  acknowledged_at?: string;
  resolved_by?: number;
  resolved_at?: string;
  triggered_at: string;
  created_by?: number;
}

export interface Dashboard {
  id: number;
  name: string;
  description?: string;
  layout_config: Record<string, any>;
  filters_config?: Record<string, any>;
  refresh_interval: number;
  is_public: boolean;
  is_system_dashboard: boolean;
  requires_permission: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface DashboardWidget {
  id: number;
  dashboard_id: number;
  widget_type: 'chart' | 'table' | 'metric' | 'kpi';
  title: string;
  description?: string;
  config: Record<string, any>;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  metric_id?: number;
  data_query?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BIReport {
  id: number;
  report_name: string;
  description?: string;
  report_type: 'executive' | 'operational' | 'clinical' | 'financial';
  template_config: Record<string, any>;
  data_queries: Record<string, any>;
  is_scheduled: boolean;
  schedule_frequency?: 'daily' | 'weekly' | 'monthly';
  schedule_time?: string;
  email_recipients?: string[];
  notification_enabled: boolean;
  is_active: boolean;
  last_generated?: string;
  next_generation?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface AnalyticsInsight {
  id: number;
  insight_type: 'trend' | 'anomaly' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  confidence_score: number;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  category: 'clinical' | 'financial' | 'operational' | 'quality';
  related_metrics?: number[];
  data_period_start?: string;
  data_period_end?: string;
  ai_model_version?: string;
  processing_parameters?: Record<string, any>;
  status: 'active' | 'reviewed' | 'dismissed' | 'implemented';
  reviewed_by?: number;
  reviewed_at?: string;
  action_taken?: string;
  generated_at: string;
  created_by?: number;
}

export interface PerformanceComparison {
  metric_id: number;
  metric_name: string;
  current_value: number;
  target_value: number;
  industry_average?: number;
  peer_average?: number;
  performance_score: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
}

export interface BIInsightsSummary {
  total_insights: number;
  insights_by_type: Record<string, number>;
  insights_by_category: Record<string, number>;
  high_impact_insights: number;
  unread_insights: number;
  recent_insights: Array<{
    id: number;
    title: string;
    type: string;
    category: string;
    impact: string;
    confidence: number;
    generated_at: string;
  }>;
}

export interface DataQualitySummary {
  overall_quality_score: number;
  checks_performed: number;
  issues_found: number;
  issues_resolved: number;
  quality_by_source: Record<string, number>;
  recent_checks: Array<{
    id: number;
    check_date: string;
    quality_score: number;
    issues_found: number;
    total_records: number;
  }>;
}

export interface DashboardData {
  dashboard_id: number;
  dashboard_name: string;
  widgets: Array<{
    widget_id: number;
    widget_type: string;
    title: string;
    config: Record<string, any>;
    data: any;
  }>;
  last_updated: string;
}

// Request/Response types
export interface MetricCalculationRequest {
  metric_id: number;
  period_start: string;
  period_end: string;
  filters?: Record<string, any>;
}

export interface DashboardDataRequest {
  dashboard_id: number;
  filters?: Record<string, any>;
  refresh_cache?: boolean;
}

export interface BIReportGenerationRequest {
  report_id: number;
  data_period_start?: string;
  data_period_end?: string;
  include_insights?: boolean;
  format?: 'pdf' | 'excel' | 'html';
}

export interface AnalyticsInsightRequest {
  category?: string;
  insight_type?: string;
  confidence_threshold?: number;
  impact_level?: string;
  data_period_days?: number;
}

// BI Analytics API Service
class BIAnalyticsApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://prontivus-backend-pa1e.onrender.com',
      timeout: 60000, // Increased timeout for BI operations
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

  // Clinical Metrics
  async getClinicalMetrics(params?: {
    skip?: number;
    limit?: number;
    metric_type?: string;
    status?: string;
  }): Promise<ClinicalMetric[]> {
    const response = await this.api.get('/api/v1/bi-analytics/metrics', { params });
    return response.data;
  }

  async getClinicalMetric(id: number): Promise<ClinicalMetric> {
    const response = await this.api.get(`/api/v1/bi-analytics/metrics/${id}`);
    return response.data;
  }

  async createClinicalMetric(metric: Partial<ClinicalMetric>): Promise<ClinicalMetric> {
    const response = await this.api.post('/api/v1/bi-analytics/metrics', metric);
    return response.data;
  }

  async updateClinicalMetric(id: number, metric: Partial<ClinicalMetric>): Promise<ClinicalMetric> {
    const response = await this.api.put(`/api/v1/bi-analytics/metrics/${id}`, metric);
    return response.data;
  }

  async deleteClinicalMetric(id: number): Promise<void> {
    await this.api.delete(`/api/v1/bi-analytics/metrics/${id}`);
  }

  // Metric Calculation
  async calculateMetric(request: MetricCalculationRequest): Promise<any> {
    const response = await this.api.post('/api/v1/bi-analytics/metrics/calculate', request);
    return response.data;
  }

  // Metric Values
  async getMetricValues(params?: {
    skip?: number;
    limit?: number;
    metric_id?: number;
    period_type?: string;
  }): Promise<MetricValue[]> {
    const response = await this.api.get('/api/v1/bi-analytics/metric-values', { params });
    return response.data;
  }

  async getMetricValue(id: number): Promise<MetricValue> {
    const response = await this.api.get(`/api/v1/bi-analytics/metric-values/${id}`);
    return response.data;
  }

  // Metric Alerts
  async getMetricAlerts(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    alert_type?: string;
  }): Promise<MetricAlert[]> {
    const response = await this.api.get('/api/v1/bi-analytics/alerts', { params });
    return response.data;
  }

  async getMetricAlert(id: number): Promise<MetricAlert> {
    const response = await this.api.get(`/api/v1/bi-analytics/alerts/${id}`);
    return response.data;
  }

  async acknowledgeMetricAlert(id: number): Promise<MetricAlert> {
    const response = await this.api.put(`/api/v1/bi-analytics/alerts/${id}/acknowledge`);
    return response.data;
  }

  async resolveMetricAlert(id: number): Promise<MetricAlert> {
    const response = await this.api.put(`/api/v1/bi-analytics/alerts/${id}/resolve`);
    return response.data;
  }

  // Dashboards
  async getDashboards(params?: {
    skip?: number;
    limit?: number;
    is_public?: boolean;
  }): Promise<Dashboard[]> {
    const response = await this.api.get('/api/v1/bi-analytics/dashboards', { params });
    return response.data;
  }

  async getDashboard(id: number): Promise<Dashboard> {
    const response = await this.api.get(`/api/v1/bi-analytics/dashboards/${id}`);
    return response.data;
  }

  async createDashboard(dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const response = await this.api.post('/api/v1/bi-analytics/dashboards', dashboard);
    return response.data;
  }

  async updateDashboard(id: number, dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const response = await this.api.put(`/api/v1/bi-analytics/dashboards/${id}`, dashboard);
    return response.data;
  }

  async getDashboardData(id: number, request: DashboardDataRequest): Promise<DashboardData> {
    const response = await this.api.post(`/api/v1/bi-analytics/dashboards/${id}/data`, request);
    return response.data;
  }

  // Dashboard Widgets
  async getDashboardWidgets(dashboardId: number): Promise<DashboardWidget[]> {
    const response = await this.api.get(`/api/v1/bi-analytics/dashboards/${dashboardId}/widgets`);
    return response.data;
  }

  async createDashboardWidget(dashboardId: number, widget: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const response = await this.api.post(`/api/v1/bi-analytics/dashboards/${dashboardId}/widgets`, widget);
    return response.data;
  }

  async updateDashboardWidget(id: number, widget: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const response = await this.api.put(`/api/v1/bi-analytics/widgets/${id}`, widget);
    return response.data;
  }

  async deleteDashboardWidget(id: number): Promise<void> {
    await this.api.delete(`/api/v1/bi-analytics/widgets/${id}`);
  }

  // BI Reports
  async getBIReports(params?: {
    skip?: number;
    limit?: number;
    report_type?: string;
  }): Promise<BIReport[]> {
    const response = await this.api.get('/api/v1/bi-analytics/reports', { params });
    return response.data;
  }

  async getBIReport(id: number): Promise<BIReport> {
    const response = await this.api.get(`/api/v1/bi-analytics/reports/${id}`);
    return response.data;
  }

  async createBIReport(report: Partial<BIReport>): Promise<BIReport> {
    const response = await this.api.post('/api/v1/bi-analytics/reports', report);
    return response.data;
  }

  async generateBIReport(id: number, request: BIReportGenerationRequest): Promise<any> {
    const response = await this.api.post(`/api/v1/bi-analytics/reports/${id}/generate`, request);
    return response.data;
  }

  // Analytics Insights
  async getAnalyticsInsights(params?: {
    skip?: number;
    limit?: number;
    insight_type?: string;
    category?: string;
    status?: string;
  }): Promise<AnalyticsInsight[]> {
    const response = await this.api.get('/api/v1/bi-analytics/insights', { params });
    return response.data;
  }

  async getAnalyticsInsight(id: number): Promise<AnalyticsInsight> {
    const response = await this.api.get(`/api/v1/bi-analytics/insights/${id}`);
    return response.data;
  }

  async generateAnalyticsInsights(request: AnalyticsInsightRequest): Promise<AnalyticsInsight[]> {
    const response = await this.api.post('/api/v1/bi-analytics/insights/generate', request);
    return response.data;
  }

  async reviewAnalyticsInsight(id: number, status: string, actionTaken?: string): Promise<AnalyticsInsight> {
    const response = await this.api.put(`/api/v1/bi-analytics/insights/${id}/review`, {
      status,
      action_taken: actionTaken
    });
    return response.data;
  }

  // Performance Comparison
  async getPerformanceComparison(metricId: number): Promise<PerformanceComparison> {
    const response = await this.api.get(`/api/v1/bi-analytics/performance/${metricId}/comparison`);
    return response.data;
  }

  // Summary endpoints
  async getBIInsightsSummary(): Promise<BIInsightsSummary> {
    const response = await this.api.get('/api/v1/bi-analytics/insights/summary');
    return response.data;
  }

  async getDataQualitySummary(): Promise<DataQualitySummary> {
    const response = await this.api.get('/api/v1/bi-analytics/data-quality/summary');
    return response.data;
  }

  // Utility methods
  async getMetricTrend(metricId: number, days: number = 30): Promise<any> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const values = await this.getMetricValues({
      metric_id: metricId,
      limit: 100
    });
    
    // Filter values by date range
    const filteredValues = values.filter(v => {
      const valueDate = new Date(v.period_start);
      return valueDate >= startDate && valueDate <= endDate;
    });
    
    // Calculate trend
    if (filteredValues.length < 2) {
      return { trend: 'stable', change: 0, values: filteredValues };
    }
    
    const firstValue = filteredValues[0].value;
    const lastValue = filteredValues[filteredValues.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    let trend = 'stable';
    if (change > 5) trend = 'up';
    else if (change < -5) trend = 'down';
    
    return {
      trend,
      change: Math.round(change * 100) / 100,
      values: filteredValues
    };
  }

  async getMetricPerformance(metricId: number): Promise<PerformanceComparison> {
    return this.getPerformanceComparison(metricId);
  }

  async generateInsightsForCategory(category: string, days: number = 30): Promise<AnalyticsInsight[]> {
    const request: AnalyticsInsightRequest = {
      category,
      data_period_days: days,
      confidence_threshold: 0.7
    };
    
    return this.generateAnalyticsInsights(request);
  }

  async getDashboardWithData(dashboardId: number, filters?: Record<string, any>): Promise<DashboardData> {
    const request: DashboardDataRequest = {
      dashboard_id: dashboardId,
      filters,
      refresh_cache: true
    };
    
    return this.getDashboardData(dashboardId, request);
  }

  // Quick access methods for common operations
  async getClinicalKPIs(): Promise<ClinicalMetric[]> {
    return this.getClinicalMetrics({ metric_type: 'clinical', limit: 10 });
  }

  async getFinancialKPIs(): Promise<ClinicalMetric[]> {
    return this.getClinicalMetrics({ metric_type: 'financial', limit: 10 });
  }

  async getOperationalKPIs(): Promise<ClinicalMetric[]> {
    return this.getClinicalMetrics({ metric_type: 'operational', limit: 10 });
  }

  async getQualityKPIs(): Promise<ClinicalMetric[]> {
    return this.getClinicalMetrics({ metric_type: 'quality', limit: 10 });
  }

  async getActiveAlerts(): Promise<MetricAlert[]> {
    return this.getMetricAlerts({ status: 'active', limit: 20 });
  }

  async getHighImpactInsights(): Promise<AnalyticsInsight[]> {
    return this.getAnalyticsInsights({ 
      limit: 10 
    }).then(insights => 
      insights.filter(insight => 
        insight.impact_level === 'high' || insight.impact_level === 'critical'
      )
    );
  }

  async getRecentInsights(days: number = 7): Promise<AnalyticsInsight[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const insights = await this.getAnalyticsInsights({ limit: 50 });
    
    return insights.filter(insight => {
      const generatedDate = new Date(insight.generated_at);
      return generatedDate >= startDate && generatedDate <= endDate;
    });
  }
}

// Export singleton instance
export const biAnalyticsApiService = new BIAnalyticsApiService();
export default biAnalyticsApiService;
