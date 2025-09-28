import apiService from './api';

export interface TelemedicineSession {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'ended' | 'cancelled';
  start_time?: string;
  end_time?: string;
  duration?: number;
  room_url: string;
  patient_url: string;
  recording_enabled: boolean;
  recording_url?: string;
  consent_given: boolean;
  consent_timestamp?: string;
  created_at: string;
  updated_at: string;
}

export interface TelemedicineMessage {
  id: string;
  session_id: string;
  sender_id: string;
  sender_type: 'doctor' | 'patient';
  message_type: 'text' | 'file' | 'system';
  content: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
}

export interface TelemedicineFile {
  id: string;
  session_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

export interface TelemedicineConsent {
  id: string;
  session_id: string;
  patient_id: string;
  consent_type: 'recording' | 'data_processing' | 'telemedicine';
  granted: boolean;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface TelemedicineConfiguration {
  id: string;
  tenant_id: string;
  max_session_duration: number;
  recording_enabled: boolean;
  recording_retention_days: number;
  require_consent: boolean;
  auto_end_after_minutes: number;
  max_participants: number;
  quality_settings: {
    video_resolution: '720p' | '1080p' | 'auto';
    audio_quality: 'standard' | 'high';
    bandwidth_limit: number;
  };
  security_settings: {
    require_authentication: boolean;
    allow_screen_sharing: boolean;
    allow_file_sharing: boolean;
    encrypt_recordings: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface TelemedicineAnalytics {
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  average_duration: number;
  total_duration: number;
  recording_usage: number;
  consent_rate: number;
  quality_metrics: {
    connection_issues: number;
    audio_issues: number;
    video_issues: number;
  };
  monthly_stats: Array<{
    month: string;
    sessions: number;
    duration: number;
    recordings: number;
  }>;
}

class TelemedicineService {
  // Session Management
  async getSessions(params?: {
    status?: string;
    doctor_id?: string;
    patient_id?: string;
    page?: number;
    limit?: number;
  }): Promise<{ sessions: TelemedicineSession[]; total: number }> {
    const response = await apiService.api.get('/api/v1/telemedicine/sessions', { params });
    return response.data;
  }

  async getSession(sessionId: string): Promise<TelemedicineSession> {
    const response = await apiService.api.get(`/api/v1/telemedicine/sessions/${sessionId}`);
    return response.data;
  }

  async createSession(data: {
    patient_id: string;
    doctor_id: string;
    appointment_id?: string;
    scheduled_time?: string;
    recording_enabled?: boolean;
  }): Promise<TelemedicineSession> {
    const response = await apiService.api.post('/api/v1/telemedicine/sessions', data);
    return response.data;
  }

  async updateSession(sessionId: string, data: Partial<TelemedicineSession>): Promise<TelemedicineSession> {
    const response = await apiService.api.put(`/api/v1/telemedicine/sessions/${sessionId}`, data);
    return response.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await apiService.api.delete(`/api/v1/telemedicine/sessions/${sessionId}`);
  }

  // Session Actions
  async joinSession(sessionId: string, userType: 'doctor' | 'patient'): Promise<{ room_url: string; token: string }> {
    const response = await apiService.api.post(`/api/v1/telemedicine/sessions/${sessionId}/join`, {
      user_type: userType
    });
    return response.data;
  }

  async startSession(sessionId: string): Promise<TelemedicineSession> {
    const response = await apiService.api.post(`/api/v1/telemedicine/sessions/${sessionId}/start`);
    return response.data;
  }

  async endSession(sessionId: string): Promise<TelemedicineSession> {
    const response = await apiService.api.post(`/api/v1/telemedicine/sessions/${sessionId}/end`);
    return response.data;
  }

  // Messages
  async getMessages(sessionId: string): Promise<TelemedicineMessage[]> {
    const response = await apiService.api.get(`/api/v1/telemedicine/sessions/${sessionId}/messages`);
    return response.data;
  }

  async sendMessage(sessionId: string, data: {
    message_type: 'text' | 'file';
    content: string;
    file?: File;
  }): Promise<TelemedicineMessage> {
    const formData = new FormData();
    formData.append('message_type', data.message_type);
    formData.append('content', data.content);
    
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await apiService.api.post(`/api/v1/telemedicine/sessions/${sessionId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Files
  async getFiles(sessionId: string): Promise<TelemedicineFile[]> {
    const response = await apiService.api.get(`/api/v1/telemedicine/sessions/${sessionId}/files`);
    return response.data;
  }

  async uploadFile(sessionId: string, file: File): Promise<TelemedicineFile> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiService.api.post(`/api/v1/telemedicine/sessions/${sessionId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Consent
  async getConsent(sessionId: string): Promise<TelemedicineConsent[]> {
    const response = await apiService.api.get(`/api/v1/telemedicine/sessions/${sessionId}/consent`);
    return response.data;
  }

  async giveConsent(sessionId: string, consentType: string, granted: boolean): Promise<TelemedicineConsent> {
    const response = await apiService.api.post(`/api/v1/telemedicine/sessions/${sessionId}/consent`, {
      consent_type: consentType,
      granted
    });
    return response.data;
  }

  // Configuration
  async getConfiguration(): Promise<TelemedicineConfiguration> {
    const response = await apiService.api.get('/api/v1/telemedicine/configuration');
    return response.data;
  }

  async updateConfiguration(data: Partial<TelemedicineConfiguration>): Promise<TelemedicineConfiguration> {
    const response = await apiService.api.put('/api/v1/telemedicine/configuration', data);
    return response.data;
  }

  // Analytics
  async getAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    doctor_id?: string;
  }): Promise<TelemedicineAnalytics> {
    const response = await apiService.api.get('/api/v1/telemedicine/analytics', { params });
    return response.data;
  }

  // Recording
  async startRecording(sessionId: string): Promise<{ recording_id: string }> {
    const response = await apiService.api.post(`/api/v1/telemedicine/sessions/${sessionId}/recording/start`);
    return response.data;
  }

  async stopRecording(sessionId: string): Promise<{ recording_url: string }> {
    const response = await apiService.api.post(`/api/v1/telemedicine/sessions/${sessionId}/recording/stop`);
    return response.data;
  }

  async getRecording(sessionId: string): Promise<{ recording_url: string; duration: number }> {
    const response = await apiService.api.get(`/api/v1/telemedicine/sessions/${sessionId}/recording`);
    return response.data;
  }

  // Patient-specific methods
  async getPatientSessions(patientId: string): Promise<TelemedicineSession[]> {
    const response = await apiService.api.get(`/api/v1/telemedicine/patient/${patientId}/sessions`);
    return response.data;
  }

  async getPatientSessionUrl(sessionId: string): Promise<{ patient_url: string }> {
    const response = await apiService.api.get(`/api/v1/telemedicine/sessions/${sessionId}/patient-url`);
    return response.data;
  }
}

export const telemedicineService = new TelemedicineService();
export default telemedicineService;
