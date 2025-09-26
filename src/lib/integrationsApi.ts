import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for Health Plans and Telemedicine Integrations Module
export interface HealthPlanIntegration {
  id: number;
  integration_name: string;
  health_plan_id: number;
  integration_type: 'health_plan' | 'telemedicine' | 'emr' | 'laboratory' | 'imaging' | 'pharmacy' | 'payment';
  api_endpoint: string;
  api_version?: string;
  authentication_method: string;
  client_id?: string;
  client_secret?: string;
  api_key?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  configuration?: Record<string, any>;
  webhook_url?: string;
  webhook_secret?: string;
  status: 'active' | 'inactive' | 'pending' | 'error' | 'maintenance';
  last_sync?: string;
  last_success?: string;
  last_error?: string;
  error_count: number;
  plan_code?: string;
  plan_name?: string;
  coverage_details?: Record<string, any>;
  copayment_info?: Record<string, any>;
  authorization_required: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface TelemedicineIntegration {
  id: number;
  integration_name: string;
  provider: 'zoom' | 'teams' | 'google_meet' | 'webex' | 'custom';
  api_endpoint: string;
  api_key?: string;
  api_secret?: string;
  webhook_url?: string;
  webhook_secret?: string;
  authentication_method: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  configuration?: Record<string, any>;
  default_settings?: Record<string, any>;
  status: 'active' | 'inactive' | 'pending' | 'error' | 'maintenance';
  last_sync?: string;
  last_success?: string;
  last_error?: string;
  error_count: number;
  max_participants: number;
  recording_enabled: boolean;
  waiting_room_enabled: boolean;
  breakout_rooms_enabled: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface TelemedicineSession {
  id: number;
  session_id: string;
  integration_id: number;
  appointment_id?: number;
  patient_id: number;
  doctor_id: number;
  session_title: string;
  session_description?: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  provider_session_id?: string;
  meeting_url?: string;
  meeting_password?: string;
  dial_in_numbers?: Record<string, any>;
  status: string;
  participants?: Record<string, any>;
  recording_url?: string;
  transcript_url?: string;
  session_data?: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface IntegrationSyncLog {
  id: number;
  integration_id?: number;
  telemedicine_integration_id?: number;
  sync_type: string;
  sync_start: string;
  sync_end?: string;
  status: string;
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  error_message?: string;
  error_details?: Record<string, any>;
  sync_data?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface HealthPlanAuthorization {
  id: number;
  authorization_number: string;
  integration_id: number;
  patient_id: number;
  doctor_id: number;
  procedure_id?: number;
  procedure_code: string;
  procedure_description: string;
  requested_date: string;
  urgency_level: string;
  request_data: Record<string, any>;
  request_sent_at?: string;
  response_data?: Record<string, any>;
  response_received_at?: string;
  authorization_status: string;
  authorized_amount?: number;
  copayment_amount?: number;
  authorization_valid_until?: string;
  authorization_notes?: string;
  status: string;
  error_message?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface IntegrationWebhook {
  id: number;
  webhook_name: string;
  integration_id?: number;
  telemedicine_integration_id?: number;
  webhook_url: string;
  webhook_secret?: string;
  events: string[];
  authentication_method: string;
  auth_username?: string;
  auth_password?: string;
  auth_token?: string;
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
  last_triggered?: string;
  success_count: number;
  failure_count: number;
  last_error?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface WebhookLog {
  id: number;
  webhook_id: number;
  request_url: string;
  request_method: string;
  request_headers?: Record<string, any>;
  request_body?: string;
  response_status?: number;
  response_headers?: Record<string, any>;
  response_body?: string;
  response_time_ms?: number;
  executed_at: string;
  success: boolean;
  error_message?: string;
  retry_count: number;
  event_type?: string;
  event_data?: Record<string, any>;
}

export interface IntegrationHealthCheck {
  id: number;
  integration_id?: number;
  telemedicine_integration_id?: number;
  check_type: string;
  check_start: string;
  check_end?: string;
  status: string;
  response_time_ms?: number;
  error_message?: string;
  metrics?: Record<string, any>;
  details?: Record<string, any>;
  created_at: string;
}

// Request/Response types
export interface IntegrationSearchRequest {
  integration_name?: string;
  integration_type?: string;
  status?: string;
  provider?: string;
  created_by?: number;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

export interface TelemedicineSessionSearchRequest {
  integration_id?: number;
  patient_id?: number;
  doctor_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

export interface AuthorizationSearchRequest {
  integration_id?: number;
  patient_id?: number;
  doctor_id?: number;
  authorization_status?: string;
  procedure_code?: string;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

export interface IntegrationSyncRequest {
  integration_id: number;
  sync_type?: string;
  force_sync?: boolean;
}

export interface TelemedicineSessionRequest {
  integration_id: number;
  patient_id: number;
  doctor_id: number;
  session_title: string;
  session_description?: string;
  scheduled_start: string;
  scheduled_end: string;
  appointment_id?: number;
}

export interface AuthorizationRequest {
  integration_id: number;
  patient_id: number;
  doctor_id: number;
  procedure_code: string;
  procedure_description: string;
  requested_date: string;
  urgency_level?: string;
  procedure_id?: number;
}

export interface IntegrationSummary {
  total_integrations: number;
  active_integrations: number;
  health_plan_integrations: number;
  telemedicine_integrations: number;
  integrations_by_status: Record<string, number>;
  integrations_by_type: Record<string, number>;
  total_sessions: number;
  active_sessions: number;
  total_authorizations: number;
  pending_authorizations: number;
}

export interface IntegrationAnalytics {
  total_integrations: number;
  active_integrations: number;
  failed_integrations: number;
  integrations_by_provider: Record<string, number>;
  session_statistics: Record<string, number>;
  authorization_statistics: Record<string, number>;
  sync_statistics: Record<string, number>;
  webhook_statistics: Record<string, number>;
  health_check_results: Record<string, number>;
  performance_metrics: Record<string, number>;
}

// Integrations API Service
class IntegrationsApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://prontivus-backend-pa1e.onrender.com',
      timeout: 60000, // Increased timeout for integration operations
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

  // Health Plan Integration methods
  async getHealthPlanIntegrations(params?: IntegrationSearchRequest): Promise<HealthPlanIntegration[]> {
    const response = await this.api.get('/api/v1/integrations/health-plan', { params });
    return response.data;
  }

  async getHealthPlanIntegration(id: number): Promise<HealthPlanIntegration> {
    const response = await this.api.get(`/api/v1/integrations/health-plan/${id}`);
    return response.data;
  }

  async createHealthPlanIntegration(integration: Partial<HealthPlanIntegration>): Promise<HealthPlanIntegration> {
    const response = await this.api.post('/api/v1/integrations/health-plan', integration);
    return response.data;
  }

  async updateHealthPlanIntegration(id: number, integration: Partial<HealthPlanIntegration>): Promise<HealthPlanIntegration> {
    const response = await this.api.put(`/api/v1/integrations/health-plan/${id}`, integration);
    return response.data;
  }

  async testHealthPlanIntegration(id: number): Promise<Record<string, any>> {
    const response = await this.api.post(`/api/v1/integrations/health-plan/${id}/test`);
    return response.data;
  }

  async syncHealthPlanData(request: IntegrationSyncRequest): Promise<IntegrationSyncLog> {
    const response = await this.api.post(`/api/v1/integrations/health-plan/${request.integration_id}/sync`, request);
    return response.data;
  }

  // Telemedicine Integration methods
  async getTelemedicineIntegrations(params?: IntegrationSearchRequest): Promise<TelemedicineIntegration[]> {
    const response = await this.api.get('/api/v1/integrations/telemedicine', { params });
    return response.data;
  }

  async getTelemedicineIntegration(id: number): Promise<TelemedicineIntegration> {
    const response = await this.api.get(`/api/v1/integrations/telemedicine/${id}`);
    return response.data;
  }

  async createTelemedicineIntegration(integration: Partial<TelemedicineIntegration>): Promise<TelemedicineIntegration> {
    const response = await this.api.post('/api/v1/integrations/telemedicine', integration);
    return response.data;
  }

  async updateTelemedicineIntegration(id: number, integration: Partial<TelemedicineIntegration>): Promise<TelemedicineIntegration> {
    const response = await this.api.put(`/api/v1/integrations/telemedicine/${id}`, integration);
    return response.data;
  }

  async testTelemedicineIntegration(id: number): Promise<Record<string, any>> {
    const response = await this.api.post(`/api/v1/integrations/telemedicine/${id}/test`);
    return response.data;
  }

  // Telemedicine Session methods
  async getTelemedicineSessions(params?: TelemedicineSessionSearchRequest): Promise<TelemedicineSession[]> {
    const response = await this.api.get('/api/v1/integrations/telemedicine/sessions', { params });
    return response.data;
  }

  async getTelemedicineSession(id: number): Promise<TelemedicineSession> {
    const response = await this.api.get(`/api/v1/integrations/telemedicine/sessions/${id}`);
    return response.data;
  }

  async createTelemedicineSession(request: TelemedicineSessionRequest): Promise<TelemedicineSession> {
    const response = await this.api.post('/api/v1/integrations/telemedicine/sessions', request);
    return response.data;
  }

  async updateTelemedicineSession(id: number, session: Partial<TelemedicineSession>): Promise<TelemedicineSession> {
    const response = await this.api.put(`/api/v1/integrations/telemedicine/sessions/${id}`, session);
    return response.data;
  }

  async startTelemedicineSession(id: number): Promise<TelemedicineSession> {
    const response = await this.api.post(`/api/v1/integrations/telemedicine/sessions/${id}/start`);
    return response.data;
  }

  async endTelemedicineSession(id: number): Promise<TelemedicineSession> {
    const response = await this.api.post(`/api/v1/integrations/telemedicine/sessions/${id}/end`);
    return response.data;
  }

  // Health Plan Authorization methods
  async getHealthPlanAuthorizations(params?: AuthorizationSearchRequest): Promise<HealthPlanAuthorization[]> {
    const response = await this.api.get('/api/v1/integrations/authorizations', { params });
    return response.data;
  }

  async getHealthPlanAuthorization(id: number): Promise<HealthPlanAuthorization> {
    const response = await this.api.get(`/api/v1/integrations/authorizations/${id}`);
    return response.data;
  }

  async createHealthPlanAuthorization(request: AuthorizationRequest): Promise<HealthPlanAuthorization> {
    const response = await this.api.post('/api/v1/integrations/authorizations', request);
    return response.data;
  }

  async updateHealthPlanAuthorization(id: number, authorization: Partial<HealthPlanAuthorization>): Promise<HealthPlanAuthorization> {
    const response = await this.api.put(`/api/v1/integrations/authorizations/${id}`, authorization);
    return response.data;
  }

  // Webhook methods
  async getIntegrationWebhooks(params?: {
    skip?: number;
    limit?: number;
  }): Promise<IntegrationWebhook[]> {
    const response = await this.api.get('/api/v1/integrations/webhooks', { params });
    return response.data;
  }

  async getIntegrationWebhook(id: number): Promise<IntegrationWebhook> {
    const response = await this.api.get(`/api/v1/integrations/webhooks/${id}`);
    return response.data;
  }

  async createIntegrationWebhook(webhook: Partial<IntegrationWebhook>): Promise<IntegrationWebhook> {
    const response = await this.api.post('/api/v1/integrations/webhooks', webhook);
    return response.data;
  }

  async processWebhookEvent(webhookId: number, eventData: Record<string, any>): Promise<WebhookLog> {
    const response = await this.api.post(`/api/v1/integrations/webhooks/${webhookId}/process`, eventData);
    return response.data;
  }

  // Health Check methods
  async performIntegrationHealthCheck(integrationId: number, checkType: string = 'connectivity'): Promise<IntegrationHealthCheck> {
    const response = await this.api.post(`/api/v1/integrations/health-check/${integrationId}?check_type=${checkType}`);
    return response.data;
  }

  // Summary and Analytics methods
  async getIntegrationSummary(): Promise<IntegrationSummary> {
    const response = await this.api.get('/api/v1/integrations/summary');
    return response.data;
  }

  async getIntegrationAnalytics(): Promise<IntegrationAnalytics> {
    const response = await this.api.get('/api/v1/integrations/analytics');
    return response.data;
  }

  // Utility methods
  async searchHealthPlanIntegrationsByStatus(status: string): Promise<HealthPlanIntegration[]> {
    return this.getHealthPlanIntegrations({ status, limit: 100 });
  }

  async searchTelemedicineIntegrationsByProvider(provider: string): Promise<TelemedicineIntegration[]> {
    return this.getTelemedicineIntegrations({ provider, limit: 100 });
  }

  async getActiveHealthPlanIntegrations(): Promise<HealthPlanIntegration[]> {
    return this.getHealthPlanIntegrations({ status: 'active', limit: 100 });
  }

  async getActiveTelemedicineIntegrations(): Promise<TelemedicineIntegration[]> {
    return this.getTelemedicineIntegrations({ status: 'active', limit: 100 });
  }

  async getScheduledTelemedicineSessions(): Promise<TelemedicineSession[]> {
    return this.getTelemedicineSessions({ status: 'scheduled', limit: 100 });
  }

  async getActiveTelemedicineSessions(): Promise<TelemedicineSession[]> {
    return this.getTelemedicineSessions({ status: 'started', limit: 100 });
  }

  async getPendingAuthorizations(): Promise<HealthPlanAuthorization[]> {
    return this.getHealthPlanAuthorizations({ authorization_status: 'pending', limit: 100 });
  }

  async getApprovedAuthorizations(): Promise<HealthPlanAuthorization[]> {
    return this.getHealthPlanAuthorizations({ authorization_status: 'approved', limit: 100 });
  }

  async getActiveWebhooks(): Promise<IntegrationWebhook[]> {
    return this.getIntegrationWebhooks({ limit: 100 });
  }

  // Quick access methods for common operations
  async getHealthPlanIntegrationByName(integrationName: string): Promise<HealthPlanIntegration | null> {
    try {
      const integrations = await this.getHealthPlanIntegrations({ integration_name: integrationName, limit: 1 });
      return integrations.find(i => i.integration_name === integrationName) || null;
    } catch (error) {
      return null;
    }
  }

  async getTelemedicineIntegrationByName(integrationName: string): Promise<TelemedicineIntegration | null> {
    try {
      const integrations = await this.getTelemedicineIntegrations({ integration_name: integrationName, limit: 1 });
      return integrations.find(i => i.integration_name === integrationName) || null;
    } catch (error) {
      return null;
    }
  }

  async getTelemedicineSessionBySessionId(sessionId: string): Promise<TelemedicineSession | null> {
    try {
      const sessions = await this.getTelemedicineSessions({ limit: 1 });
      return sessions.find(s => s.session_id === sessionId) || null;
    } catch (error) {
      return null;
    }
  }

  async getAuthorizationByNumber(authorizationNumber: string): Promise<HealthPlanAuthorization | null> {
    try {
      const authorizations = await this.getHealthPlanAuthorizations({ limit: 1 });
      return authorizations.find(a => a.authorization_number === authorizationNumber) || null;
    } catch (error) {
      return null;
    }
  }

  // Validation methods
  async validateHealthPlanIntegration(integration: HealthPlanIntegration): Promise<boolean> {
    try {
      // Check if integration has required fields
      if (!integration.integration_name || !integration.health_plan_id || !integration.api_endpoint) {
        return false;
      }

      // Check authentication method
      if (!integration.authentication_method) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validateTelemedicineIntegration(integration: TelemedicineIntegration): Promise<boolean> {
    try {
      // Check if integration has required fields
      if (!integration.integration_name || !integration.provider || !integration.api_endpoint) {
        return false;
      }

      // Check authentication method
      if (!integration.authentication_method) {
        return false;
      }

      // Check max participants
      if (integration.max_participants < 1 || integration.max_participants > 1000) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validateTelemedicineSession(session: TelemedicineSession): Promise<boolean> {
    try {
      // Check if session has required fields
      if (!session.integration_id || !session.patient_id || !session.doctor_id) {
        return false;
      }

      // Check session title
      if (!session.session_title) {
        return false;
      }

      // Check scheduled times
      if (!session.scheduled_start || !session.scheduled_end) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validateAuthorization(authorization: HealthPlanAuthorization): Promise<boolean> {
    try {
      // Check if authorization has required fields
      if (!integration.integration_id || !authorization.patient_id || !authorization.doctor_id) {
        return false;
      }

      // Check procedure information
      if (!authorization.procedure_code || !authorization.procedure_description) {
        return false;
      }

      // Check requested date
      if (!authorization.requested_date) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const integrationsApiService = new IntegrationsApiService();
export default integrationsApiService;
