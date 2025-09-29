/**
 * TISS Integration Service
 * Frontend service for TISS (Troca de Informação em Saúde Suplementar) integration
 */

import apiService from './api';

export interface TISSInsuranceOperator {
  id: number;
  name: string;
  code: string;
  cnpj?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TISSCredentials {
  id: number;
  tenant_id: number;
  operator_id: number;
  environment: 'homologation' | 'production';
  username: string;
  password: string;
  token?: string;
  homologation_url?: string;
  production_url?: string;
  requires_doctor_identification: boolean;
  additional_config?: Record<string, any>;
  is_active: boolean;
  last_connection_success?: string;
  last_connection_error?: string;
  connection_status: string;
  created_at: string;
  updated_at?: string;
}

export interface TISSDoctorCode {
  id: number;
  doctor_id: number;
  operator_id: number;
  doctor_code: string;
  crm?: string;
  cpf?: string;
  specialty_code?: string;
  additional_info?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TISSConfiguration {
  id: number;
  tenant_id: number;
  is_enabled: boolean;
  default_environment: 'homologation' | 'production';
  sadt_enabled: boolean;
  sadt_auto_generate: boolean;
  billing_enabled: boolean;
  auto_billing: boolean;
  notify_on_error: boolean;
  notify_email?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface TISSDashboardData {
  total_operators: number;
  active_operators: number;
  total_credentials: number;
  active_credentials: number;
  recent_transactions: number;
  success_rate: number;
  last_connection_status: {
    status: string;
    last_success?: string;
    last_error?: string;
  };
}

export interface TISSOperatorStatus {
  operator_id: number;
  operator_name: string;
  environment: string;
  connection_status: string;
  last_connection_success?: string;
  last_connection_error?: string;
  is_active: boolean;
}

export interface TISSOperatorsStatus {
  operators: TISSOperatorStatus[];
  total_operators: number;
  active_operators: number;
  error_operators: number;
}

export interface TISSCredentialsTestResponse {
  success: boolean;
  message: string;
  connection_time?: number;
  response_data?: Record<string, any>;
}

class TISSService {
  private baseUrl = '/api/v1/tiss';

  // Insurance Operators
  async getInsuranceOperators(activeOnly: boolean = true): Promise<TISSInsuranceOperator[]> {
    const response = await apiService.get(`${this.baseUrl}/operators?active_only=${activeOnly}`);
    return response.data;
  }

  async createInsuranceOperator(operatorData: Partial<TISSInsuranceOperator>): Promise<TISSInsuranceOperator> {
    const response = await apiService.post(`${this.baseUrl}/operators`, operatorData);
    return response.data;
  }

  async getInsuranceOperator(operatorId: number): Promise<TISSInsuranceOperator> {
    const response = await apiService.get(`${this.baseUrl}/operators/${operatorId}`);
    return response.data;
  }

  async updateInsuranceOperator(operatorId: number, operatorData: Partial<TISSInsuranceOperator>): Promise<TISSInsuranceOperator> {
    const response = await apiService.put(`${this.baseUrl}/operators/${operatorId}`, operatorData);
    return response.data;
  }

  // Credentials
  async getCredentials(operatorId?: number): Promise<TISSCredentials[]> {
    const url = operatorId 
      ? `${this.baseUrl}/credentials?operator_id=${operatorId}`
      : `${this.baseUrl}/credentials`;
    const response = await apiService.get(url);
    return response.data;
  }

  async createCredentials(credentialsData: Partial<TISSCredentials>): Promise<TISSCredentials> {
    const response = await apiService.post(`${this.baseUrl}/credentials`, credentialsData);
    return response.data;
  }

  async getCredentialsById(credentialsId: number): Promise<TISSCredentials> {
    const response = await apiService.get(`${this.baseUrl}/credentials/${credentialsId}`);
    return response.data;
  }

  async updateCredentials(credentialsId: number, credentialsData: Partial<TISSCredentials>): Promise<TISSCredentials> {
    const response = await apiService.put(`${this.baseUrl}/credentials/${credentialsId}`, credentialsData);
    return response.data;
  }

  async testCredentials(credentialsId: number): Promise<TISSCredentialsTestResponse> {
    const response = await apiService.post(`${this.baseUrl}/credentials/${credentialsId}/test`);
    return response.data;
  }

  // Doctor Codes
  async getDoctorCodes(doctorId?: number, operatorId?: number): Promise<TISSDoctorCode[]> {
    const params = new URLSearchParams();
    if (doctorId) params.append('doctor_id', doctorId.toString());
    if (operatorId) params.append('operator_id', operatorId.toString());
    
    const url = params.toString() 
      ? `${this.baseUrl}/doctor-codes?${params.toString()}`
      : `${this.baseUrl}/doctor-codes`;
    
    const response = await apiService.get(url);
    return response.data;
  }

  async createDoctorCode(doctorCodeData: Partial<TISSDoctorCode>): Promise<TISSDoctorCode> {
    const response = await apiService.post(`${this.baseUrl}/doctor-codes`, doctorCodeData);
    return response.data;
  }

  async updateDoctorCode(doctorCodeId: number, doctorCodeData: Partial<TISSDoctorCode>): Promise<TISSDoctorCode> {
    const response = await apiService.put(`${this.baseUrl}/doctor-codes/${doctorCodeId}`, doctorCodeData);
    return response.data;
  }

  // Configuration
  async getConfiguration(): Promise<TISSConfiguration> {
    const response = await apiService.get(`${this.baseUrl}/configuration`);
    return response.data;
  }

  async createOrUpdateConfiguration(configData: Partial<TISSConfiguration>): Promise<TISSConfiguration> {
    const response = await apiService.post(`${this.baseUrl}/configuration`, configData);
    return response.data;
  }

  // Dashboard and Status
  async getDashboardData(): Promise<TISSDashboardData> {
    const response = await apiService.get(`${this.baseUrl}/dashboard`);
    return response.data;
  }

  async getOperatorsStatus(): Promise<TISSOperatorsStatus> {
    const response = await apiService.get(`${this.baseUrl}/operators-status`);
    return response.data;
  }

  // Utility methods
  maskPassword(password: string): string {
    if (!password) return '';
    return '*'.repeat(Math.min(password.length, 8));
  }

  maskToken(token: string): string {
    if (!token) return '';
    return token.substring(0, 8) + '*'.repeat(Math.max(token.length - 8, 0));
  }

  getEnvironmentLabel(environment: string): string {
    switch (environment) {
      case 'homologation':
        return 'Homologação';
      case 'production':
        return 'Produção';
      default:
        return environment;
    }
  }

  getConnectionStatusLabel(status: string): string {
    switch (status) {
      case 'success':
        return 'Conectado';
      case 'error':
        return 'Erro';
      case 'unknown':
        return 'Desconhecido';
      default:
        return status;
    }
  }

  getConnectionStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'unknown':
        return 'warning';
      default:
        return 'default';
    }
  }

  /**
   * Get TISS credentials for settings page
   */
  async getCredentialsForSettings(): Promise<TISSCredentials[]> {
    try {
      const response = await apiService.get('/api/v1/tiss/credentials');
      return response.data;
    } catch (error) {
      console.error('Error fetching TISS credentials:', error);
      throw error;
    }
  }

  /**
   * Save TISS credentials
   */
  async saveCredentialsForSettings(credentials: TISSCredentials[]): Promise<void> {
    try {
      await apiService.post('/api/v1/tiss/credentials/bulk', { credentials });
    } catch (error) {
      console.error('Error saving TISS credentials:', error);
      throw error;
    }
  }

  /**
   * Test TISS credentials connection
   */
  async testCredentialsConnection(credential: TISSCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiService.post('/api/v1/tiss/credentials/test', credential);
      return response.data;
    } catch (error: any) {
      console.error('Error testing TISS credentials:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Erro desconhecido ao testar conexão'
      };
    }
  }

  /**
   * Get doctor codes for TISS
   */
  async getDoctorCodesForSettings(): Promise<TISSDoctorCode[]> {
    try {
      const response = await apiService.get('/api/v1/tiss/doctor-codes');
      return response.data;
    } catch (error) {
      console.error('Error fetching TISS doctor codes:', error);
      throw error;
    }
  }

  /**
   * Save doctor codes
   */
  async saveDoctorCodesForSettings(doctorCodes: TISSDoctorCode[]): Promise<void> {
    try {
      await apiService.post('/api/v1/tiss/doctor-codes/bulk', { doctorCodes });
    } catch (error) {
      console.error('Error saving TISS doctor codes:', error);
      throw error;
    }
  }
}

export default new TISSService();
